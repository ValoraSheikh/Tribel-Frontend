import Footer from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";

// Public routes read cookies server-side in their pages (server axios,
// requireAuth) — render per request. The navbar itself is client-side
// and renders instantly, so no skeleton fallback is needed.
export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
