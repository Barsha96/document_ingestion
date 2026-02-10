'use client'

interface Props {
  value: 'claude' | 'openai'
  onChange: (value: 'claude' | 'openai') => void
}

export function ModelSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        LLM Model
      </label>
      <div className="space-y-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            value="claude"
            checked={value === 'claude'}
            onChange={(e) => onChange(e.target.value as 'claude')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">Claude</span>
            <p className="text-xs text-gray-500">Claude 3.5 Sonnet</p>
          </div>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            value="openai"
            checked={value === 'openai'}
            onChange={(e) => onChange(e.target.value as 'openai')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">OpenAI</span>
            <p className="text-xs text-gray-500">GPT-4o</p>
          </div>
        </label>
      </div>
    </div>
  )
}
