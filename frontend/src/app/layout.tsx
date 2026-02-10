import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RAG Comparison System',
  description: 'Compare layout-aware document extraction approaches for RAG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">
                      RAG Comparison System
                    </h1>
                  </div>
                  <div className="flex space-x-4">
                    <a
                      href="/upload"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    >
                      Upload
                    </a>
                    <a
                      href="/chat"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    >
                      Chat
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <main>{children}</main>
          </div>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
