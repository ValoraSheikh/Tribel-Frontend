import Footer from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";
import { requireAuth } from "@/lib/auth/auth-utils";
import { requireTenant } from "@/lib/auth/require-tenant";

const Layout = async({ children }: { children: React.ReactNode }) => {
  const session = await requireAuth();
  const tenant = await requireTenant();
  return (
    <>
      <Navbar session={session} tenant={tenant} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
