import { randomUUID } from "crypto";

// --- Local Type Definitions ---
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface InsertUser {
  name: string;
  email: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  currentPrice: number;
  originalPrice: number;
  url: string;
  store: string;
  lastUpdated: Date;
}

export interface InsertProduct {
  name: string;
  description: string;
  image: string;
  category: string;
  currentPrice: number;
  originalPrice: number;
  url: string;
  store: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  date: Date;
}

export interface InsertPriceHistory {
  productId: string;
  price: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  alertEnabled: boolean;
  addedAt: Date;
}

export interface InsertWatchlist {
  userId: string;
  productId: string;
  targetPrice: number;
  alertEnabled?: boolean;
}

export interface ProductWithHistory extends Product {
  priceHistory: PriceHistory[];
}

export interface WatchlistItem extends Watchlist {
  product: Product;
}

// --- In-memory Storage Implementation ---
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductWithHistory(id: string): Promise<ProductWithHistory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<Product | undefined>;
  searchProducts(query: string, category?: string): Promise<Product[]>;
  getTrendingProducts(limit?: number): Promise<Product[]>;

  // Price history methods
  createPriceHistory(priceHistory: InsertPriceHistory): Promise<PriceHistory>;
  getPriceHistory(productId: string): Promise<PriceHistory[]>;

  // Watchlist methods
  getUserWatchlist(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: string, productId: string): Promise<boolean>;
  updateWatchlistItem(
    userId: string,
    productId: string,
    updates: Partial<Watchlist>
  ): Promise<Watchlist | undefined>;
  isInWatchlist(userId: string, productId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private priceHistory: Map<string, PriceHistory>;
  private watchlist: Map<string, Watchlist>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.priceHistory = new Map();
    this.watchlist = new Map();

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock products
    const mockProducts: InsertProduct[] = [
      {
        name: "Premium Wireless Headphones",
        description: "High-quality audio with noise cancellation",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Electronics",
        currentPrice: 199,
        originalPrice: 299,
        url: "https://example.com/headphones",
        store: "Amazon",
      },
      {
        name: 'MacBook Pro 14"',
        description: "M2 chip with 16GB RAM and 512GB SSD",
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Electronics",
        currentPrice: 1899,
        originalPrice: 1999,
        url: "https://example.com/macbook",
        store: "Apple",
      },
      {
        name: "iPhone 15 Pro",
        description: "256GB, Titanium, Pro camera system",
        image:
          "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Electronics",
        currentPrice: 1099,
        originalPrice: 1199,
        url: "https://example.com/iphone",
        store: "Apple",
      },
      {
        name: "PlayStation 5",
        description: "Console with Ultra HD Blu-ray disc drive",
        image:
          "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Gaming",
        currentPrice: 499,
        originalPrice: 599,
        url: "https://example.com/ps5",
        store: "Best Buy",
      },
      {
        name: "Nike Air Max 270",
        description: "Comfortable running shoes with air cushioning",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Fashion",
        currentPrice: 129,
        originalPrice: 150,
        url: "https://example.com/nike-shoes",
        store: "Nike",
      },
      {
        name: "Instant Pot Duo 7-in-1",
        description: "Electric pressure cooker with multiple functions",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Home & Garden",
        currentPrice: 79,
        originalPrice: 99,
        url: "https://example.com/instant-pot",
        store: "Amazon",
      },
    ];

    mockProducts.forEach(async (product) => {
      const created = await this.createProduct(product);

      // Create mock price history for each product
      const historyDays = 30;
      const basePrice = created.originalPrice;

      for (let i = historyDays; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Create realistic price fluctuation
        const variation = 0.1 + Math.random() * 0.2; // 10-30% variation
        const trendFactor = i / historyDays; // Price decreases over time
        const price = Math.round(basePrice * (1 - variation * trendFactor));

        await this.createPriceHistory({
          productId: created.id,
          price: price,
        });
      }
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductWithHistory(
    id: string
  ): Promise<ProductWithHistory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const history = await this.getPriceHistory(id);
    return {
      ...product,
      priceHistory: history,
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      lastUpdated: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated = {
      ...product,
      ...updates,
      lastUpdated: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    return products.filter((product) => {
      const matchesQuery =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        !category ||
        category === "All Categories" ||
        product.category === category;
      return matchesQuery && matchesCategory;
    });
  }

  async getTrendingProducts(limit = 6): Promise<Product[]> {
    const products = Array.from(this.products.values());
    // Sort by discount percentage
    return products
      .map((product) => ({
        ...product,
        discountPercent:
          ((product.originalPrice - product.currentPrice) /
            product.originalPrice) *
          100,
      }))
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, limit);
  }

  async createPriceHistory(
    insertPriceHistory: InsertPriceHistory
  ): Promise<PriceHistory> {
    const id = randomUUID();
    const priceHistory: PriceHistory = {
      ...insertPriceHistory,
      id,
      date: new Date(),
    };
    this.priceHistory.set(id, priceHistory);
    return priceHistory;
  }

  async getPriceHistory(productId: string): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values())
      .filter((history) => history.productId === productId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
    const userWatchlistItems = Array.from(this.watchlist.values()).filter(
      (item) => item.userId === userId
    );

    const watchlistWithProducts: WatchlistItem[] = [];
    for (const item of userWatchlistItems) {
      const product = this.products.get(item.productId);
      if (product) {
        watchlistWithProducts.push({
          ...item,
          product,
        });
      }
    }

    return watchlistWithProducts.sort(
      (a, b) => b.addedAt.getTime() - a.addedAt.getTime()
    );
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = randomUUID();
    const watchlistItem: Watchlist = {
      ...insertWatchlist,
      id,
      alertEnabled: insertWatchlist.alertEnabled ?? true,
      addedAt: new Date(),
    };
    this.watchlist.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(
    userId: string,
    productId: string
  ): Promise<boolean> {
    const item = Array.from(this.watchlist.entries()).find(
      ([_, watchlistItem]) =>
        watchlistItem.userId === userId && watchlistItem.productId === productId
    );

    if (item) {
      this.watchlist.delete(item[0]);
      return true;
    }
    return false;
  }

  async updateWatchlistItem(
    userId: string,
    productId: string,
    updates: Partial<Watchlist>
  ): Promise<Watchlist | undefined> {
    const entry = Array.from(this.watchlist.entries()).find(
      ([_, watchlistItem]) =>
        watchlistItem.userId === userId && watchlistItem.productId === productId
    );

    if (!entry) return undefined;

    const [id, item] = entry;
    const updated = { ...item, ...updates };
    this.watchlist.set(id, updated);
    return updated;
  }

  async isInWatchlist(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.watchlist.values()).some(
      (item) => item.userId === userId && item.productId === productId
    );
  }
}

export const storage = new MemStorage();
