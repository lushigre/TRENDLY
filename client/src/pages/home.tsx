import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import ProductCard from "@/components/product-card";
import ProductDetailModal from "@/components/product-detail-modal";
import { Product, ProductWithHistory } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: trendingProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/trending'],
  });

  const { data: productDetail } = useQuery<ProductWithHistory>({
    queryKey: ['/api/products', selectedProduct?.id],
    enabled: !!selectedProduct?.id,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in" data-testid="hero-title">
              Track. Compare. Save.
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto fade-in" data-testid="hero-subtitle">
              Never miss a price drop again. Monitor trending products across multiple e-commerce sites and get instant alerts.
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in max-w-2xl mx-auto">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-full text-gray-900 bg-white border-0 focus:ring-4 focus:ring-blue-300 focus:outline-none text-lg"
                  data-testid="hero-search-input"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-2 bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                  data-testid="hero-search-button"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center" data-testid="stat-products">
                <div className="text-4xl font-bold">50,000+</div>
                <div className="text-blue-200">Products Tracked</div>
              </div>
              <div className="text-center" data-testid="stat-saved">
                <div className="text-4xl font-bold">$2.3M</div>
                <div className="text-blue-200">Total Saved</div>
              </div>
              <div className="text-center" data-testid="stat-users">
                <div className="text-4xl font-bold">25,000+</div>
                <div className="text-blue-200">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Stores Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Across Multiple E-commerce Platforms</h2>
            <p className="text-gray-600">Compare prices and find the best deals from your favorite online stores</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <img src="https://logo.clearbit.com/amazon.com" alt="Amazon" className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium text-gray-700">Amazon</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <img src="https://logo.clearbit.com/flipkart.com" alt="Flipkart" className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium text-gray-700">Flipkart</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <img src="https://logo.clearbit.com/ebay.com" alt="eBay" className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium text-gray-700">eBay</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <img src="https://logo.clearbit.com/myntra.com" alt="Myntra" className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium text-gray-700">Myntra</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <img src="https://logo.clearbit.com/walmart.com" alt="Walmart" className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium text-gray-700">Walmart</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900" data-testid="trending-title">
              Trending Products
            </h2>
            <Button 
              variant="link" 
              className="text-primary hover:text-blue-700 font-medium"
              onClick={() => setLocation('/search')}
              data-testid="view-all-button"
            >
              View All →
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="trending-products-grid">
              {trendingProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={productDetail || selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Trendly</h3>
              <p className="text-gray-400 mb-4">Track trending products and never miss a price drop again.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Price Tracking</a></li>
                <li><a href="#" className="hover:text-white">Price Alerts</a></li>
                <li><a href="#" className="hover:text-white">Wishlist</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Get the latest deals and updates.</p>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 bg-gray-800 border-gray-700 text-white rounded-r-none"
                />
                <Button className="bg-primary rounded-l-none hover:bg-blue-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Trendly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}