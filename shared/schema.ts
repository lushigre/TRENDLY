import mongoose from "mongoose";
import { z } from "zod";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Product Schema
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  originalPrice: { type: Number },
  imageUrl: String,
  url: { type: String, required: true },
  store: String,
  priceHistory: [
    {
      price: Number,
      date: Date,
    },
  ],
});

// Watchlist Schema
const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  targetPrice: Number,
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
export const Product = mongoose.model("Product", productSchema);
export const Watchlist = mongoose.model("Watchlist", watchlistSchema);

export const insertWatchlistSchema = z.object({
  productId: z.string(),
  targetPrice: z.number(),
});

// Example type definitions (replace with your actual schema)
export interface PriceHistory {
  price: number;
  date: string; // everywhere string use karo
}

export interface Product {
  id: string;
  title: string;
  name?: string; // agar kahin 'name' use ho raha hai toh optional rakho
  currentPrice: number;
  originalPrice?: number;
  imageUrl?: string;
  image?: string; // agar kahin image use ho raha hai toh optional rakho
  url: string;
  store?: string;
  description?: string;
  lastUpdated?: string;
  priceHistory?: PriceHistory[];
}

export interface ProductWithHistory extends Product {
  history: PriceHistory[];
}

export interface WatchlistItem {
  id: string;
  product: Product;
  targetPrice?: number;
  alertEnabled?: boolean;
  addedAt?: string; // ya Date
}

export interface User {
  id: string;
  name: string;
  email: string;
  // ...other fields
}

// If you use mongoose models, export types/interfaces separately from models!
