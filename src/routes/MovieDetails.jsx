import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";

export default function MovieDetails() {
  const { id } = useParams();
  const [user, loadingAuth, errorAuth] = useAuthState(auth);

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newReview, setNewReview] = useState({ rating: 5, reviewText: "" });
  const [editingId, setEditingId] = useState(null);
  const [editReview, setEditReview] = useState({ rating: 5, reviewText: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // === FETCH MOVIE & REVIEWS ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, reviewsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/movies/${id}`),
          axios.get(`http://localhost:5000/api/reviews/${id}`),
        ]);
        setMovie(movieRes.data);
        setReviews(reviewsRes.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Is backend running?");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // === CRUD FUNCTIONS ===
  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return setError("Login required");
    if (!newReview.reviewText.trim()) return setError("Review required");

    try {
      const token = await user.getIdToken();
      await axios.post(
        "http://localhost:5000/api/reviews",
        { ...newReview, movieId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReview({ rating: 5, reviewText: "" });
      const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(res.data);
      setError("");
    } catch (err) {
      setError("Submit failed");
    }
  };

  const updateReview = async (e) => {
    e.preventDefault();
    try {
      const token = await user.getIdToken();
      await axios.put(
        `http://localhost:5000/api/reviews/${editingId}`,
        editReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      setError("Update failed");
    }
  };

  const deleteReview = async () => {
    try {
      const token = await user.getIdToken();
      await axios.delete(`http://localhost:5000/api/reviews/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      setError("Delete failed");
    }
  };

  // === CALCULATIONS ===
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const yourReview = user ? reviews.find((r) => r.userId === user.uid) : null;
  const otherReviews = reviews.filter(
    (r) => !user || r.userId !== user.uid
  );

  
  if (loadingAuth)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading user...</p>
      </div>
    );

  if (errorAuth)
    return <Alert variant="danger">Auth error: {errorAuth.message}</Alert>;

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading movie...</p>
      </div>
    );

  if (!movie) return <Alert variant="warning">Movie not found</Alert>;

  // === MAIN UI ===
  return (
    <div className="container mt-4">
      {/* Header */}
      <Row>
        <Col md={4}>
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Poster"
            }
            alt={movie.title}
            className="img-fluid rounded shadow"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
        </Col>
        <Col md={8}>
          <h2>{movie.title}</h2>
          <p className="text-muted">{movie.release_date?.split("-")[0]}</p>
          <p>{movie.overview}</p>
          <h4>
            Average Rating: <Badge bg="warning">{avgRating}/10</Badge>
            {reviews.length > 0 && (
              <small className="ms-2">({reviews.length} reviews)</small>
            )}
          </h4>
        </Col>
      </Row>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {/* Your Review */}
      {yourReview && (
        <Card className="mt-4 border-primary">
          <Card.Header className="bg-primary text-white">Your Review</Card.Header>
          <Card.Body>
            <h5>Rating: {yourReview.rating}/10</h5>
            <p>{yourReview.reviewText}</p>
            <small className="text-muted">
              {new Date(
                yourReview.createdAt?.toDate?.() || yourReview.createdAt
              ).toLocaleDateString()}
            </small>
            <div className="mt-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditingId(yourReview.id);
                  setEditReview({
                    rating: yourReview.rating,
                    reviewText: yourReview.reviewText,
                  });
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                className="ms-2"
                onClick={() => {
                  setDeleteId(yourReview.id);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Other Reviews */}
      {otherReviews.length > 0 && (
        <>
          <h4 className="mt-4">Other Reviews</h4>
          {otherReviews.map((r) => (
            <Card key={r.id} className="mb-3">
              <Card.Body>
                <h6>Rating: {r.rating}/10</h6>
                <p>{r.reviewText}</p>
                <small>
                  By {r.userId.substring(0, 8)}... •{" "}
                  {new Date(
                    r.createdAt?.toDate?.() || r.createdAt
                  ).toLocaleDateString()}
                </small>
              </Card.Body>
            </Card>
          ))}
        </>
      )}

      {/* Add Review */}
      {user && !yourReview && !editingId && (
        <Card className="mt-4">
          <Card.Header>Add Review</Card.Header>
          <Card.Body>
            <Form onSubmit={submitReview}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      rating: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newReview.reviewText}
                  onChange={(e) =>
                    setNewReview({ ...newReview, reviewText: e.target.value })
                  }
                />
              </Form.Group>
              <Button type="submit">Submit</Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Edit Form */}
      {editingId && (
        <Card className="mt-4 border-warning">
          <Card.Header className="bg-warning">Edit Review</Card.Header>
          <Card.Body>
            <Form onSubmit={updateReview}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={editReview.rating}
                  onChange={(e) =>
                    setEditReview({
                      ...editReview,
                      rating: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editReview.reviewText}
                  onChange={(e) =>
                    setEditReview({ ...editReview, reviewText: e.target.value })
                  }
                />
              </Form.Group>
              <Button type="submit" variant="success">
                Update
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Can't undo.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteReview}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
