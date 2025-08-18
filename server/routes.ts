import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import {
  insertUserSchema,
  loginSchema,
  insertWatchlistSchema,
} from "../shared/schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { scrapeAmazon } from "./ecommerce-apis.js";

const JWT_SECRET = process.env.JWT_SECRET || "trendly-secret-key";

// Middleware to verify JWT token
function authenticateToken(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    (req as any).user = user;
    next();
  });
}

const router = Router();

// Health check route
router.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
router.post("/api/auth/register", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const userToCreate = {
      ...userData,
      // ensure name is provided (fallback to part of email or generic "User")
      name:
        userData.name ??
        (userData.email ? userData.email.split("@")[0] : "User"),
      password: hashedPassword,
    };

    const user = await storage.createUser(userToCreate);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid input data" });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const credentials = loginSchema.parse(req.body);

    const user = await storage.getUserByEmail(credentials.email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid input data" });
  }
});

router.get(
  "/api/auth/me",
  authenticateToken,
  async (req: Request & { user?: any }, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Product routes
router.get("/api/products", async (_req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/products/trending", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    // Replace with your trending products logic
    res.json([]);
  } catch (error) {
    console.error("Trending products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/products/search", async (req, res) => {
  try {
    const query = (req.query.q as string) || "";
    const category = req.query.category as string;
    const store = req.query.store as string;

    // Replace with your search logic
    res.json([]);
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/products/:id", async (req, res) => {
  try {
    const product = await storage.getProductWithHistory(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Watchlist routes
router.get(
  "/api/watchlist",
  authenticateToken,
  async (req: Request & { user?: any }, res) => {
    try {
      const watchlist = await storage.getUserWatchlist(req.user.id);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/api/watchlist",
  authenticateToken,
  async (req: Request & { user?: any }, res) => {
    try {
      const parsed = insertWatchlistSchema.parse(req.body);
      const watchlistData = { ...parsed, userId: req.user.id };
      const watchlistItem = await storage.addToWatchlist(watchlistData);
      res.status(201).json(watchlistItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  }
);

router.delete(
  "/api/watchlist/:productId",
  authenticateToken,
  async (req: Request & { user?: any }, res) => {
    try {
      const removed = await storage.removeFromWatchlist(
        req.user.id,
        req.params.productId
      );
      if (!removed) {
        return res.status(404).json({ message: "Item not found in watchlist" });
      }
      res.json({ message: "Item removed from watchlist" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.patch(
  "/api/watchlist/:productId",
  authenticateToken,
  async (req: Request & { user?: any }, res) => {
    try {
      const updated = await storage.updateWatchlistItem(
        req.user.id,
        req.params.productId,
        req.body
      );
      if (!updated) {
        return res.status(404).json({ message: "Item not found in watchlist" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Dashboard stats route
router.get(
  "/api/dashboard/stats",
  authenticateToken,
  async (req: Request & { user?: any }, res) => {
    try {
      const watchlist = await storage.getUserWatchlist(req.user.id);

      // Calculate total savings (difference between original and current prices)
      const totalSaved = watchlist.reduce((sum: number, item: any) => {
        return (
          sum + ((item.product.originalPrice ?? 0) - item.product.currentPrice)
        );
      }, 0);

      const stats = {
        totalSaved: Math.round(totalSaved),
        itemsWatched: watchlist.length,
        priceAlerts: watchlist.filter((item: any) => item.alertEnabled).length,
        dealsFound: watchlist.filter(
          (item: any) =>
            (item.product.currentPrice ?? 0) < (item.product.originalPrice ?? 0)
        ).length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Scraping route for Amazon & Flipkart
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== "string")
    return res.status(400).json({ error: "Missing query" });
  try {
    const amazon = await scrapeAmazon(q);
    res.json({ products: amazon });
  } catch (err: any) {
    res.status(500).json({ error: "Scraping failed", details: err.message });
  }
});

export default router;

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(router);
  const httpServer = createServer(app);
  return httpServer;
}
