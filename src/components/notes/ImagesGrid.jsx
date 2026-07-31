import React from 'react';
import { X } from 'lucide-react';

const ImagesGrid = ({ currentNote, updateNote }) => (
  <>
    {currentNote.images && currentNote.images.length > 0 && (
      <div className="flex flex-col gap-6 mb-6">
        {currentNote.images.map((imgUrl, index) => (
          <div key={index} className="relative group w-full">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <img
                src={imgUrl}
                alt={`Note image ${index + 1}`}
                className="w-full h-auto max-h-[600px] object-contain"
              />
              <button
                onClick={() => {
                  // No need to revoke if using base64
                  const updatedImages = [...currentNote.images];
                  updatedImages.splice(index, 1);
                  updateNote(currentNote.id, { images: updatedImages });
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-red-500 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                title="Remove Image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </>
);

export default ImagesGrid;
