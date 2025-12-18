import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Input } from './ui/input'
import { Search, Sparkles } from 'lucide-react'
import './NaturalLanguageSearch.css'

const API_BASE_URL = '/api'

const NaturalLanguageSearch = ({ onSearch, onResults }) => {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinkingLines, setThinkingLines] = useState([])

  const handleSearch = async () => {
    if (!query.trim()) {
      return
    }

    setLoading(true)
    setThinkingLines([])
    
    const language = localStorage.getItem('language') || 'ja'
    const isEnglish = language === 'en'

    // Initial thinking line
    setThinkingLines([{
      text: isEnglish 
        ? '🤔 Analyzing your search query...' 
        : '🤔 検索クエリを分析中...',
      status: 'active'
    }])

    try {
      const response = await fetch(`${API_BASE_URL}/search/natural-language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(),
          language: language
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: '検索に失敗しました' }))
        throw new Error(errorData.detail || errorData.message || '検索に失敗しました')
      }

      const data = await response.json()
      
      // Parse thinking text into lines
      const lines = data.thinking_text.split('\n').filter(line => line.trim())
      const formattedLines = lines.map((line, idx) => ({
        text: line.trim(),
        status: idx === lines.length - 1 ? 'complete' : 'complete'
      }))
      
      setThinkingLines(formattedLines)

      // Pass results to parent
      if (onResults) {
        onResults(data.results || [])
      }
      
      if (onSearch) {
        onSearch(data)
      }

    } catch (err) {
      console.error('Error in natural language search:', err)
      setThinkingLines([{
        text: isEnglish 
          ? `❌ Error: ${err.message}` 
          : `❌ エラー: ${err.message}`,
        status: 'error'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch()
    }
  }

  return (
    <div className="natural-language-search">
      <div className="natural-language-search-input-wrapper">
        <div className="natural-language-search-icon-left">
          <Sparkles size={16} strokeWidth={2} />
        </div>
        <Input
          type="text"
          className="natural-language-search-input"
          placeholder={t('naturalSearch.placeholder') || 'Search with natural language (e.g., "find employees with less than 2 years in AI department")'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          className="natural-language-search-button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          type="button"
        >
          {loading ? (
            <span>{t('searching') || 'Searching...'}</span>
          ) : (
            <Search size={16} strokeWidth={2} />
          )}
        </button>
      </div>
      
      {thinkingLines.length > 0 && (
        <div className="natural-language-search-thinking">
          {thinkingLines.map((line, index) => (
            <div key={index} className={`natural-language-thinking-line ${line.status}`}>
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NaturalLanguageSearch

