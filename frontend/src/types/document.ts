export interface Document {
  id: string
  filename: string
  filePath: string
  fileType: string
  fileSize: number
  uploadTimestamp: string
  doclingStatus: string
  azureDiStatus: string
  doclingError?: string
  azureDiError?: string
  _count?: {
    chunks: number
  }
}

export interface ChunkMetadata {
  source_tool: 'docling' | 'azure_di'
  file_name: string
  page_number: number
  chunk_serial: number
  section_title?: string
  layout_info?: any
}

export interface RetrievedChunk {
  id: string
  content: string
  metadata: ChunkMetadata
  similarity: number
}

export interface ChatRequest {
  message: string
  parserType: 'docling' | 'azure_di'
  model: 'claude' | 'openai'
}

export interface ChatResponse {
  answer: string
  retrievedChunks: RetrievedChunk[]
  model: string
  parserType: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  retrievedChunks?: RetrievedChunk[]
}
