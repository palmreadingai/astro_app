import React, { useState } from 'react';
import { Camera, Check, Upload } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { useImageCompression } from '../../hooks/useImageCompression';

type UploadState = 'empty' | 'uploading' | 'success' | 'error';

interface ImageUploadProps {
  images: string[];
  onImageUpload: (imageUrl: string, base64: string) => void;
  onContinue: () => void;
}

export default function ImageUpload({ images, onImageUpload, onContinue }: ImageUploadProps) {
  const { user } = useAuth();
  const { compressImage } = useImageCompression();
  const [uploadState, setUploadState] = useState<UploadState>('empty');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  const currentImage = images[0] || null;
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      setErrorMessage('Please sign in to upload images');
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      setUploadProgress(20);

      // Compress image
      const { compressedFile } = await compressImage(file);
      setUploadProgress(40);

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${timestamp}.${fileExtension}`;

      setUploadProgress(60);

      // Upload directly to Supabase storage
      const { data, error } = await supabase.storage
        .from('palm-images')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setUploadProgress(80);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('palm-images')
        .getPublicUrl(data.path);

      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadState('success');
        // Only pass public URL, no base64 local storage
        onImageUpload(publicUrl, '');
      }, 300);

    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      setUploadState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    }
  };


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Upload Palm Image</h2>
      </div>

      <div className="bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-4 shadow-lg mb-4">
        <h3 className="font-semibold text-white mb-3 text-sm">📸 Tips for best results:</h3>
        <div className="space-y-2 text-sm text-purple-200">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Use good lighting - natural light works best</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Keep palm flat and fingers slightly spread</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Upload image of your dominant hand</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Ensure palm lines are clearly visible</span>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-500/20 border border-amber-400/50 rounded-2xl p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          <h3 className="font-semibold text-amber-100 text-sm">Important Notice</h3>
        </div>
        <p className="text-amber-100 text-sm">
          You have only one reading available. Please ensure your image is clear and you answer all upcoming questions accurately.
        </p>
      </div>

      <div className="space-y-4">
        {/* Large Preview-First Design */}
        <div className="relative">
          {uploadState === 'empty' && !currentImage && (
            <div className="border-2 border-dashed border-purple-400/30 rounded-2xl p-12 text-center hover:border-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 bg-black/20 backdrop-blur-sm">
              <Camera className="w-16 h-16 text-purple-200 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="palm-upload"
              />
              <label
                htmlFor="palm-upload"
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 inline-block shadow-lg hover:shadow-xl"
              >
                Choose Palm Image
              </label>
              <p className="text-sm text-purple-200 mt-3">PNG, JPG up to 10MB</p>
            </div>
          )}

          {uploadState === 'uploading' && (
            <div className="border-2 border-yellow-400/50 rounded-2xl p-12 text-center bg-yellow-400/10 backdrop-blur-lg">
              <Upload className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <div className="space-y-3">
                <p className="text-yellow-300 font-medium">Uploading your palm image...</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-purple-200">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {(uploadState === 'success' || currentImage) && currentImage && (
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl border-2 border-green-400/50 bg-green-400/10 backdrop-blur-lg">
                <img
                  src={currentImage}
                  alt="Your palm"
                  className="w-full h-80 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Success indicator */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-fade-in">
                  <Check className="w-6 h-6 text-white" />
                </div>

                {/* Action button overlay */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="palm-reupload"
                  />
                  <label
                    htmlFor="palm-reupload"
                    className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-center cursor-pointer backdrop-blur-sm block border border-white/30"
                  >
                    Change Image
                  </label>
                </div>
              </div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="border-2 border-red-400/50 rounded-2xl p-12 text-center bg-red-500/10 backdrop-blur-lg">
              <Camera className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-300 font-medium mb-2">Upload Failed</p>
              <p className="text-sm text-red-200 mb-4">{errorMessage}</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="palm-retry"
              />
              <label
                htmlFor="palm-retry"
                className="cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 inline-block"
              >
                Try Again
              </label>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!currentImage}
        className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform ${
          currentImage 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-[1.02] cursor-pointer' 
            : 'bg-black/30 text-purple-300 cursor-not-allowed border border-purple-500/30'
        }`}
      >
        Continue to Questions
      </button>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}