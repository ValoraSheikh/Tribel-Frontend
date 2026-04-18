import { useState, useRef } from "react";
import { useUpdateAvatar } from "../hooks/use-user";
import {
  useGetUploadUrl,
  useUploadFile,
} from "@/features/upload/hooks/use-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { toUrl } from "@/utils/image";
import { Spinner } from "@/components/ui/spinner";

export function UpdateAvatar({
  userId,
  avatarUrl,
  firstName,
  lastName,
}: {
  userId: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrl = useGetUploadUrl();
  const uploadFile = useUploadFile();
  const updateAvatar = useUpdateAvatar();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      const { uploadUrl, key } = await getUploadUrl.mutateAsync({
        entity: "user",
        fileType: selectedFile.type,
        entityId: userId,
      });

      uploadFile.mutate({
        url: uploadUrl,
        file: selectedFile,
      });

      await updateAvatar.mutateAsync({
        key: key,
      });

      setOpen(false);
      handleRemovePreview();
    } catch (error) {
      toast.error("Failed to update avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) handleRemovePreview();
      }}
    >
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer inline-block rounded-full">
          <Avatar className="h-24 w-24 border-2 border-border transition-opacity group-hover:opacity-80">
            <AvatarImage src={toUrl(avatarUrl)} className="object-cover" />
            <AvatarFallback className="text-xl">
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Choose a new avatar. Recommended size is 256x256px.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                Click to select an image
              </p>
            </div>
          ) : (
            <div className="relative flex justify-center">
              <Avatar className="h-40 w-40 border shadow-sm">
                <AvatarImage src={previewUrl} className="object-cover" />
              </Avatar>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-0 right-1/4 rounded-full h-8 w-8 shadow-md"
                onClick={handleRemovePreview}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                <span>Processing...</span>
              </span>
            ) : (
              "Save Image"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
