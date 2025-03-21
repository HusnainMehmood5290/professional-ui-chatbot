import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertCircle, WifiOff } from 'lucide-react'
import axios from 'axios'

interface Message {
  id: string
  text: string
  sender: 'ai' | 'human'
  timestamp: Date
  error?: boolean
  errorType?: 'network' | 'server' | 'general'
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getErrorMessage = (errorType: 'network' | 'server' | 'general') => {
    switch (errorType) {
      case 'network':
        return 'Network error: Please check your internet connection.'
      case 'server':
        return 'Server is currently offline. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const currentTime = new Date()

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'human',
      timestamp: currentTime
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        message: input
      })


      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message || 'Thank you for your message. This is a simulated response.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      let errorType: 'network' | 'server' | 'general' = 'general'

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          errorType = 'network'
        } else if (error.response.status >= 500) {
          errorType = 'server'
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getErrorMessage(errorType),
        sender: 'ai',
        timestamp: new Date(),
        error: true,
        errorType
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-indigo-600 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <Bot className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-semibold text-white">SNGPL AI Assistant</h1>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'
                } px-2`}
            >
              <div
                className={`flex items-start space-x-2 ${message.sender === 'ai' ? 'flex-row' : 'flex-row-reverse'
                  } ${message.sender === 'ai' ? 'mr-auto' : 'ml-auto'
                  } max-w-[85%] sm:max-w-[75%] md:max-w-[65%]`}
              >
                <div className={`flex-shrink-0 ${message.sender === 'ai' ? 'mr-2' : 'ml-2'}`}>
                  {message.sender === 'ai' ? (
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Bot className="w-6 h-6 text-indigo-600" />
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-shrink">
                  <div
                    className={`p-4 rounded-2xl shadow-sm break-words ${message.sender === 'ai'
                      ? 'bg-white text-gray-800'
                      : 'bg-indigo-600 text-white'
                      } ${message.error ? 'bg-red-50 border border-red-100' : ''}`}
                  >
                    {message.error && (
                      <div className="flex items-center space-x-2 mb-2 text-red-600">
                        {message.errorType === 'network' ? (
                          <WifiOff className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="font-medium">Error</span>
                      </div>
                    )}
                    <p className="text-sm md:text-base whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                  <span
                    className={`text-xs mt-2 text-gray-500 ${message.sender === 'ai' ? 'text-left' : 'text-right'
                      }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start px-2">
              <div className="flex items-start space-x-2 max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
                <div className="flex-shrink-0 mr-2">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Bot className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-shrink">
                  <div className="p-4 rounded-2xl bg-white shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                  <span className="text-xs mt-2 text-gray-500">
                    {formatTime(new Date())}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t bg-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-6 py-3 rounded-xl bg-indigo-600 text-white flex items-center space-x-2 
                ${isLoading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}
                transition-colors duration-200 flex-shrink-0`}
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App