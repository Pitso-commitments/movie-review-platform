// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();

// ONLY ALLOW YOUR FRONTEND
app.use(cors({
  origin: "https://movie-review-platform-c0a26.web.app"
}));

app.use(express.json());

// ---- Firebase Admin ----
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ---- TMDB ----
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB = "https://api.themoviedb.org/3";

// Popular Movies
app.get("/api/movies/popular", async (req, res) => {
  try {
    const r = await axios.get(`${TMDB}/movie/popular?api_key=${TMDB_KEY}`);
    res.json(r.data);
  } catch (e) {
    console.error("TMDB Popular Error:", e.message);
    res.status(500).json({ error: "TMDB failed" });
  }
});

// Search Movies
app.get("/api/movies/search", async (req, res) => {
  const { query } = req.query;
  if (!query?.trim()) return res.status(400).json({ error: "Query required" });
  try {
    const r = await axios.get(`${TMDB}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`);
    res.json(r.data);
  } catch (e) {
    console.error("TMDB Search Error:", e.message);
    res.status(500).json({ error: "Search failed" });
  }
});

// Movie Details
app.get("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Movie ID required" });
  try {
    const r = await axios.get(`${TMDB}/movie/${id}?api_key=${TMDB_KEY}`);
    res.json(r.data);
  } catch (e) {
    console.error("TMDB Movie Error:", e.message);
    res.status(404).json({ error: "Movie not found" });
  }
});

// ---- Reviews (Firestore) ----
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get Reviews for Movie (NO ORDERBY TO AVOID INDEX ERROR)
app.get("/api/reviews/:movieId", async (req, res) => {
  const { movieId } = req.params;
  if (!movieId) return res.status(400).json({ error: "movieId required" });

  try {
    const snap = await db.collection("reviews")
      .where("movieId", "==", movieId)
      .get();  // Removed .orderBy to avoid index error

    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(reviews || []);  // Always return array
  } catch (err) {
    console.error("Get reviews error:", err.message);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

// Add Review
app.post("/api/reviews", auth, async (req, res) => {
  const { movieId, rating, reviewText } = req.body;
  if (!movieId || !rating || !reviewText?.trim()) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const doc = await db.collection("reviews").add({
      userId: req.user.uid,
      movieId,
      rating: Number(rating),
      reviewText: reviewText.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: doc.id });
  } catch (err) {
    console.error("Post review error:", err.message);
    res.status(500).json({ error: "Submit failed" });
  }
});

// Update Review
app.put("/api/reviews/:id", auth, async (req, res) => {
  const { rating, reviewText } = req.body;
  const ref = db.collection("reviews").doc(req.params.id);
  try {
    const doc = await ref.get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await ref.update({
      rating: Number(rating),
      reviewText: reviewText.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete Review
app.delete("/api/reviews/:id", auth, async (req, res) => {
  const ref = db.collection("reviews").doc(req.params.id);
  try {
    const doc = await ref.get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await ref.delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Get User's Reviews
app.get("/api/user/reviews", auth, async (req, res) => {
  try {
    const snap = await db.collection("reviews")
      .where("userId", "==", req.user.uid)
      .get();
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(reviews || []);
  } catch (err) {
    console.error("User reviews error:", err.message);
    res.status(500).json({ error: "Failed to load" });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Frontend allowed: https://movie-review-platform-c0a26.web.app`);
});