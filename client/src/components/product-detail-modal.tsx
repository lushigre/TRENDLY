import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingDown } from "lucide-react";
import { ProductWithHistory } from "@shared/schema";
import PriceChart from "./price-chart";

interface ProductDetailModalProps {
  product: ProductWithHistory | null;
  isOpen: boolean;
  onClose: () => void;
  alertEnabled?: boolean;
  onAlertToggle?: (enabled: boolean) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  alertEnabled = false,
  onAlertToggle,
}: ProductDetailModalProps) {
  if (!product) return null;

  // Discount calculation
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.currentPrice) /
          product.originalPrice) *
          100
      )
    : 0;

  const isDiscounted = product.originalPrice
    ? product.currentPrice < product.originalPrice
    : false;

  const stores = [
    {
      name: product.store,
      price: product.currentPrice,
      url: product.url,
      isPrimary: true,
    },
    {
      name: "Best Buy",
      price: product.currentPrice + 10,
      url: "#",
      isPrimary: false,
    },
    {
      name: "Target",
      price: product.currentPrice + 5,
      url: "#",
      isPrimary: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        data-testid="product-detail-modal"
      >
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-bold text-gray-900"
            data-testid="modal-product-title"
          >
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Product Image */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
              data-testid="modal-product-image"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className="text-3xl font-bold text-gray-900"
                  data-testid="modal-current-price"
                >
                  ${product.currentPrice}
                </span>
                {isDiscounted && (
                  <>
                    <span
                      className="text-xl text-gray-500 line-through"
                      data-testid="modal-original-price"
                    >
                      ${product.originalPrice}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {discountPercent}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <p
                className="text-gray-600 mb-4"
                data-testid="modal-product-description"
              >
                {product.description}
              </p>

              {/* Price Alert Toggle */}
              <div className="flex items-center space-x-3 mb-6">
                <Switch
                  checked={alertEnabled}
                  onCheckedChange={onAlertToggle}
                  data-testid="price-alert-toggle"
                />
                <span className="text-sm font-medium text-gray-700">
                  Price Drop Alerts
                </span>
              </div>

              {/* Store Links */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900">Available At:</h4>
                {stores.map((store, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    data-testid={`store-option-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32`}
                        alt={store.name}
                        className="w-8 h-8 rounded"
                      />
                      <span className="font-medium">{store.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className="font-bold text-gray-900"
                        data-testid={`store-price-${index}`}
                      >
                        ${store.price}
                      </span>
                      <Button
                        size="sm"
                        variant={store.isPrimary ? "default" : "outline"}
                        className={store.isPrimary ? "btn-primary" : ""}
                        onClick={() => window.open(store.url, "_blank")}
                        data-testid={`store-button-${index}`}
                      >
                        View Deal
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price History Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price History (Last 30 Days)
              </h3>
              <div className="h-64">
                <PriceChart priceHistory={product.priceHistory ?? []} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
