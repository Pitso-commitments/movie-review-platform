const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function searchMovies(q){
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}`);
  return res.json();
}
export async function getMovie(id){
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`);
  return res.json();
}
export function posterUrl(path, size='w342'){
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
}
