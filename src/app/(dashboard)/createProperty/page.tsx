import { CreateProperty } from "@/features/property/components/dashboard/create-property";

const Page = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50/50 p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        <CreateProperty />
      </div>
    </div>
  );
};

export default Page;
