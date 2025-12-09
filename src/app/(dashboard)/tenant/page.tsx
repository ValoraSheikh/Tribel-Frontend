import { USE_TENANT_QUERY_KEY } from "@/hooks/use-tenant";
import { serverTenantApi } from "@/lib/api/tenant.api";
import { requireTenant } from "@/lib/auth/require-tenant";
import { createServerAxios } from "@/lib/axios/axios-server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { TenantProfile } from "@/feature/tenant/tenant-profile";
import TenantProfileSkeleton  from "./loading";

const Page = async () => {
  await requireTenant();

  const queryClient = new QueryClient();
  const axiosServer = await createServerAxios();

  await queryClient.prefetchQuery({
    queryKey: [USE_TENANT_QUERY_KEY],
    queryFn: () => serverTenantApi.getTenant(axiosServer),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<TenantProfileSkeleton />}>
        <TenantProfile  />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
