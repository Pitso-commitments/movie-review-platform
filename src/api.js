// src/api.js
const API_BASE = "https://movie-review-platform-backend-d3ff.onrender.com";

export const api = {
  getPopular: () =>
    fetch(`${API_BASE}/api/movies/popular`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),

  searchMovies: (query) =>
    fetch(`${API_BASE}/api/movies/search?query=${encodeURIComponent(query)}`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),

  getMovie: (id) =>
    fetch(`${API_BASE}/api/movies/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),

  getReviews: (movieId) =>
    fetch(`${API_BASE}/api/reviews/${movieId}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => Array.isArray(data) ? data : [])
      .catch(() => []),

  postReview: (data, token) =>
    fetch(`${API_BASE}/api/reviews`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),

  putReview: (id, data, token) =>
    fetch(`${API_BASE}/api/reviews/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),

  deleteReview: (id, token) =>
    fetch(`${API_BASE}/api/reviews/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),
};