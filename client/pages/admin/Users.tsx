import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Eye, Edit, Trash2, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../src/utils/api";

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  tokens: number;
  isAdmin: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddTokensModal, setShowAddTokensModal] = useState(false);
  const [tokensToAdd, setTokensToAdd] = useState("");
  const [addTokensLoading, setAddTokensLoading] = useState(false);

  // Fetch users
  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (search) {
        params.append("search", search);
      }

      const response = await api.get(`/admin/users?${params}`);
      const data: UserResponse = response.data;
      
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
  };

  // Add tokens to user
  const handleAddTokens = async () => {
    if (!selectedUser || !tokensToAdd) return;

    try {
      setAddTokensLoading(true);
              await api.post(`/admin/users/${selectedUser._id}/tokens`, {
        amount: parseInt(tokensToAdd),
        description: `Admin credit: ${tokensToAdd} tokens`
      });

      // Refresh users list
      await fetchUsers(currentPage, searchTerm);
      setShowAddTokensModal(false);
      setSelectedUser(null);
      setTokensToAdd("");
    } catch (error) {
      console.error("Error adding tokens:", error);
    } finally {
      setAddTokensLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
              await api.delete(`/admin/users/${userId}`);
      await fetchUsers(currentPage, searchTerm);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Format users data for DataTable
  const usersData = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    tokens: user.tokens,
    status: user.isActive !== false ? "active" as const : "inactive" as const,
    date: new Date(user.createdAt).toLocaleDateString(),
    isAdmin: user.isAdmin,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground">
              Manage and monitor user accounts across your platform.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleSearch}>
            <Filter className="h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable 
              title="All Users" 
              data={usersData}
              actions={[
                {
                  label: "View",
                  icon: Eye,
                  onClick: (user) => setSelectedUser(users.find(u => u._id === user.id) || null),
                },
                {
                  label: "Add Tokens",
                  icon: DollarSign,
                  onClick: (user) => {
                    setSelectedUser(users.find(u => u._id === user.id) || null);
                    setShowAddTokensModal(true);
                  },
                },
                {
                  label: "Edit",
                  icon: Edit,
                  onClick: (user) => console.log("Edit user:", user.id),
                },
                {
                  label: "Delete",
                  icon: Trash2,
                  onClick: (user) => handleDeleteUser(user.id),
                  className: "text-red-600 hover:text-red-700",
                },
              ]}
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

        {/* Add Tokens Modal */}
        {showAddTokensModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Tokens to User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User</label>
                  <p className="text-sm text-gray-600">{selectedUser.name} ({selectedUser.email})</p>
                  <p className="text-sm text-gray-600">Current tokens: {selectedUser.tokens}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tokens to Add</label>
                  <Input
                    type="number"
                    value={tokensToAdd}
                    onChange={(e) => setTokensToAdd(e.target.value)}
                    placeholder="Enter number of tokens"
                    min="1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddTokensModal(false);
                      setSelectedUser(null);
                      setTokensToAdd("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTokens}
                    disabled={!tokensToAdd || addTokensLoading}
                  >
                    {addTokensLoading ? "Adding..." : "Add Tokens"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
