const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

async function verifyAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.*)$/);
  if (!match) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.user = decoded;
    next();
  } catch (e){
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post('/reviews', verifyAuth, async (req, res) => {
  const { movieId, movieTitle, rating, title, body } = req.body;
  if (!movieId || rating === undefined) return res.status(400).json({ error: "Missing fields" });
  const doc = await db.collection('reviews').add({
    movieId, movieTitle, rating, title, body,
    userId: req.user.uid, userEmail: req.user.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  res.json({ id: doc.id });
});

app.get('/reviews', async (req, res) => {
  const movieId = req.query.movieId;
  if (!movieId) return res.status(400).json({ error: "movieId required" });
  const snaps = await db.collection('reviews').where('movieId', '==', movieId).orderBy('createdAt','desc').get();
  res.json(snaps.docs.map(d=>({ id: d.id, ...d.data() })));
});

app.put('/reviews/:id', verifyAuth, async (req, res) => {
  const ref = db.collection('reviews').doc(req.params.id);
  const snap = await ref.get();
  if(!snap.exists) return res.status(404).json({ error: "Not found" });
  if (snap.data().userId !== req.user.uid) return res.status(403).json({ error: "Forbidden" });
  await ref.update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  res.json({ success: true });
});

app.delete('/reviews/:id', verifyAuth, async (req, res) => {
  const ref = db.collection('reviews').doc(req.params.id);
  const snap = await ref.get();
  if(!snap.exists) return res.status(404).json({ error: "Not found" });
  if (snap.data().userId !== req.user.uid) return res.status(403).json({ error: "Forbidden" });
  await ref.delete();
  res.json({ success: true });
});

exports.api = functions.https.onRequest(app);
