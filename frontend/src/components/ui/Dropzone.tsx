"use client";

import React, { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { DropzoneProps, FileValidationResult, UploadResult } from "@/types/ui";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const VARIANT_STYLES = {
  avatar: {
    container: "w-32 h-32 rounded-full",
    preview: "w-32 h-32 rounded-full",
    icon: "w-8 h-8",
    text: "text-xs",
  },
  banner: {
    container: "w-full h-48 rounded-lg",
    preview: "w-full h-48 rounded-lg",
    icon: "w-12 h-12",
    text: "text-sm",
  },
};

function validateFile(file: File): FileValidationResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP).`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File too large (${sizeMB}MB). Maximum size is 5MB.`,
    };
  }

  return { isValid: true };
}

async function mockUpload(file: File): Promise<UploadResult> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 500),
  );

  const objectUrl = URL.createObjectURL(file);

  if (Math.random() < 0.1) {
    return {
      success: false,
      error: "Upload failed. Please try again.",
    };
  }

  return {
    success: true,
    url: objectUrl,
  };
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      variant = "avatar",
      value,
      onChange,
      onError,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const styles = VARIANT_STYLES[variant];

    const handleFile = useCallback(
      async (file: File) => {
        setError(null);

        const validation = validateFile(file);
        if (!validation.isValid) {
          setError(validation.error || "Invalid file");
          onError?.(validation.error || "Invalid file");
          return;
        }

        setIsUploading(true);

        try {
          const result = await mockUpload(file);

          if (result.success && result.url) {
            setPreview(result.url);
            onChange?.(result.url);
          } else {
            setError(result.error || "Upload failed");
            onError?.(result.error || "Upload failed");
          }
        } catch {
          const errorMessage = "An unexpected error occurred";
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setIsUploading(false);
        }
      },
      [onChange, onError],
    );

    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          setIsDragging(true);
        }
      },
      [disabled],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
          handleFile(files[0]);
        }
      },
      [disabled, handleFile],
    );

    const handleClick = useCallback(() => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, [disabled]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          handleFile(files[0]);
        }
        e.target.value = "";
      },
      [handleFile],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setError(null);
        onChange?.(null);
      },
      [onChange],
    );

    const handleErrorDismiss = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setError(null);
    }, []);

    return (
      <div className="space-y-2">
        <div
          ref={ref}
          className={cn(
            "relative flex items-center justify-center border-2 border-dashed cursor-pointer transition-all duration-200",
            styles.container,
            isDragging
              ? "border-gold-500 bg-gold-500/10"
              : "border-stellar-slate hover:border-gold-400 hover:bg-stellar-lightNavy/50",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500 bg-red-500/10",
            className,
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          {preview && !error && (
            <>
              <img
                src={preview}
                alt="Preview"
                className={cn("absolute inset-0 object-cover", styles.preview)}
              />
              <button
                onClick={handleClear}
                className="absolute top-1 right-1 p-1 bg-stellar-navy/80 rounded-full hover:bg-stellar-navy transition-colors"
                type="button"
              >
                <X className="w-4 h-4 text-stellar-white" />
              </button>
            </>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stellar-navy/90 p-2">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-xs text-red-400 text-center mb-2">{error}</p>
              <button
                onClick={handleErrorDismiss}
                className="text-xs text-stellar-slate hover:text-stellar-white transition-colors"
                type="button"
              >
                Try again
              </button>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stellar-navy/90">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
              <p className={cn("mt-2 text-stellar-slate", styles.text)}>
                Uploading...
              </p>
            </div>
          )}

          {!preview && !isUploading && !error && (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              {isDragging ? (
                <ImageIcon className={cn("text-gold-500 mb-2", styles.icon)} />
              ) : (
                <Upload
                  className={cn("text-stellar-slate mb-2", styles.icon)}
                />
              )}
              <p className={cn("text-stellar-slate font-medium", styles.text)}>
                {isDragging ? "Drop image here" : "Drag & drop"}
              </p>
              <p className={cn("text-stellar-slate/60 mt-1", styles.text)}>
                or click to browse
              </p>
              <p className={cn("text-stellar-slate/40 mt-2", styles.text)}>
                JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Dropzone.displayName = "Dropzone";

export { Dropzone };
