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
import { useDeleteProperty } from "../hooks/use-property";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PropertyIdProps = {
  propertyId: string;
};

export function DeletePropertyModal(propertyId: PropertyIdProps) {
  const deleteProperty = useDeleteProperty(propertyId.propertyId);
  const router = useRouter();

  function handleDelete(propertyId: string) {
    deleteProperty.mutate(propertyId, {
      onSuccess: () => {
        toast.success("Property deleted successfully ");
        router.push("/properties");
      },
      onError: () => {
        toast.error("Failed to delete property");
      },
    });
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete Product</Button>
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
              {deleteProperty.isPending ? "Deleting..." : "Delete Property"}
            </Button>
          </>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
