import { AdminLayout } from "@/components/admin/AdminLayout";
import { MetricCard } from "@/components/admin/MetricCard";
import { DataTable } from "@/components/admin/DataTable";
import { ChartCard } from "@/components/admin/ChartCard";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Plus,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../src/utils/api";

interface AdminStats {
  totalUsers: number;
  newUsers: number;
  totalImages: number;
  blurredImages: number;
  totalTransactions: number;
  revenue: number;
}

interface RecentTransaction {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface UserGrowth {
  date: string;
  count: number;
}

interface AdminStatsResponse {
  stats: AdminStats;
  recentTransactions: RecentTransaction[];
  userGrowth: UserGrowth[];
}

export default function Index() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      const data: AdminStatsResponse = response.data;
      
      setStats(data.stats);
      setRecentTransactions(data.recentTransactions);
      setUserGrowth(data.userGrowth);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format metrics data
  const metricsData = stats ? [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsers} from last month`,
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      change: "+8% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Total Images",
      value: stats.totalImages.toLocaleString(),
      change: `${stats.blurredImages} blurred`,
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Transactions",
      value: stats.totalTransactions.toLocaleString(),
      change: "All time",
      changeType: "positive" as const,
      icon: Activity,
    },
  ] : [];

  // Format recent transactions for DataTable
  const recentTransactionsData = recentTransactions.map((transaction) => ({
    id: transaction._id,
    name: `${transaction.user.name} - ${transaction.type}`,
    status: transaction.status as "active" | "pending" | "inactive",
    date: new Date(transaction.createdAt).toLocaleDateString(),
    amount: `$${transaction.amount.toFixed(2)}`,
  }));

  // Format user growth for chart
  const userGrowthChartData = userGrowth.map((item) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.count,
  }));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New User
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricsData.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              icon={metric.icon}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard 
            title="User Growth (Last 7 Days)" 
            data={userGrowthChartData} 
            type="area" 
          />
          <ChartCard 
            title="Revenue Overview" 
            data={userGrowthChartData} 
            type="bar" 
          />
        </div>

        {/* Data Tables Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DataTable 
            title="Recent Transactions" 
            data={recentTransactionsData} 
          />
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
