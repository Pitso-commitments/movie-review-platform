import React from "react";
import { Link } from 'react-router-dom';
import { posterUrl } from '../services/tmdb';

export default function MovieCard({movie}){
  return (
    <div className="card h-100">
      <img src={posterUrl(movie.poster_path)} className="card-img-top" alt="" />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{movie.title}</h5>
        <p className="card-text text-truncate">{movie.overview}</p>
        <div className="mt-auto">
          <Link to={'/movie/' + movie.id} className="btn btn-outline-primary btn-sm">View</Link>
        </div>
      </div>
    </div>
  );
}
