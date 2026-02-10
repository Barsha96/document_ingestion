import axios from 'axios'
import type { Document, ChatRequest, ChatResponse } from '@/types/document'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function uploadDocument(file: File): Promise<{ document: Document }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function listDocuments(): Promise<{ documents: Document[] }> {
  const response = await api.get('/api/documents')
  return response.data
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/api/documents/${id}`)
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await api.post('/api/chat', request)
  return response.data
}

export default api
