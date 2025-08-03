import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../src/utils/api";

interface Transaction {
  _id: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
  processedAt?: string;
}

interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      const response = await api.get(`/admin/transactions?${params}`);
      const data: TransactionResponse = response.data;
      
      setTransactions(data.transactions);
      setTotalPages(data.pagination.pages);
      setCurrentPage(data.pagination.page);
      setTotalTransactions(data.pagination.total);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTransactions(page);
  };

  // Format transaction type for display
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'TOKEN_PURCHASE':
        return 'Token Purchase';
      case 'IMAGE_UNLOCK':
        return 'Image Unlock';
      case 'ADMIN_CREDIT':
        return 'Admin Credit';
      default:
        return type.replace('_', ' ');
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'active';
      case 'PENDING':
        return 'pending';
      case 'FAILED':
        return 'inactive';
      default:
        return 'pending';
    }
  };

  // Format transactions data for DataTable
  const transactionsData = transactions.map((transaction) => ({
    id: transaction._id,
    name: `${transaction.user.name} - ${formatTransactionType(transaction.type)}`,
    status: formatStatus(transaction.status) as "active" | "pending" | "inactive",
    date: new Date(transaction.createdAt).toLocaleDateString(),
    amount: `${transaction.currency} ${transaction.amount.toFixed(2)}`,
    description: transaction.description,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">
              View and manage all transaction history across the platform.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
            <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {transactions.filter(t => t.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Failed</h3>
            <p className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.status === 'FAILED').length}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading transactions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable 
              title="All Transactions" 
              data={transactionsData}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Transaction Details Modal could be added here */}
      </div>
    </AdminLayout>
  );
} 