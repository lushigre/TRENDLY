import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, TrendingDown, TrendingUp, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProductDetailModal from "@/components/product-detail-modal";
import { WatchlistItem, ProductWithHistory } from "@shared/schema";
import { useLocation } from "wouter";

function isProductWithHistory(obj: any): obj is ProductWithHistory {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "title" in obj &&
    "currentPrice" in obj &&
    "url" in obj &&
    "history" in obj
  );
}

export default function WatchlistPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: watchlist = [], isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
  });

  const { data: productDetail } = useQuery({
    queryKey: ["/api/products", selectedProduct?.id],
    enabled: !!selectedProduct?.id,
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/watchlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Removed from Watchlist",
        description: "Product has been removed from your watchlist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from watchlist",
        variant: "destructive",
      });
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({
      productId,
      alertEnabled,
    }: {
      productId: string;
      alertEnabled: boolean;
    }) => {
      return apiRequest("PATCH", `/api/watchlist/${productId}`, {
        alertEnabled,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update alert settings",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to view your watchlist.
            </p>
            <Button
              className="btn-primary w-full"
              onClick={() => setLocation("/login")}
              data-testid="login-redirect-button"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleProductClick = (item: WatchlistItem) => {
    setSelectedProduct(item.product as ProductWithHistory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAlertToggle = (productId: string, alertEnabled: boolean) => {
    updateAlertMutation.mutate({ productId, alertEnabled });
  };

  const handleRemove = (productId: string) => {
    removeFromWatchlistMutation.mutate(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2
            className="text-3xl font-bold text-gray-900"
            data-testid="watchlist-title"
          >
            My Watchlist
          </h2>
          <div className="flex items-center space-x-4">
            <span
              className="text-sm text-gray-500"
              data-testid="watchlist-count"
            >
              {watchlist.length} items
            </span>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              data-testid="manage-alerts-button"
            >
              <Settings className="h-4 w-4" />
              <span>Manage Alerts</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-32 animate-pulse"
              />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-watchlist">
            <div className="text-gray-400 text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Start adding products to track their prices
            </p>
            <Button
              className="btn-primary"
              onClick={() => setLocation("/search")}
              data-testid="browse-products-button"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="watchlist-items">
            {watchlist.map((item: WatchlistItem) => {
              // Discount calculation
              const discount =
                (item.product.originalPrice ?? 0) - item.product.currentPrice;

              const isDiscounted = discount > 0;

              return (
                <Card
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(item)}
                  data-testid={`watchlist-item-${item.product.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          data-testid={`watchlist-product-image-${item.product.id}`}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="mb-4 md:mb-0">
                            <h3
                              className="font-semibold text-gray-900 mb-1"
                              data-testid={`watchlist-product-name-${item.product.id}`}
                            >
                              {item.product.name}
                            </h3>
                            <p
                              className="text-gray-600 text-sm mb-2"
                              data-testid={`watchlist-product-description-${item.product.id}`}
                            >
                              {item.product.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              Added{" "}
                              {item.addedAt &&
                                new Date(item.addedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center space-x-6">
                            {/* Current Price */}
                            <div className="text-right">
                              <div
                                className="text-2xl font-bold text-gray-900"
                                data-testid={`watchlist-current-price-${item.product.id}`}
                              >
                                ${item.product.currentPrice}
                              </div>
                              <div className="text-sm text-gray-500">
                                Last updated:{" "}
                                {item.product.lastUpdated &&
                                  new Date(
                                    item.product.lastUpdated
                                  ).toLocaleDateString()}
                              </div>
                            </div>

                            {/* Price Change */}
                            {isDiscounted && (
                              <div className="text-center">
                                <div className="price-trend-down text-lg font-medium flex items-center">
                                  <TrendingDown className="h-4 w-4 mr-1" />$
                                  {discount}
                                </div>
                                <div className="text-sm text-gray-500">
                                  vs. original
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col space-y-2">
                              <Button
                                className="bg-primary text-white hover:bg-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductClick(item);
                                }}
                                data-testid={`view-details-button-${item.product.id}`}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(item.product.id);
                                }}
                                disabled={removeFromWatchlistMutation.isPending}
                                data-testid={`remove-button-${item.product.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Alert Status */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={item.alertEnabled}
                              onCheckedChange={(checked) => {
                                handleAlertToggle(item.product.id, checked);
                              }}
                              disabled={updateAlertMutation.isPending}
                              data-testid={`alert-toggle-${item.product.id}`}
                            />
                            <span className="text-sm text-gray-700">
                              Price alerts{" "}
                              {item.alertEnabled ? "enabled" : "disabled"}
                            </span>
                          </div>

                          {item.targetPrice && (
                            <div className="text-sm text-gray-500">
                              Target price:{" "}
                              <span className="font-medium">
                                ${item.targetPrice}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={
          isProductWithHistory(productDetail)
            ? productDetail
            : isProductWithHistory(selectedProduct)
            ? selectedProduct
            : null
        }
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        alertEnabled={
          watchlist.find((item) => item.product.id === selectedProduct?.id)
            ?.alertEnabled
        }
        onAlertToggle={(enabled) => {
          if (selectedProduct) {
            handleAlertToggle(selectedProduct.id, enabled);
          }
        }}
      />
    </div>
  );
}
