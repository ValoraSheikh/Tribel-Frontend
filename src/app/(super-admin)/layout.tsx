import Footer from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";
import { requireAuth } from "@/lib/auth/auth-utils";

const Layout = async({ children }: { children: React.ReactNode }) => {
  const session = await requireAuth()
  return (
    <>
      <Navbar session={session} tenant={session}/>
      {children}
      <Footer />
    </>
  );
};

export default Layout;
