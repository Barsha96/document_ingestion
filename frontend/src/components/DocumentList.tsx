'use client'

import { Document } from '@/types/document'
import { FileText, Trash2, CheckCircle2, Loader2, XCircle } from 'lucide-react'

interface Props {
  documents: Document[]
  onDelete: (id: string) => void
}

export function DocumentList({ documents, onDelete }: Props) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No documents uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      {documents.map((doc) => (
        <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <FileText className="h-6 w-6 text-gray-400 mt-1" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {doc.filename}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {(doc.fileSize / 1024 / 1024).toFixed(2)} MB •{' '}
                  {doc._count?.chunks || 0} chunks •{' '}
                  {new Date(doc.uploadTimestamp).toLocaleString()}
                </p>

                <div className="mt-3 flex space-x-6">
                  <StatusBadge
                    label="Docling"
                    status={doc.doclingStatus}
                    error={doc.doclingError}
                  />
                  <StatusBadge
                    label="Azure DI"
                    status={doc.azureDiStatus}
                    error={doc.azureDiError}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => onDelete(doc.id)}
              className="ml-4 p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              title="Delete document"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({
  label,
  status,
  error,
}: {
  label: string
  status: string
  error?: string
}) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          text: 'Completed',
          className: 'bg-green-100 text-green-800',
        }
      case 'processing':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Processing',
          className: 'bg-blue-100 text-blue-800',
        }
      case 'failed':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Failed',
          className: 'bg-red-100 text-red-800',
        }
      default:
        return {
          icon: <Loader2 className="h-4 w-4" />,
          text: 'Pending',
          className: 'bg-gray-100 text-gray-800',
        }
    }
  }

  const display = getStatusDisplay()

  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-600 mb-1">{label}</span>
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${display.className}`}
        title={error}
      >
        {display.icon}
        <span>{display.text}</span>
      </div>
      {error && (
        <span className="text-xs text-red-600 mt-1" title={error}>
          Error: {error.substring(0, 50)}...
        </span>
      )}
    </div>
  )
}
