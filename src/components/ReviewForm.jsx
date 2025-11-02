import React from "react";
import { useState } from 'react';
import { auth } from '../firebase';
import { addReview } from '../services/api';

export default function ReviewForm({ movieId, movieTitle }){
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if(!user) return alert('Please sign in first.');
    const token = await user.getIdToken();
    await addReview(token, { movieId, movieTitle, rating, body });
    setBody('');
    alert('Review added!');
  };

  return (
    <form onSubmit={submit} className="mb-4">
      <label className="form-label">Rating (0-5)</label>
      <input type="number" min="0" max="5" value={rating} onChange={e=>setRating(e.target.value)} className="form-control mb-2" />
      <textarea className="form-control mb-2" placeholder="Write your review..." value={body} onChange={e=>setBody(e.target.value)} />
      <button className="btn btn-primary">Submit Review</button>
    </form>
  );
}
