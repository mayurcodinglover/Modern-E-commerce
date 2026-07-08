"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageUploader({ onUpload, isLoading }) {
     const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const onDrop=useCallback((acceptedFiles,rejectedFiles)=>{
    setError("");

    if(rejectedFiles.length>0)
    {
        setError("Only JPG, PNG, WEBP files under 5MB are allowed");
      return;
    }
     const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    setFile(selectedFile);
     const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
  },[]);

  const {getRootProps,getInputProps,isDragActive}=useDropzone({
    onDrop,
     accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });
  
  function handleRemove(){
    setFile(null);
    setPreview(null);
    setError("");
     if (preview) URL.revokeObjectURL(preview);
  }

  async function handleUpload(){
     if (!file) {
      setError("Please select an image first");
      return;
    }
     const reader = new FileReader();
      reader.onload = (e) => {
      onUpload({ file, base64: e.target.result, preview });
    };
    reader.readAsDataURL(file);
  }

   return (
    <div className="space-y-3">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-secondary/50"
            }
          `}
        >
             <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {isDragActive ? (
              <p className="text-sm font-medium text-primary">
                Drop the image here...
              </p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drag & drop image here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      ):(
         <div className="relative rounded-lg overflow-hidden border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
           <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
           <div className="p-2 bg-secondary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {file?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({(file?.size / 1024).toFixed(0)}KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 h-7 px-2"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          </div>
      )}
       {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
       {preview && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Uploading..." : "Use this image"}
        </Button>
      )}
    </div>
  );
}