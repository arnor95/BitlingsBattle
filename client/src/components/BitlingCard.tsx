import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bitling } from "@shared/schema";

interface BitlingCardProps {
  bitling: Bitling;
  onUpvote: () => void;
  onDownvote: () => void;
  onViewDetails: () => void;
}

export default function BitlingCard({ 
  bitling, 
  onUpvote, 
  onDownvote, 
  onViewDetails 
}: BitlingCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    // Use a fallback image or display an error state
  };

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-md transition">
      <div className="h-40 bg-cover bg-center relative">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        <img 
          src={bitling.imageUrl} 
          alt={bitling.name} 
          className={`w-full h-full object-cover ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {bitling.types && bitling.types.length > 0 && (
          <div className={`absolute top-2 right-2 type-${bitling.types[0]} rounded-full text-xs px-2 py-1`}>
            {bitling.types[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-pixel text-sm">{bitling.name}</h3>
          <span className="text-xs text-gray-500">
            {bitling.creatorHandle ? `@${bitling.creatorHandle}` : ''}
          </span>
        </div>
        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{bitling.prompt}</p>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center text-sm font-medium text-gray-700 hover:text-green-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote();
              }}
            >
              <i className="ri-arrow-up-line mr-1"></i>
              <span>{bitling.upvotes || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center text-sm font-medium text-gray-700 hover:text-red-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownvote();
              }}
            >
              <i className="ri-arrow-down-line mr-1"></i>
              <span>{bitling.downvotes || 0}</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-opacity-80 p-0"
            onClick={onViewDetails}
          >
            <i className="ri-information-line"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
