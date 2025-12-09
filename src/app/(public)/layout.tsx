import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { requireSession } from "@/lib/auth/auth-utils";
import { requireTenant } from "@/lib/auth/require-tenant";

const Layout = async({ children }: { children: React.ReactNode }) => {
  const session = await requireSession();
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
