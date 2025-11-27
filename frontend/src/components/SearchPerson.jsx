import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './SearchPerson.css'

const API_BASE_URL = '/api'

const SearchPerson = ({ onPersonSelect }) => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true)
      try {
        // First try to load from local data
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
          
          // Format results to match API response structure
          const formattedResults = filtered.map(emp => ({
            person: emp
          }))
          
          setResults(formattedResults)
        } else {
          // Fallback to API if local data not available
          const response = await fetch(`${API_BASE_URL}/people/${encodeURIComponent(searchTerm)}`)
          if (response.ok) {
            const data = await response.json()
            setResults(Array.isArray(data) ? data : [])
          } else {
            setResults([])
          }
        }
      } catch (error) {
        console.error('Error searching people:', error)
        setResults([])
      } finally {
        setLoading(false)
        setShowResults(true)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchTerm])

  const handleSelect = (person) => {
    setSearchTerm('')
    setShowResults(false)
    if (onPersonSelect) {
      onPersonSelect(person)
    }
  }

  return (
    <div className="search-person">
      <div className="search-person-input-wrapper">
        <input
          type="text"
          className="search-person-input"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowResults(true)}
        />
        {loading && <span className="search-person-loading">{t('searching')}</span>}
      </div>
      {showResults && results.length > 0 && (
        <div className="search-person-results">
          {results.map((item) => (
            <div
              key={item.person?.employee_id || Math.random()}
              className="search-person-result-item"
              onClick={() => handleSelect(item.person)}
            >
              <div className="search-person-result-avatar">
                <div className="search-person-avatar-placeholder"></div>
              </div>
              <div className="search-person-result-content">
                <div className="search-person-result-name">
                  {item.person?.employee_name || t('noName')}
                </div>
                <div className="search-person-result-meta">
                  <span className="search-person-result-dept">
                    {[item.person?.dept_1, item.person?.dept_2, item.person?.dept_3]
                      .filter(Boolean)
                      .join(' / ') || t('noDepartment')}
                  </span>
                  {item.person?.job_title && (
                    <>
                      <span className="search-person-result-separator">•</span>
                      <span className="search-person-result-role">
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
  )
}

export default SearchPerson

