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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { useDeleteRoomTemplate } from "../../hooks/use-room-template";
import { useState } from "react";

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
  const [open, setOpen] = useState<boolean>(false);
  const deleteRoomTemplate = useDeleteRoomTemplate(propertyId, roomTemplateId);

  function handleDelete() {
    deleteRoomTemplate.mutate(undefined, {
      onSuccess: () => {
        toast.success("Room template deleted successfully ");
        setOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to delete room template", {
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
              {deleteRoomTemplate.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>Deleteing...</span>
                </span>
              ) : (
                "Delete Room Template"
              )}
            </Button>
          </>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
