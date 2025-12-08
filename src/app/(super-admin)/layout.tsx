import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { requireAuth } from "@/lib/auth-utils";

const Layout = async({ children }: { children: React.ReactNode }) => {
  const session = await requireAuth()
  return (
    <>
      <Navbar session={session} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
