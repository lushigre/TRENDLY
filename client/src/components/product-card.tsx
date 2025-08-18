import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

type ProductCardProps = {
  product: Product;
  onProductClick?: (product: Product) => void;
};

export default function ProductCard({
  product,
  onProductClick,
}: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const title = product?.title ?? "No title";
  const imgSrc = product?.image ?? "";
  const current =
    typeof product?.currentPrice === "number" ? product.currentPrice : null;
  const original =
    typeof product?.originalPrice === "number" ? product.originalPrice : null;

  const fmt = (n: number | null) =>
    n === null
      ? "N/A"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(n);

  const discountPercentCalc =
    current !== null && original !== null && original > 0
      ? Math.round(((original - current) / original) * 100)
      : null;

  // watchlist local state (sync with cache/localStorage)
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);

  useEffect(() => {
    try {
      const cached = queryClient.getQueryData<string[]>(["/api/watchlist"]);
      if (Array.isArray(cached)) {
        setIsInWatchlist(cached.includes(product.id));
        return;
      }
    } catch {
      // ignore
    }

    try {
      const raw = localStorage.getItem("tt_watchlist");
      if (raw) {
        const list: string[] = JSON.parse(raw);
        setIsInWatchlist(list.includes(product.id));
      } else {
        setIsInWatchlist(false);
      }
    } catch {
      setIsInWatchlist(false);
    }
  }, [product.id, queryClient]);

  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("POST", "/api/watchlist", {
        productId: product.id,
        alertEnabled: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      try {
        const raw = localStorage.getItem("tt_watchlist");
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(product.id)) {
          localStorage.setItem(
            "tt_watchlist",
            JSON.stringify([...list, product.id])
          );
        }
      } catch {}
      setIsInWatchlist(true);
      toast({
        title: "Added to Watchlist",
        description: `${title} has been added to your watchlist.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to add to watchlist",
        variant: "destructive",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("DELETE", `/api/watchlist/${product.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      try {
        const raw = localStorage.getItem("tt_watchlist");
        const list: string[] = raw ? JSON.parse(raw) : [];
        const next = list.filter((id) => id !== product.id);
        localStorage.setItem("tt_watchlist", JSON.stringify(next));
      } catch {}
      setIsInWatchlist(false);
      toast({
        title: "Removed from Watchlist",
        description: `${title} has been removed from your watchlist.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to remove from watchlist",
        variant: "destructive",
      });
    },
  });

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add products to your watchlist.",
        variant: "destructive",
      });
      return;
    }
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.url) window.open(product.url, "_blank");
  };

  return (
    <Card
      className="product-card bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => onProductClick?.(product)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-48 object-cover"
          data-testid={`product-image-${product.id}`}
        />
        {discountPercentCalc !== null && discountPercentCalc > 0 && (
          <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {discountPercentCalc}% OFF
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="text-xs text-gray-400 mb-1">
          {product?.store || "Store"}
        </div>
        <h3
          className="text-sm font-medium text-gray-900 line-clamp-2"
          data-testid={`product-name-${product.id}`}
        >
          {title}
        </h3>

        <div className="mt-3 flex items-baseline gap-3">
          <span
            className="text-lg font-bold text-green-700"
            data-testid={`product-current-price-${product.id}`}
          >
            {fmt(current)}
          </span>
          {original !== null && original !== current ? (
            <span
              className="text-sm text-gray-500 line-through"
              data-testid={`product-original-price-${product.id}`}
            >
              {fmt(original)}
            </span>
          ) : null}
          {discountPercentCalc !== null ? (
            <span className="text-xs text-red-600 ml-2">
              -{discountPercentCalc}%
            </span>
          ) : null}
        </div>

        {product?.description ? (
          <p className="mt-2 text-xs text-gray-600 line-clamp-2">
            {product.description}
          </p>
        ) : null}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {(product as any).storeLogoUrl && (
              <img
                src={(product as any).storeLogoUrl}
                alt={(product as any).store || product.store}
                className="w-6 h-6 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {(product as any).store || product.store}
            </span>
          </div>
          {(product as any).rating && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">
                {(product as any).rating} ({(product as any).reviewCount || 0})
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            className={`flex-1 btn-primary text-white font-medium ${
              isInWatchlist ? "bg-red-500 hover:bg-red-600" : ""
            }`}
            onClick={handleWatchlistToggle}
            disabled={
              addToWatchlistMutation.status === "pending" ||
              removeFromWatchlistMutation.status === "pending"
            }
            data-testid={`watchlist-button-${product.id}`}
          >
            <Heart
              className={`h-4 w-4 mr-2 ${isInWatchlist ? "fill-current" : ""}`}
            />
            {isInWatchlist ? "Remove" : "Watch"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleExternalLink}
            data-testid={`external-link-button-${product.id}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
