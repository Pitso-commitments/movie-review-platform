import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { Card, Button, Row, Col, Alert, Badge } from "react-bootstrap";

export default function Profile() {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth); // ← Fixed

  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
    if (user) {
      fetchMyReviews();
    }
  }, [user, loading]);

  const fetchMyReviews = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get("http://localhost:5000/api/user/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (loading) return <p className="text-center">Loading user...</p>;
  if (error) return <Alert variant="danger">Error: {error.message}</Alert>;

  return (
    <div className="mt-4">
      <h2>Your Reviews ({myReviews.length})</h2>
      {user && (
        <p>
          Logged in as: <strong>{user.email}</strong> |{" "}
          <Button size="sm" variant="outline-danger" onClick={() => auth.signOut()}>
            Logout
          </Button>
        </p>
      )}

      {loadingReviews ? (
        <p>Loading your reviews...</p>
      ) : myReviews.length === 0 ? (
        <p>No reviews yet. <a href="/">Start reviewing!</a></p>
      ) : (
        <Row>
          {myReviews.map((review) => (
            <Col md={6} lg={4} key={review.id} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>
                    Rating: <Badge bg="primary">{review.rating}/10</Badge>
                  </Card.Title>
                  <Card.Text>{review.reviewText}</Card.Text>
                  <small className="text-muted">
                    {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}
                  </small>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/movie/${review.movieId}`)}
                    >
                      View Movie
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}