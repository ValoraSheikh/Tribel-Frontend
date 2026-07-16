import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const Page = () => {
  redirect(`${API_BASE}/auth/login`);
};

export default Page;
