import React from "react";
import { useEffect, useState } from 'react';
import { getReviews } from '../services/api';

export default function ReviewList({ movieId }){
  const [reviews, setReviews] = useState([]);
  useEffect(()=>{ if(movieId) getReviews(movieId).then(setReviews); }, [movieId]);
  return (
    <div>
      {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map(r => (
        <div key={r.id} className="card mb-2">
          <div className="card-body">
            <h6>{r.title || ('Rating: ' + r.rating)}</h6>
            <p>{r.body}</p>
            <small>By: {r.userEmail || r.userName}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
