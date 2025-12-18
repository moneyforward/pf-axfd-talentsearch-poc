import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Input } from './ui/input'
import { Search, X, Building2, Briefcase, Sparkles, Filter, ArrowRight } from 'lucide-react'
import FilterModal from './FilterModal'
import './UnifiedSearch.css'

const API_BASE_URL = '/api'

const UnifiedSearch = ({ onEmployeeSelect, onSimilarSearch, onNaturalLanguageResults, selectedEmployee }) => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [employeeResults, setEmployeeResults] = useState([])
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedEmployeeForSearch, setSelectedEmployeeForSearch] = useState(null)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [thinkingLines, setThinkingLines] = useState([])
  const searchRef = useRef(null)

  // Detect if search term is a "Find employees similar to..." pattern
  const isSimilarSearchPattern = (term) => {
    const language = localStorage.getItem('language') || 'ja'
    if (language === 'en') {
      return /find employees similar to/i.test(term) || /similar to/i.test(term)
    } else {
      return /類似|似た/i.test(term)
    }
  }

  // Extract employee from "Find employees similar to [Name] ([ID])" pattern
  const extractEmployeeFromPattern = (term) => {
    const match = term.match(/\(([^)]+)\)/)
    if (match && match[1]) {
      return match[1].trim()
    }
    return null
  }

  // Search for employees as user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setEmployeeResults([])
      setShowDropdown(false)
      setSelectedEmployeeForSearch(null)
      return
    }

    // If it's a similar search pattern, don't show dropdown
    if (isSimilarSearchPattern(searchTerm)) {
      setEmployeeResults([])
      setShowDropdown(false)
      return
    }

    const searchTimeout = setTimeout(async () => {
      setDropdownLoading(true)
      try {
        const employeesResponse = await fetch('/data/employees.json')
        if (employeesResponse.ok) {
          const employees = await employeesResponse.json()
          const searchLower = searchTerm.toLowerCase()
          const filtered = employees.filter(emp => {
            const name = (emp.employee_name || '').toLowerCase()
            const email = (emp.mail || '').toLowerCase()
            const employeeId = (emp.employee_id || '').toLowerCase()
            const jobTitle = (emp.job_title || '').toLowerCase()
            const dept1 = (emp.dept_1 || '').toLowerCase()
            const dept2 = (emp.dept_2 || '').toLowerCase()
            const dept3 = (emp.dept_3 || '').toLowerCase()
            const dept4 = (emp.dept_4 || '').toLowerCase()
            return name.includes(searchLower) || 
                   email.includes(searchLower) || 
                   employeeId.includes(searchLower) ||
                   jobTitle.includes(searchLower) ||
                   dept1.includes(searchLower) ||
                   dept2.includes(searchLower) ||
                   dept3.includes(searchLower) ||
                   dept4.includes(searchLower)
          })
          
          // Limit to 4 results
          const limitedResults = filtered.slice(0, 4).map(emp => ({
            person: emp
          }))
          
          setEmployeeResults(limitedResults)
          setShowDropdown(limitedResults.length > 0)
        }
      } catch (error) {
        console.error('Error searching employees:', error)
        setEmployeeResults([])
      } finally {
        setDropdownLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchTerm])

  // Handle employee selection from dropdown
  const handleEmployeeSelect = (person) => {
    const language = localStorage.getItem('language') || 'ja'
    const isEnglish = language === 'en'
    
    const similarText = isEnglish
      ? `Find employees similar to ${person.employee_name} (${person.employee_id})`
      : `${person.employee_name} (${person.employee_id}) に類似した従業員を検索`
    
    setSearchTerm(similarText)
    setSelectedEmployeeForSearch(person)
    setShowDropdown(false)
    setEmployeeResults([])
    
    // Also trigger employee selection for the instruction panel
    if (onEmployeeSelect) {
      onEmployeeSelect(person)
    }
  }

  // Handle search execution
  const handleSearch = async (userFilters = {}) => {
    if (!searchTerm.trim()) {
      return
    }

    // Reset all previous search state
    setSearchLoading(true)
    setThinkingLines([])
    setShowDropdown(false)
    
    const language = localStorage.getItem('language') || 'ja'
    const isEnglish = language === 'en'

    // Check if it's a similar employee search
    if (isSimilarSearchPattern(searchTerm) || selectedEmployeeForSearch) {
      let employee = selectedEmployeeForSearch
      
      // If no employee selected but pattern detected, try to find it
      if (!employee) {
        const employeeId = extractEmployeeFromPattern(searchTerm)
        if (employeeId) {
          // Try to find employee from recent results or fetch it
          const foundInResults = employeeResults.find(r => r.person?.employee_id === employeeId)?.person
          if (foundInResults) {
            employee = foundInResults
          } else {
            // Try to fetch employee data
            try {
              const employeesResponse = await fetch('/data/employees.json')
              if (employeesResponse.ok) {
                const employees = await employeesResponse.json()
                employee = employees.find(emp => emp.employee_id === employeeId)
              }
            } catch (err) {
              console.error('Error fetching employee:', err)
            }
          }
        }
      }

      if (employee && onSimilarSearch) {
        // Set the employee selection so it shows in the sidebar
        if (onEmployeeSelect) {
          onEmployeeSelect(employee)
        }
        // Trigger similar employee search
        onSimilarSearch(employee, userFilters)
        setSearchLoading(false)
        return
      }
    }
    
    // For natural language search, clear previous employee selection
    if (onEmployeeSelect) {
      onEmployeeSelect(null) // Clear selected person
    }
    setSelectedEmployeeForSearch(null) // Clear previous employee selection

    // Otherwise, treat as natural language search
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
          query: searchTerm.trim(),
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
      
      // Pass thinking lines and results to parent (don't show in component)
      // This will trigger a reset in App.jsx before showing new results
      if (onNaturalLanguageResults) {
        onNaturalLanguageResults(data.results || [], formattedLines)
      }
      
      // Clear local thinking lines since we're showing them in main window
      setThinkingLines([])

    } catch (err) {
      console.error('Error in search:', err)
      setThinkingLines([{
        text: isEnglish 
          ? `❌ Error: ${err.message}` 
          : `❌ エラー: ${err.message}`,
        status: 'error'
      }])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !searchLoading) {
      handleSearch()
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setSelectedEmployeeForSearch(null)
    setShowDropdown(false)
    setEmployeeResults([])
    setThinkingLines([])
    if (onEmployeeSelect) {
      onEmployeeSelect(null)
    }
  }

  const handleFilterProceed = (filters) => {
    handleSearch(filters)
  }

  // Close dropdown when clicking outside (but not when typing in input)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // Only close dropdown if clicking outside, not when input is focused
        const input = searchRef.current?.querySelector('.unified-search-input')
        if (input && document.activeElement !== input) {
          setShowDropdown(false)
        }
      }
    }

    // Only add listener when dropdown is visible
    if (showDropdown) {
      // Use a slight delay to avoid interfering with input focus
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showDropdown])

  return (
    <div className="unified-search" ref={searchRef}>
      <div className="unified-search-container">
        <div className="unified-search-input-wrapper">
          <div className="unified-search-icon-left">
            {isSimilarSearchPattern(searchTerm) || selectedEmployeeForSearch ? (
              <Sparkles size={16} strokeWidth={2} />
            ) : (
              <Search size={16} strokeWidth={2} />
            )}
          </div>
          <Input
            type="text"
            className="unified-search-input"
            placeholder={t('unifiedSearch.placeholder') || 'Search employees by name, ID, or use natural language...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (employeeResults.length > 0) {
                setShowDropdown(true)
              }
            }}
            onKeyPress={handleKeyPress}
            disabled={searchLoading}
          />
          {(selectedEmployee || searchTerm) && (
            <button
              className="unified-search-clear-button"
              onClick={handleClear}
              aria-label="Clear search"
              type="button"
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
          <button
            className="unified-search-filter-button"
            onClick={() => setIsFilterModalOpen(true)}
            aria-label="Additional filters"
            type="button"
            title={t('unifiedSearch.additionalFilters') || 'Additional Filters'}
          >
            <Filter size={16} strokeWidth={2} />
          </button>
          <button
            className="unified-search-submit-button"
            onClick={() => handleSearch()}
            disabled={searchLoading || !searchTerm.trim()}
            type="button"
            aria-label="Search"
          >
            {searchLoading ? (
              <span className="unified-search-loading-text">{t('searching') || 'Searching...'}</span>
            ) : (
              <ArrowRight size={16} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Employee Dropdown */}
        {showDropdown && employeeResults.length > 0 && (
          <div className="unified-search-dropdown">
            {employeeResults.map((item) => (
              <div
                key={item.person?.employee_id || Math.random()}
                className="unified-search-dropdown-item"
                onClick={() => handleEmployeeSelect(item.person)}
              >
                <div className="unified-search-dropdown-avatar">
                  <div className="unified-search-avatar-placeholder"></div>
                </div>
                <div className="unified-search-dropdown-content">
                  <div className="unified-search-dropdown-name-wrapper">
                    <div className="unified-search-dropdown-name">
                      {item.person?.employee_name || t('noName')}
                    </div>
                    {item.person?.employee_id && (
                      <span className="unified-search-dropdown-id-badge">
                        {item.person.employee_id}
                      </span>
                    )}
                  </div>
                  <div className="unified-search-dropdown-meta">
                    <span className="unified-search-dropdown-dept">
                      <Building2 size={12} strokeWidth={2} className="unified-search-meta-icon" />
                      {[item.person?.dept_1, item.person?.dept_2, item.person?.dept_3]
                        .filter(Boolean)
                        .join(' / ') || t('noDepartment')}
                    </span>
                    {item.person?.job_title && (
                      <>
                        <span className="unified-search-dropdown-separator">•</span>
                        <span className="unified-search-dropdown-role">
                          <Briefcase size={12} strokeWidth={2} className="unified-search-meta-icon" />
                          {item.person.job_title}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onProceed={handleFilterProceed}
      />
    </div>
  )
}

export default UnifiedSearch

