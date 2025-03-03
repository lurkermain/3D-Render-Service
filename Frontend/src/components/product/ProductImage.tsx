import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProductImageProps {
  imagePreview: string;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductImage({ imagePreview, handleImageUpload }: ProductImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileUpload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full h-full flex items-center justify-center rounded">
      <div className="w-full h-full flex items-center justify-center">
        {imagePreview !== "/placeholder.svg" ? (
          <button onClick={triggerFileUpload} className="focus:outline-none">
            <img
              src={imagePreview}
              alt="Product"
              className="max-w-full max-h-full object-contain rounded"
            />
          </button>
        ) : (
          <button
            onClick={triggerFileUpload}
            className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded cursor-pointer text-center p-2"
          >
            <svg
              className="w-8 h-8 mb-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span className="text-sm text-gray-500">Upload Image</span>
          </button>
        )}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
}
