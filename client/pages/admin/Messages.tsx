import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Messages() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            View and manage your messages and communications.
          </p>
        </div>

        <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground">Message center coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
