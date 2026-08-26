import Footer from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";
import { getSession } from "@/lib/auth/auth-utils";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  const tenant = session?.tenant ?? null;
  return (
    <>
      <Navbar session={session} tenant={tenant} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
