'use client'

import { UploadZone } from '@/components/UploadZone'
import { DocumentList } from '@/components/DocumentList'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listDocuments, deleteDocument } from '@/lib/api'
import { toast } from 'sonner'

export default function UploadPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: listDocuments,
    refetchInterval: 3000, // Poll every 3 seconds for status updates
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`)
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Documents
        </h2>
        <p className="text-gray-600">
          Upload PDF, DOCX, or PPTX files to be processed with both Docling and Azure Document Intelligence
        </p>
      </div>

      <div className="space-y-8">
        <UploadZone />

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Uploaded Documents
          </h3>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading documents: {error.message}
            </div>
          ) : (
            <DocumentList
              documents={data?.documents || []}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
