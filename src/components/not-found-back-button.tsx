"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotFoundBackButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className="min-h-11 px-5 text-primary"
      onClick={() => window.history.back()}
    >
      <ArrowLeft aria-hidden="true" />
      Go back
    </Button>
  );
}
