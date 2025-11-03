// src/routes/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { api } from "../api";
import { Link } from "react-router-dom";
import { Button, Alert, Spinner, Card } from "react-bootstrap";

export default function Profile() {
  const [user, loadingAuth] = useAuthState(auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const data = await api.getUserReviews(token);
        setReviews(data);
      } catch (err) {
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const handleLogout = () => auth.signOut();

  if (loadingAuth) return <div className="text-center mt-5"><Spinner /></div>;
  if (!user) return <Alert variant="warning">Not logged in</Alert>;

  return (
    <div className="container mt-4">
      <h2>Your Reviews ({reviews.length})</h2>

      <p>
        Logged in as: <strong>{user.email}</strong> | 
        <Button variant="outline-danger" size="sm" className="ms-2" onClick={handleLogout}>
          Logout
        </Button>
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <p>
          No reviews yet. <Link to="/">Start reviewing!</Link>
        </p>
      ) : (
        <div className="row">
          {reviews.map(r => (
            <div key={r.id} className="col-md-6 mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>
                    <Link to={`/movie/${r.movieId}`}>Movie ID: {r.movieId}</Link>
                  </Card.Title>
                  <p><strong>Rating:</strong> {r.rating}/10</p>
                  <p>{r.reviewText}</p>
                  <small className="text-muted">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </small>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}