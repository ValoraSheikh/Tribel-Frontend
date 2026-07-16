import { requireAuth } from "@/lib/auth/auth-utils";

const ComponentName = async () => {
  const session = await requireAuth();

  return (
    <div>
      <h1>Welcome, {session?.nickname}</h1>
    </div>
  );
};

export default ComponentName;
