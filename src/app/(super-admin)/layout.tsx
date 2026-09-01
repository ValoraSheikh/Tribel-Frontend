import Footer from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";
import { requireAuth } from "@/lib/auth/auth-utils";
import { requireTenant } from "@/lib/auth/require-tenant";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  await requireTenant();

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
