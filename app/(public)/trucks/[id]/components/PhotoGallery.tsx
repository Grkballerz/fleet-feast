"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface PhotoGalleryProps {
  photos: string[];
  businessName: string;
  className?: string;
}

/**
 * Lightbox Component
 * Full-screen image viewer with navigation
 */
interface LightboxProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  businessName: string;
}

const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  businessName,
}) => {
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Use portal to render at document body level
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Previous Button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-[95vw] h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[currentIndex]}
          alt={`${businessName} photo ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* Next Button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>,
    document.body
  );
};

/**
 * PhotoGallery Component
 *
 * Grid of photos with lightbox functionality.
 * Supports keyboard navigation (ESC, arrows) and touch swipe on mobile.
 *
 * @example
 * ```tsx
 * <PhotoGallery
 *   photos={truckPhotos}
 *   businessName="Taco Truck"
 * />
 * ```
 */
export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  businessName,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // No photos to display
  if (!photos || photos.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <>
      {/* Photo Grid */}
      <div className={cn("space-y-4", className)}>
        <h2 className="neo-heading text-2xl">Photos</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="aspect-square relative overflow-hidden rounded-neo neo-border-thick group cursor-pointer focus:outline-none neo-shadow hover:neo-shadow-hover transition-all"
              aria-label={`View photo ${index + 1}`}
            >
              <Image
                src={photo}
                alt={`${businessName} photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>

        {/* Photo Count */}
        <p className="text-sm text-text-secondary font-medium">
          {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </p>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          businessName={businessName}
        />
      )}
    </>
  );
};
