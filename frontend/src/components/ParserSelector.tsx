'use client'

interface Props {
  value: 'docling' | 'azure_di'
  onChange: (value: 'docling' | 'azure_di') => void
}

export function ParserSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Parsing Approach
      </label>
      <div className="space-y-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            value="docling"
            checked={value === 'docling'}
            onChange={(e) => onChange(e.target.value as 'docling')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">Docling</span>
            <p className="text-xs text-gray-500">IBM Research layout-aware parsing</p>
          </div>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            value="azure_di"
            checked={value === 'azure_di'}
            onChange={(e) => onChange(e.target.value as 'azure_di')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">Azure DI</span>
            <p className="text-xs text-gray-500">Azure Document Intelligence</p>
          </div>
        </label>
      </div>
    </div>
  )
}
