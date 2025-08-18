export async function searchProducts(query: string) {
  const res = await fetch(
    `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return data.products || [];
}
