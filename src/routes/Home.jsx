import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMovies } from '../services/tmdb';
import MovieCard from '../components/MovieCard';

export default function Home(){
  const [q,setQ] = useState('');
  const [results,setResults] = useState([]);
  const navigate = useNavigate();

  const onSearch = async (e) => {
    e.preventDefault();
    const r = await searchMovies(q);
    setResults(r.results || []);
    navigate('/search?q=' + encodeURIComponent(q));
  };

  return (
    <div className="container my-4">
      <h1>Discover Movies</h1>
      <form onSubmit={onSearch} className="mb-3">
        <div className="input-group">
          <input className="form-control" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search movies..." />
          <button className="btn btn-primary">Search</button>
        </div>
      </form>

      <div className="row">
        {results.slice(0,6).map(m=>(
          <div key={m.id} className="col-md-4"><MovieCard movie={m} /></div>
        ))}
      </div>
    </div>
  );
}
