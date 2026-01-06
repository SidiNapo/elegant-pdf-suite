import { motion } from 'framer-motion';
import { Upload, File, X, Plus } from 'lucide-react';
import { useState, useCallback } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  files?: File[];
  title?: string;
  description?: string;
}

const FileUpload = ({
  onFilesSelected,
  accept = '.pdf',
  multiple = false,
  maxFiles = 10,
  files = [],
  title = 'Déposez vos fichiers ici',
  description = 'ou cliquez pour sélectionner',
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.slice(0, multiple ? maxFiles : 1);
      onFilesSelected(validFiles);
    },
    [multiple, maxFiles, onFilesSelected]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = selectedFiles.slice(0, multiple ? maxFiles : 1);
      onFilesSelected(validFiles);
    },
    [multiple, maxFiles, onFilesSelected]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      onFilesSelected(newFiles);
    },
    [files, onFilesSelected]
  );

  const addMoreFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const remainingSlots = maxFiles - files.length;
      const newFiles = [...files, ...selectedFiles.slice(0, remainingSlots)];
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {files.length === 0 ? (
        <motion.label
          className={`upload-zone flex flex-col items-center justify-center cursor-pointer ${
            isDragOver ? 'dragover' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6"
            animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
          >
            <Upload className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground text-center">
            {description}
          </p>
          <p className="text-sm text-muted-foreground/60 mt-4">
            {multiple ? `Jusqu'à ${maxFiles} fichiers` : 'Un fichier à la fois'}
          </p>
        </motion.label>
      ) : (
        <div className="space-y-4">
          {/* File List */}
          <div className="space-y-3">
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <File className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Add More Button */}
          {multiple && files.length < maxFiles && (
            <label className="glass-card rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="file"
                accept={accept}
                multiple
                onChange={addMoreFiles}
                className="hidden"
              />
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Ajouter plus de fichiers</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
