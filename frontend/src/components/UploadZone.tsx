'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadDocument } from '@/lib/api'
import { toast } from 'sonner'
import { Upload, FileText } from 'lucide-react'

export function UploadZone() {
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success(`File "${data.document.filename}" uploaded successfully`)
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.response?.data?.error || error.message}`)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate(file)
    })
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive
          ? 'border-primary bg-blue-50'
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }
        ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} disabled={uploadMutation.isPending} />

      <div className="flex flex-col items-center space-y-4">
        {uploadMutation.isPending ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium text-gray-700">Uploading...</p>
          </>
        ) : isDragActive ? (
          <>
            <FileText className="h-12 w-12 text-primary" />
            <p className="text-lg font-medium text-primary">Drop files here</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOCX, DOC, PPTX, PPT (max 50MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
