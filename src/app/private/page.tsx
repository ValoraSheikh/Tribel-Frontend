import { requireAuth } from "@/lib/auth-utils";

const ComponentName = async () => {
  const session = await requireAuth();
  const res = JSON.stringify(session, null, 2);

  return (
    <div>
      <h1>Welcome to private page {session?.nickname}</h1>
      <pre>{res}</pre>
    </div>
  );
};

export default ComponentName;
