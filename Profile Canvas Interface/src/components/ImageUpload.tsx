import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  images: File[];
  imagePreviews: string[];
  onImagesSelect: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

export function ImageUpload({
  images,
  imagePreviews,
  onImagesSelect,
  onImageRemove,
  maxImages = 5,
  maxFileSize = 10,
  className = '',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onImagesSelect(files);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className="border-2 border-dashed hover:border-slate-400 transition-colors">
        <CardContent className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={images.length >= maxImages}
          />
          
          <div
            onClick={openFileDialog}
            className={`cursor-pointer flex flex-col items-center gap-2 ${
              images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              {images.length >= maxImages ? (
                <ImagePlus className="h-6 w-6 text-slate-400" />
              ) : (
                <Camera className="h-6 w-6 text-slate-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {images.length >= maxImages 
                  ? `Maximum ${maxImages} images reached` 
                  : 'Click to upload images'
                }
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, GIF up to {maxFileSize}MB each
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border shadow-sm"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                onClick={() => onImageRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <Badge className="absolute bottom-2 left-2 text-xs bg-primary/90">
                  Main
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}