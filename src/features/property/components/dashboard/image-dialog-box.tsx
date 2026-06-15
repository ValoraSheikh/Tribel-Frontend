"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toUrl } from "@/utils/image";

interface ZappoTelGalleryProps {
  images: string[];
  triggerText?: string;
}

export default function ImageGalleryDialog({
  images,
  triggerText = "Show all photos",
}: ZappoTelGalleryProps) {
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="absolute bottom-4 right-4 text-xs font-semibold shadow-md"
        >
          {triggerText}
        </Button>
      </DialogTrigger>

      {/* FIX 1: Added `sm:max-w-full sm:rounded-none w-full` to explicitly override 
        ShadCN's default desktop constraints.
      */}
      <DialogContent 
        className="max-w-full sm:max-w-full w-full h-[100dvh] m-0 p-0 border-none rounded-none sm:rounded-none bg-background overflow-y-auto flex flex-col gap-0 shadow-none duration-300"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-md border-b">
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close gallery</span>
            </Button>
          </DialogClose>

          <div className="text-sm font-semibold">{images.length} Images</div>

          <div className="w-9" />
        </div>

        {/* Masonry Image Grid 
          Expanded max-width to allow big Airbnb-style images on large screens.
        */}
        <div className="p-4 md:p-8 lg:p-12 mx-auto w-full max-w-[1600px]">
          {/* 1 column mobile, 2 columns tablet, 3 columns desktop */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative break-inside-avoid w-full group overflow-hidden  bg-muted mb-4 md:mb-6"
              >
                {/* FIX 2: Switched to standard HTML <img>. 
                  This allows the browser to calculate the natural height based on the true 
                  image dimensions, letting vertical/horizontal images stack properly.
                */}
                <img
                  src={toUrl(url)!}
                  alt={`ZappoTel property image ${index + 1}`}
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}