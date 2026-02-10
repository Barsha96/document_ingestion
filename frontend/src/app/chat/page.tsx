'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { ParserSelector } from '@/components/ParserSelector'
import { ModelSelector } from '@/components/ModelSelector'
import type { ChatMessage } from '@/types/document'

export default function ChatPage() {
  const [parserType, setParserType] = useState<'docling' | 'azure_di'>('docling')
  const [model, setModel] = useState<'claude' | 'openai'>('claude')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Chat with Documents
        </h2>
        <p className="text-gray-600">
          Ask questions about your uploaded documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Configuration
            </h3>

            <div className="space-y-4">
              <ParserSelector value={parserType} onChange={setParserType} />
              <ModelSelector value={model} onChange={setModel} />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Tip
            </h4>
            <p className="text-sm text-blue-700">
              Switch between parsing approaches to compare which one retrieves better information!
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <ChatInterface
            parserType={parserType}
            model={model}
            messages={messages}
            onMessagesChange={setMessages}
          />
        </div>
      </div>
    </div>
  )
}
