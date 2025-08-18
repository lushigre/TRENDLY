// Mock data utilities for Trendly application
// This file provides additional mock data generators and utilities
// that complement the data already generated in MemStorage

import { Product, PriceHistory, User } from "@shared/schema";

export interface MockStats {
  productsTracked: string;
  totalSaved: string;
  activeUsers: string;
}

export interface MockStoreInfo {
  name: string;
  logo: string;
  url: string;
}

// Mock statistics for the hero section
export const mockHeroStats: MockStats = {
  productsTracked: "50,000+",
  totalSaved: "$2.3M",
  activeUsers: "25,000+",
};

// Mock store information for product detail modals
export const mockStores: MockStoreInfo[] = [
  {
    name: "Amazon",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32",
    url: "https://amazon.com",
  },
  {
    name: "Best Buy",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32",
    url: "https://bestbuy.com",
  },
  {
    name: "Target",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32",
    url: "https://target.com",
  },
  {
    name: "Walmart",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32",
    url: "https://walmart.com",
  },
];

// Categories for filtering
export const productCategories = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Gaming",
  "Books",
  "Beauty",
  "Automotive",
  "Health",
  "Toys",
];

// Price ranges for filtering
export const priceRanges = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $200", min: 50, max: 200 },
  { label: "$200 - $500", min: 200, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "Over $1000", min: 1000, max: Infinity },
];

// Sort options for search
export const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Biggest Discount", value: "discount_desc" },
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
];

// Utility function to generate realistic price history
export function generatePriceHistory(
  basePrice: number,
  days: number = 30,
  volatility: number = 0.15
): PriceHistory[] {
  const history: PriceHistory[] = [];
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Add some realistic price volatility
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.5); // Don't go below 50% of base price

    history.push({
      date: date.toISOString(), // sirf allowed properties rakho
      price: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
    });
  }

  // Sorting by date string
  return history.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// Utility function to calculate discount percentage
export function calculateDiscountPercent(
  originalPrice: number,
  currentPrice: number
): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// Utility function to format price
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// Utility function to format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

// Mock activity types for dashboard
export const activityTypes = {
  price_drop: {
    icon: "trending-down",
    color: "green",
    bgColor: "bg-green-100",
  },
  price_increase: {
    icon: "trending-up",
    color: "red",
    bgColor: "bg-red-100",
  },
  added_to_watchlist: {
    icon: "heart",
    color: "blue",
    bgColor: "bg-blue-100",
  },
  alert_triggered: {
    icon: "bell",
    color: "yellow",
    bgColor: "bg-yellow-100",
  },
  stock_alert: {
    icon: "package",
    color: "purple",
    bgColor: "bg-purple-100",
  },
};

// Utility function to get trend indicator
export function getTrendIndicator(currentPrice: number, previousPrice: number) {
  if (currentPrice < previousPrice) {
    return {
      type: "down",
      icon: "trending-down",
      color: "text-green-500",
      amount: previousPrice - currentPrice,
    };
  } else if (currentPrice > previousPrice) {
    return {
      type: "up",
      icon: "trending-up",
      color: "text-red-500",
      amount: currentPrice - previousPrice,
    };
  }
  return {
    type: "stable",
    icon: "minus",
    color: "text-gray-500",
    amount: 0,
  };
}

// Mock notification preferences
export const notificationTypes = [
  {
    id: "price_drops",
    label: "Price Drops",
    description: "Get notified when tracked items go on sale",
  },
  {
    id: "back_in_stock",
    label: "Back in Stock",
    description: "Get notified when out-of-stock items become available",
  },
  {
    id: "price_targets",
    label: "Price Targets",
    description: "Get notified when items reach your target price",
  },
  {
    id: "weekly_summary",
    label: "Weekly Summary",
    description: "Get a weekly summary of your watchlist activity",
  },
];

export default {
  mockHeroStats,
  mockStores,
  productCategories,
  priceRanges,
  sortOptions,
  generatePriceHistory,
  calculateDiscountPercent,
  formatPrice,
  formatRelativeTime,
  activityTypes,
  getTrendIndicator,
  notificationTypes,
};
