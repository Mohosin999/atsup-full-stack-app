import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { resumeApi } from '../../api/api';
import { Resume, ResumeContent } from '../../types';
import LoadingSpinner from './LoadingSpinner';

interface FileUploadProps {
  onFileSelect: (resume: Resume, content: ResumeContent) => void;
  acceptedTypes?: string[];
  maxSize?: number;
}

interface UploadState {
  file: File | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  resume?: Resume;
}

export default function FileUpload({
  onFileSelect,
  acceptedTypes = ['.pdf'],
  maxSize = 10 * 1024 * 1024,
}: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    status: 'idle',
    progress: 0,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadState({
        file,
        status: 'uploading',
        progress: 0,
      });

      const formData = new FormData();
      formData.append('resume', file);

      try {
        const progressInterval = setInterval(() => {
          setUploadState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90),
          }));
        }, 100);

        const response = await resumeApi.upload(formData);
        
        clearInterval(progressInterval);
        
        setUploadState((prev) => ({
          ...prev,
          status: 'success',
          progress: 100,
          resume: response.data.data,
        }));

        onFileSelect(response.data.data, response.data.data.content);
      } catch (error: any) {
        setUploadState((prev) => ({
          ...prev,
          status: 'error',
          progress: 0,
          error: error.response?.data?.message || 'Failed to upload file',
        }));
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize,
  });

  const removeFile = () => {
    setUploadState({
      file: null,
      status: 'idle',
      progress: 0,
    });
  };

  if (uploadState.file && uploadState.status !== 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            {uploadState.status === 'success' ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : uploadState.status === 'error' ? (
              <AlertCircle className="w-6 h-6 text-error" />
            ) : (
              <File className="w-6 h-6 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
              {uploadState.file.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            
            {uploadState.status === 'uploading' && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploading... {uploadState.progress}%</p>
              </div>
            )}
            
            {uploadState.status === 'error' && (
              <p className="text-sm text-error mt-1">{uploadState.error}</p>
            )}
          </div>

          {(uploadState.status === 'success' || uploadState.status === 'error') && (
            <button
              onClick={removeFile}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
        isDragActive
          ? 'border-primary bg-primary/5'
          : isDragReject
          ? 'border-error bg-error/5'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">
            {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            or click to browse
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>PDF</span>
          <span>•</span>
          <span>Max {maxSize / 1024 / 1024}MB</span>
        </div>
      </div>
    </div>
  );
}
