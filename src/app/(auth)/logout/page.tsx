"use client";

import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const handleLogout = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    window.location.href = `${apiBase}/logout`;
  };

  return <Button variant="link" onClick={handleLogout}>Logout</Button>;
};

export default LogoutButton;
