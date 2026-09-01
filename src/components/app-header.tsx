import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";

export const AppHeader = () => {
  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <DashboardBreadcrumb />
    </header>
  );
};
