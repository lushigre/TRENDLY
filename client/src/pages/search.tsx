import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import ProductCard from "../components/product-card";
import ProductDetailModal from "@/components/product-detail-modal";
import { Product, ProductWithHistory } from "@shared/schema";
import { searchProducts } from "@/api/products";

export default function SearchPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [store, setStore] = useState("All Stores");
  const [priceRange, setPriceRange] = useState("Price: All");
  const [sortBy, setSortBy] = useState("Sort by: Relevance");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [location]);

  const { data: searchResults = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/search", searchQuery, category, store],
    queryFn: async () => {
      if (!searchQuery) return [];
      return await searchProducts(searchQuery);
    },
    enabled: searchQuery.length > 0,
  } as any);

  const displayProducts: Product[] =
    results.length > 0 ? results : searchResults || [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const products = await searchProducts(searchQuery);
      setResults(products || []);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product as ProductWithHistory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const categories = [
    "All Categories",
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
    "Gaming",
    "Books",
    "Beauty",
  ];

  const stores = [
    "All Stores",
    "Amazon",
    "Flipkart",
    "eBay",
    "Myntra",
    "Walmart",
  ];

  const priceRanges = [
    "Price: All",
    "Under $50",
    "$50 - $200",
    "$200 - $500",
    "Over $500",
  ];

  const sortOptions = [
    "Sort by: Relevance",
    "Price: Low to High",
    "Price: High to Low",
    "Biggest Discount",
    "Most Popular",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-gray-900 mb-4"
            data-testid="search-page-title"
          >
            Search Products
          </h2>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col lg:flex-row gap-4 mb-6"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  data-testid="search-input"
                />
              </div>
              <Button
                type="submit"
                className="btn-primary text-white px-8 py-3 rounded-lg font-medium"
                data-testid="search-button"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  className="w-[180px]"
                  data-testid="category-filter"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="w-[180px]" data-testid="store-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((storeName) => (
                    <SelectItem key={storeName} value={storeName}>
                      {storeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[180px]" data-testid="price-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]" data-testid="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          {searchQuery && (
            <p className="text-gray-600" data-testid="search-results-count">
              {isLoading
                ? "Searching..."
                : `${displayProducts.length} results for "${searchQuery}"`}
            </p>
          )}
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : searchQuery && displayProducts.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            data-testid="search-results-grid"
          >
            {displayProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12" data-testid="no-results">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <p className="text-gray-500">
              No products found for "{searchQuery}"
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try different keywords or adjust your filters
            </p>
          </div>
        ) : (
          <div className="text-center py-12" data-testid="search-placeholder">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Enter a search term to find products from multiple e-commerce
              sites
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSearchQuery("iPhone")}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                Try: iPhone
              </button>
              <button
                onClick={() => setSearchQuery("laptop")}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                Try: laptop
              </button>
              <button
                onClick={() => setSearchQuery("shoes")}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                Try: shoes
              </button>
              <button
                onClick={() => setSearchQuery("headphones")}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                Try: headphones
              </button>
            </div>
          </div>
        )}

        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
