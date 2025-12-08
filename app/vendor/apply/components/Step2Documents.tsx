"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import {
  DocumentData,
  DocumentType,
  ValidationErrors,
} from "@/types/vendor-application";

interface Step2DocumentsProps {
  data: DocumentData[];
  errors: ValidationErrors;
  onDataChange: (data: DocumentData[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const documentTypes = [
  {
    type: DocumentType.BUSINESS_LICENSE,
    label: "Business License",
    description: "Your valid business license or registration certificate",
  },
  {
    type: DocumentType.HEALTH_PERMIT,
    label: "Health Permit",
    description: "Current health department permit or food handler's certificate",
  },
  {
    type: DocumentType.INSURANCE,
    label: "Liability Insurance",
    description: "Proof of general liability insurance coverage",
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export const Step2Documents: React.FC<Step2DocumentsProps> = ({
  data,
  errors,
  onDataChange,
  onNext,
  onBack,
}) => {
  const [documents, setDocuments] = useState<DocumentData[]>(data);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [dragOver, setDragOver] = useState<DocumentType | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileSelect = useCallback(
    async (file: File, type: DocumentType) => {
      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be less than 5MB");
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        alert("Only PDF, JPG, and PNG files are allowed");
        return;
      }

      // Create document data
      const docData: DocumentData = {
        type,
        fileName: file.name,
        fileSize: file.size,
        file,
        uploadedAt: new Date(),
      };

      // Upload to server
      setUploading({ ...uploading, [type]: true });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const response = await fetch("/api/vendor/documents", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();

        // Update document with server response
        docData.id = result.data.id;
        docData.fileUrl = result.data.fileUrl;

        // Update documents array
        const existingIndex = documents.findIndex((d) => d.type === type);
        const updatedDocs =
          existingIndex >= 0
            ? documents.map((d, i) => (i === existingIndex ? docData : d))
            : [...documents, docData];

        setDocuments(updatedDocs);
        onDataChange(updatedDocs);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload document. Please try again.");
      } finally {
        setUploading({ ...uploading, [type]: false });
      }
    },
    [documents, uploading, onDataChange]
  );

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, type);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, type: DocumentType) => {
      e.preventDefault();
      setDragOver(null);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file, type);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent, type: DocumentType) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const removeDocument = (type: DocumentType) => {
    const updatedDocs = documents.filter((d) => d.type !== type);
    setDocuments(updatedDocs);
    onDataChange(updatedDocs);
  };

  const getDocumentByType = (type: DocumentType) => {
    return documents.find((d) => d.type === type);
  };

  const validateAndNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="neo-card-glass neo-shadow-lg rounded-neo p-6">
        <div>
          <h2 className="neo-heading text-2xl mb-2">
            Required Documents
          </h2>
          <p className="text-text-secondary mb-6">
            Upload the following documents to verify your business
          </p>

          <Alert variant="info" className="mb-6">
            <p className="text-sm">
              <strong>File Requirements:</strong> PDF, JPG, or PNG format. Maximum size: 5MB per file.
            </p>
          </Alert>

          <div className="space-y-6">
            {documentTypes.map(({ type, label, description }) => {
              const doc = getDocumentByType(type);
              const isUploading = uploading[type];

              return (
                <div key={type} className="neo-border-thick rounded-neo neo-shadow">
                  <div className="p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-text-primary">
                          {label} <span className="text-error">*</span>
                        </h3>
                        <p className="text-sm text-text-secondary">{description}</p>
                      </div>
                      {doc && !isUploading && (
                        <button
                          onClick={() => removeDocument(type)}
                          className="text-error hover:text-error/80 text-sm font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Upload Area */}
                    {!doc && !isUploading && (
                      <div
                        onDrop={(e) => handleDrop(e, type)}
                        onDragOver={(e) => handleDragOver(e, type)}
                        onDragLeave={handleDragLeave}
                        className={`neo-border-thick border-dashed rounded-neo p-8 text-center transition-all ${
                          dragOver === type
                            ? "neo-border-primary bg-primary/5 neo-shadow-primary"
                            : "bg-background hover:neo-shadow"
                        }`}
                      >
                        <svg
                          className="mx-auto h-16 w-16 text-text-secondary mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-text-primary font-bold mb-3 text-lg">
                          Drag and drop your file here, or
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRefs.current[type]?.click()}
                        >
                          Browse Files
                        </Button>
                        <input
                          ref={(el) => (fileInputRefs.current[type] = el)}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileInputChange(e, type)}
                          className="hidden"
                        />
                      </div>
                    )}

                    {/* Uploading State */}
                    {isUploading && (
                      <div className="flex items-center justify-center py-8">
                        <Spinner size="md" />
                        <span className="ml-3 text-text-secondary">Uploading...</span>
                      </div>
                    )}

                    {/* Uploaded Document */}
                    {doc && !isUploading && (
                      <div className="flex items-center gap-4 p-4 bg-success/10 rounded-neo neo-border neo-shadow">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-12 w-12 text-success"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-text-primary truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-sm text-text-secondary font-medium">
                            {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded{" "}
                            {doc.uploadedAt &&
                              new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {errors[type] && (
                      <p className="error-message mt-2">{errors[type]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="lg">
          Back
        </Button>
        <Button onClick={validateAndNext} variant="primary" size="lg">
          Continue to Menu
        </Button>
      </div>
    </div>
  );
};
