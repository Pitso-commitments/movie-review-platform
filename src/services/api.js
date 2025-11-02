export async function getReviews(movieId){
  const res = await fetch(`/api/reviews?movieId=${movieId}`);
  return res.json();
}
export async function addReview(token, data){
  const res = await fetch(`/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}
