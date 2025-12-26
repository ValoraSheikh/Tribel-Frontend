import { TenantForm } from "@/features/tenant/components/dashboard/create-tenant";
import { createdTenant } from "@/lib/auth/require-tenant";

const Page = async () => {
  await createdTenant();
  return (
    <div className="flex items-center justify-center min-h-screen my-6">
      <TenantForm />
    </div>
  );
};

export default Page;
