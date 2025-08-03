import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Analytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            View detailed analytics and insights for your platform.
          </p>
        </div>

        <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground">
            Analytics dashboard coming soon...
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
