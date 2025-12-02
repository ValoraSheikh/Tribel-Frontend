"use client";

import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const handleLogout = () => {
    window.location.href = "http://localhost:3000/logout";
  };

  return <Button variant="link" onClick={handleLogout}>Logout</Button>;
};

export default LogoutButton;
