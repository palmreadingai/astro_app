import React, { useState } from 'react';

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  skeletonClassName?: string;
}

const BlurImage: React.FC<BlurImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  skeletonClassName = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className="relative">
      {!isLoaded && (
        <div className={`animate-pulse bg-gray-200 ${skeletonClassName} ${className}`} />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {hasError && isLoaded && (
        <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
          <span className="text-sm">Image not found</span>
        </div>
      )}
    </div>
  );
};

export default BlurImage;