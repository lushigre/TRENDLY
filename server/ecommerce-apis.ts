import axios from "axios";

const SERPAPI_KEY =
  "994e6cd0fad05b99103f20dc7a82fef74ea5a8582a266ba0b8b09cb0187bd7c6";

export async function scrapeAmazon(query: string) {
  const url = `https://serpapi.com/search.json?engine=amazon&k=${encodeURIComponent(
    query
  )}&api_key=${SERPAPI_KEY}`;
  try {
    const res = await axios.get(url, { timeout: 15000 });
    const data = res.data || {};
    // possible result arrays from SerpAPI
    const items =
      data.organic_results ||
      data.search_results ||
      data.shopping_results ||
      [];
    const products: any[] = [];

    items.forEach((item: any, i: number) => {
      // image detection (try multiple locations)
      const image =
        item.thumbnail ||
        item.image ||
        (item.inline_images && item.inline_images[0]) ||
        (item.product && item.product.images && item.product.images[0]) ||
        (item.images && item.images[0]) ||
        null;

      // price detection (try common SerpAPI keys)
      const rawPrice =
        item.price ||
        item.extracted_price ||
        (item.offers && item.offers[0] && item.offers[0].price) ||
        (item.buybox && item.buybox.price) ||
        null;
      const currentPrice = rawPrice
        ? Number(String(rawPrice).replace(/[^\d]/g, ""))
        : null;

      // description / snippet
      const description =
        item.snippet || item.description || item.excerpt || item.text || "";

      // url/link
      const urlLink =
        item.link || item.url || (item.product && item.product.link) || "";

      products.push({
        id: `amazon_${i}`,
        title: item.title || item.name || "",
        image,
        currentPrice,
        originalPrice: currentPrice, // change if you find strike price in response
        url: urlLink,
        description,
        store: "Amazon",
        lastUpdated: new Date().toISOString(),
        priceHistory: [],
      });
    });

    return products;
  } catch (err: any) {
    const msg = err.response?.data || err.response?.statusText || err.message;
    throw new Error(String(msg));
  }
}

export async function scrapeFlipkart(query: string) {
  const url = `https://serpapi.com/search.json?engine=flipkart&api_key=${SERPAPI_KEY}&q=${encodeURIComponent(
    query
  )}`;
  const response = await axios.get(url);
  const products: any[] = [];
  if (response.data && response.data["organic_results"]) {
    response.data["organic_results"].forEach((item: any, i: number) => {
      products.push({
        id: `flipkart_${i}`,
        title: item.title,
        currentPrice: item.price
          ? Number(item.price.replace(/[^\d]/g, ""))
          : null,
        originalPrice: item.price_strike
          ? Number(item.price_strike.replace(/[^\d]/g, ""))
          : null,
        url: item.link,
        store: "Flipkart",
        lastUpdated: new Date().toISOString(),
        priceHistory: [],
      });
    });
  }
  return products;
}
