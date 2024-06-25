import React, { ChangeEvent } from 'react'
import { FaPaperclip } from "react-icons/fa";

interface FileInputProps {
    onFileSelect: (file: File) => void;
  }

const FileSelectorInput = ({onFileSelect}:FileInputProps) => {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!validImageTypes.includes(file.type)) {
            alert('Por favor escolha um arquivo válido (jpeg, png, gif)');
            return;
          }
    
          const maxSizeInBytes = 2 * 1024 * 1024;
          if (file.size > maxSizeInBytes) {
            alert('Por favor selecione um arquivo menor que 2MB');
            return;
          }
    
          onFileSelect(file);
        }
      };
    
      return (
        <label className="cursor-pointer flex items-center space-x-2">
          <FaPaperclip
                size={18}
                className="fill-slate-500 hover:fill-slate-600"
              />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      );
}

export default FileSelectorInput