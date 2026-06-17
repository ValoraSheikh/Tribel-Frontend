"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDeleteProperty } from "../../hooks/use-property";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

type PropertyIdProps = {
  propertyId: string;
};

export function DeletePropertyModal(propertyId: PropertyIdProps) {
  const [open, setOpen] = useState<boolean>(false);
  const deleteProperty = useDeleteProperty(propertyId.propertyId);
  const router = useRouter();

  function handleDelete(propertyId: string) {
    deleteProperty.mutate(propertyId, {
      onSuccess: () => {
        toast.success("Property deleted successfully ");
        router.push("/properties");
      },
      onError: (error) => {
        toast.error("Failed to delete property", {
          description: error.message || "Something went wrong.",
          position: "bottom-right",
          classNames: {
            content: "flex flex-col gap-2",
          },
          style: {
            "--border-radius": "calc(var(--radius)  + 4px)",
          } as React.CSSProperties,
        });
      },
    });
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto min-w-[120px] bg-background hover:bg-accent hover:text-accent-foreground transition-colors">Delete Property</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            property and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteProperty.isPending}
              onClick={() => handleDelete(propertyId.propertyId)}
              className="min-w-[100px]"
            >
              {deleteProperty.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>Deleteing...</span>
                </span>
              ) : (
                "Delete Property"
              )}
            </Button>
          </>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
