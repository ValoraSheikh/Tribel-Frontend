import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-siidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/auth/auth-utils";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col h-full w-full">
          <AppHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Layout;
