import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface FullScreenImageProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const FullScreenImage: React.FC<FullScreenImageProps> = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X size={24} />
      </button>
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={36} />
      </button>
      <img
        src={images[currentIndex]}
        alt={`Full screen ${currentIndex}`}
        className="max-h-full max-w-full object-contain"
      />
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight size={36} />
      </button>
    </div>
  );
};

export default FullScreenImage;