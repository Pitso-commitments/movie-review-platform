import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Form, Row, Col, Alert } from "react-bootstrap";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/movies/popular");
      
      setMovies(res.data.results || []);
    } catch (err) {
      console.error("TMDB Popular Movies Error:", err);
      setError("Failed to load popular movies from TMDB.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/search?query=${encodeURIComponent(searchQuery)}`
      );
      
      setMovies(res.data.results || []);
    } catch (err) {
      console.error("TMDB Search Error:", err);
      setError("No results found on TMDB. Try a different search.");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (id) => {
    navigate(`/movie/${id}`);
  };

  return (
    <div className="mt-4">
      {/* TMDB Search Bar */}
      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="g-2 align-items-center">
          <Col xs={12} md={8} lg={6}>
            <Form.Control
              type="text"
              placeholder="Search movies on TMDB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shadow-sm"
            />
          </Col>
          <Col xs={12} md={4} lg={3}>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? "Searching TMDB..." : "Search"}
            </Button>
          </Col>
        </Row>
      </Form>

      
      {error && <Alert variant="warning">{error}</Alert>}

      
      {loading && !movies.length ? (
        <p className="text-center text-muted">
          Loading movies from <strong>TMDB</strong>...
        </p>
      ) : (
        <>

          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {movies.length === 0 ? (
              <Col>
                <p className="text-center text-muted">
                  No movies found on TMDB.
                </p>
              </Col>
            ) : (
              movies.map((movie) => (
                <Col key={movie.id}>
                  <Card
                    className="h-100 shadow-sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <Card.Img
                      variant="top"
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://via.placeholder.com/500x750?text=No+Poster"
                      }
                      alt={`Poster for ${movie.title}`}
                      style={{ height: "300px", objectFit: "cover" }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="text-truncate">
                        {movie.title}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        {movie.release_date?.split("-")[0] || "N/A"}
                      </Card.Text>
                      <Card.Text className="text-truncate">
                        {movie.overview || "No overview available."}
                      </Card.Text>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovieClick(movie.id);
                        }}
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          
          <div className="text-center mt-5 text-muted small">
            Powered by{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              The Movie Database (TMDB)
            </a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
          </div>
        </>
      )}
    </div>
  );
};

export default Home;