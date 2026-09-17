import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, AlertCircle } from "lucide-react";

interface DropzoneUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label?: string;
}

export const DropzoneUploader: React.FC<DropzoneUploaderProps> = ({
  onFilesSelected,
  accept,
  maxFiles = 5,
  label = "Drag & drop files here, or click to browse"
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
        isDragActive
          ? "border-cyan-500 bg-cyan-500/10 scale-[1.01]"
          : isDragReject
          ? "border-rose-500 bg-rose-500/10"
          : "border-zinc-700 hover:border-cyan-500/50 bg-zinc-900/60 hover:bg-zinc-900"
      }`}
    >
      <input {...getInputProps()} />
      <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3 text-cyan-400">
        {isDragReject ? (
          <AlertCircle className="w-6 h-6 text-rose-400" />
        ) : (
          <UploadCloud className="w-6 h-6" />
        )}
      </div>
      <p className="text-sm font-semibold text-zinc-200">{label}</p>
      <p className="text-xs text-zinc-400 mt-1">Supports images, documents, audio, and code snippets</p>
    </div>
  );
};
