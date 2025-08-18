import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Eye, Bell, Tag, TrendingDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  interface DashboardStats {
    totalSaved: number;
    itemsWatched: number;
    priceAlerts: number;
    dealsFound: number;
  }

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
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
              Please login to view your dashboard.
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

  const recentActivity = [
    {
      description: "Price dropped for Premium Wireless Headphones",
      time: "2 hours ago",
      amount: "-$50",
      type: "price_drop",
    },
    {
      description: 'Added MacBook Pro 14" to watchlist',
      time: "1 day ago",
      amount: "",
      type: "added",
    },
    {
      description: "Price alert triggered for iPhone 15 Pro",
      time: "2 days ago",
      amount: "-$100",
      type: "alert",
    },
    {
      description: "PlayStation 5 back in stock",
      time: "3 days ago",
      amount: "",
      type: "stock",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl font-bold text-gray-900 mb-8"
          data-testid="dashboard-title"
        >
          Dashboard
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg" data-testid="total-saved-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Saved</p>
                  <p
                    className="text-2xl font-bold text-gray-900"
                    data-testid="total-saved-amount"
                  >
                    {statsLoading ? "..." : `$${stats?.totalSaved || 0}`}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg" data-testid="items-watched-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Items Watched</p>
                  <p
                    className="text-2xl font-bold text-gray-900"
                    data-testid="items-watched-count"
                  >
                    {statsLoading ? "..." : stats?.itemsWatched || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg" data-testid="price-alerts-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Price Alerts</p>
                  <p
                    className="text-2xl font-bold text-gray-900"
                    data-testid="price-alerts-count"
                  >
                    {statsLoading ? "..." : stats?.priceAlerts || 0}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg" data-testid="deals-found-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Deals Found</p>
                  <p
                    className="text-2xl font-bold text-gray-900"
                    data-testid="deals-found-count"
                  >
                    {statsLoading ? "..." : stats?.dealsFound || 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Savings Over Time */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Savings Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingDown className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Savings chart would be displayed here</p>
                  <p className="text-sm text-gray-400">
                    Integration with Chart.js pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Watched Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Tag className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                  <p>Category breakdown chart would be displayed here</p>
                  <p className="text-sm text-gray-400">
                    Integration with Chart.js pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" data-testid="recent-activity-list">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  data-testid={`activity-item-${index}`}
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-medium text-gray-900"
                      data-testid={`activity-description-${index}`}
                    >
                      {activity.description}
                    </p>
                    <p
                      className="text-sm text-gray-600"
                      data-testid={`activity-time-${index}`}
                    >
                      {activity.time}
                    </p>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p
                        className="font-bold text-green-600"
                        data-testid={`activity-amount-${index}`}
                      >
                        {activity.amount}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
