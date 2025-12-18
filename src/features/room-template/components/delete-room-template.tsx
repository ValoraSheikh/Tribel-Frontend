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
import {
  useDeleteRoomTemplate,
} from "../hooks/use-room-template";
import { Trash2Icon } from "lucide-react";

type PropertyIdProps = {
  propertyId: string;
};

type RoomTemplateIdProps = {
  roomTemplateId: string;
};

export function DeleteRoomTemplateModal({
  propertyId,
  roomTemplateId,
}: PropertyIdProps & RoomTemplateIdProps) {
  const deleteRoomTemplate = useDeleteRoomTemplate(propertyId, roomTemplateId);

  function handleDelete() {
    deleteRoomTemplate.mutate(undefined, {
      onSuccess: () => {
        toast.success("Property deleted successfully ");
      },
      onError: () => {
        toast.error("Failed to delete property");
      },
    });
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
        >
          <Trash2Icon className="w-3.5 h-3.5 mr-1.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this room
            template and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteRoomTemplate.isPending}
              onClick={() => handleDelete()}
              className="min-w-[100px]"
            >
              {deleteRoomTemplate.isPending
                ? "Deleting..."
                : "Delete Room Template"}
            </Button>
          </>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
