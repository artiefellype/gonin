import React, { ChangeEvent } from 'react'
import { FaPaperclip } from "react-icons/fa";

interface FileInputProps {
    onFileSelect: (file: File) => void;
    onFileError?: (message: string) => void;
    accept?: string;
  }

export const InputFile = ({
  onFileSelect,
  onFileError,
  accept = "image/*,video/*",
}:FileInputProps) => {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          if (!isImage && !isVideo) {
            onFileError?.('Por favor escolha uma imagem ou vídeo válido.');
            return;
          }
    
          const maxSizeInBytes = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
          if (file.size > maxSizeInBytes) {
            onFileError?.(
              isVideo
                ? 'Por favor selecione um vídeo menor que 50MB.'
                : 'Por favor selecione uma imagem menor que 5MB.'
            );
            return;
          }
    
          onFileSelect(file);
        }
      };
    
      return (
        <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-borderDark bg-secondary text-mutedText transition-colors hover:border-accent hover:text-accent">
          <FaPaperclip
                size={18}
                className="fill-current"
              />
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      );
}
