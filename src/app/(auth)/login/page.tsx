import { redirect } from "next/navigation";

const Page = () => {
  redirect("http://localhost:3000/auth/login");
};

export default Page;
