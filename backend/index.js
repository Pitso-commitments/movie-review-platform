// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
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

// Popular
app.get("/api/movies/popular", async (req, res) => {
  try {
    const r = await axios.get(`${TMDB}/movie/popular?api_key=${TMDB_KEY}`);
    res.json(r.data);
  } catch (e) {
    console.error("TMDB error:", e.message);
    res.status(500).json({ error: "TMDB failed" });
  }
});

// Search
app.get("/api/movies/search", async (req, res) => {
  const { query } = req.query;
  try {
    const r = await axios.get(`${TMDB}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Movie details
app.get("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await axios.get(`${TMDB}/movie/${id}?api_key=${TMDB_KEY}`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: "Movie not found" });
  }
});

// ---- Reviews (Firestore) ----
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).send("No token");
  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

app.get("/api/reviews/:movieId", async (req, res) => {
  const snap = await db.collection("reviews").where("movieId", "==", req.params.movieId).get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

app.post("/api/reviews", auth, async (req, res) => {
  const { movieId, rating, reviewText } = req.body;
  const doc = await db.collection("reviews").add({
    userId: req.user.uid,
    movieId,
    rating,
    reviewText,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  res.json({ id: doc.id });
});

app.put("/api/reviews/:id", auth, async (req, res) => {
  const ref = db.collection("reviews").doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== req.user.uid) return res.status(403).send("Forbidden");
  await ref.update(req.body);
  res.send("Updated");
});

app.delete("/api/reviews/:id", auth, async (req, res) => {
  const ref = db.collection("reviews").doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== req.user.uid) return res.status(403).send("Forbidden");
  await ref.delete();
  res.send("Deleted");
});

app.get("/api/user/reviews", auth, async (req, res) => {
  const snap = await db.collection("reviews").where("userId", "==", req.user.uid).get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

// ---- Start ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));