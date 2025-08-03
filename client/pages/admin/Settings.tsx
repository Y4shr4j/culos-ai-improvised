import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Settings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application settings and preferences.
          </p>
        </div>

        <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground">Settings panel coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
