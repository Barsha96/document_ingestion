'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendChatMessage } from '@/lib/api'
import { Send, Bot, User, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { ChatMessage, RetrievedChunk } from '@/types/document'

interface Props {
  parserType: 'docling' | 'azure_di'
  model: 'claude' | 'openai'
  messages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
}

export function ChatInterface({ parserType, model, messages, onMessagesChange }: Props) {
  const [input, setInput] = useState('')
  const [expandedChunks, setExpandedChunks] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        retrievedChunks: data.retrievedChunks,
      }
      onMessagesChange([...messages, assistantMessage])
    },
    onError: (error: any) => {
      toast.error(`Chat error: ${error.response?.data?.error || error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || chatMutation.isPending) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    }

    onMessagesChange([...messages, userMessage])
    setInput('')

    chatMutation.mutate({
      message: input,
      parserType,
      model,
    })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[calc(100vh-16rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Start a conversation by typing a question below
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure you've uploaded documents first!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index}>
              <MessageBubble message={message} />
              {message.retrievedChunks && message.retrievedChunks.length > 0 && (
                <ChunkViewer
                  chunks={message.retrievedChunks}
                  expanded={expandedChunks === `msg-${index}`}
                  onToggle={() =>
                    setExpandedChunks(
                      expandedChunks === `msg-${index}` ? null : `msg-${index}`
                    )
                  }
                />
              )}
            </div>
          ))
        )}

        {chatMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={chatMutation.isPending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-300' : 'bg-primary'}`}>
          {isUser ? (
            <User className="h-5 w-5 text-gray-700" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`rounded-lg p-3 max-w-3xl ${
            isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  )
}

function ChunkViewer({
  chunks,
  expanded,
  onToggle,
}: {
  chunks: RetrievedChunk[]
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="ml-11 mt-2">
      <button
        onClick={onToggle}
        className="text-sm text-primary hover:underline flex items-center space-x-1"
      >
        <FileText className="h-4 w-4" />
        <span>
          {expanded ? 'Hide' : 'Show'} source chunks ({chunks.length})
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {chunks.map((chunk, idx) => (
            <div
              key={chunk.id}
              className="bg-gray-50 border border-gray-200 rounded p-3 text-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">
                  Chunk {idx + 1} • Page {chunk.metadata.page_number}
                </span>
                <span className="text-xs text-gray-500">
                  {chunk.metadata.file_name} • Similarity: {(chunk.similarity * 100).toFixed(1)}%
                </span>
              </div>
              {chunk.metadata.section_title && (
                <div className="text-xs text-gray-600 mb-1">
                  Section: {chunk.metadata.section_title}
                </div>
              )}
              <p className="text-gray-800 line-clamp-3">{chunk.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
