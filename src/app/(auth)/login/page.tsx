import { redirect } from "next/navigation";
import { getSafeReturnPath } from "@/lib/auth/return-to";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type LoginPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

const Page = async ({ searchParams }: LoginPageProps) => {
  const { returnTo } = await searchParams;
  const safeReturnPath = getSafeReturnPath(returnTo);
  redirect(
    `${API_BASE}/auth/login?returnTo=${encodeURIComponent(safeReturnPath)}`,
  );
};

export default Page;
