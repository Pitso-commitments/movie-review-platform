// src/api.js
const API_BASE = "https://movie-review-platform-backend-d3ff.onrender.com";

export const api = {
  // Popular Movies
  getPopular: () =>
    fetch(`${API_BASE}/api/movies/popular`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => []),

  // Search Movies
  searchMovies: (query) =>
    fetch(`${API_BASE}/api/movies/search?query=${encodeURIComponent(query)}`)
      .then(r => r.ok ? r.json() : { results: [] })
      .catch(() => ({ results: [] })),

  // Movie Details
  getMovie: (id) =>
    fetch(`${API_BASE}/api/movies/${id}`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null),

  // Get Reviews for Movie
  getReviews: (movieId) =>
    fetch(`${API_BASE}/api/reviews/${movieId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? data : [])
      .catch(() => []),

  // Post Review
  postReview: (data, token) =>
    fetch(`${API_BASE}/api/reviews`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(r => r.ok ? r.json() : Promise.reject("Post failed"))
    .catch(() => Promise.reject("Network error")),

  // Update Review
  putReview: (id, data, token) =>
    fetch(`${API_BASE}/api/reviews/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(r => r.ok ? r.json() : Promise.reject("Update failed")),

  // Delete Review
  deleteReview: (id, token) =>
    fetch(`${API_BASE}/api/reviews/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.ok ? r.json() : Promise.reject("Delete failed")),
};