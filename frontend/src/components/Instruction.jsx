import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import PersonCard from './PersonCard'
import FilterModal from './FilterModal'
import './Instruction.css'

const API_BASE_URL = '/api'

const Instruction = ({ selectedPerson, onSearch, onSimilarSearch }) => {
  const { t } = useLanguage()
  const [persona, setPersona] = useState(null)
  const [generatingPersona, setGeneratingPersona] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  useEffect(() => {
    if (selectedPerson) {
      // Generate persona when person is selected
      setGeneratingPersona(true)
      // First try to load from local data
      fetch('/data/personas.json')
        .then(res => res.json())
        .then(personas => {
          const persona = personas[selectedPerson.employee_id]
          if (persona) {
            setPersona(persona)
            setGeneratingPersona(false)
          } else {
            // Fallback to API if not in local data
            return fetch(`${API_BASE_URL}/persona`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(selectedPerson)
            })
              .then(res => res.json())
              .then(data => {
                setPersona(data)
                setGeneratingPersona(false)
              })
          }
        })
        .catch(err => {
          console.error('Error loading persona:', err)
          // Try API as fallback
          fetch(`${API_BASE_URL}/persona`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedPerson)
          })
            .then(res => res.json())
            .then(data => {
              setPersona(data)
              setGeneratingPersona(false)
            })
            .catch(apiErr => {
              console.error('Error generating persona:', apiErr)
              setPersona({
                name: '',
                skills: [],
                career: []
              })
              setGeneratingPersona(false)
            })
        })
    } else {
      setPersona(null)
    }
  }, [selectedPerson])

  const handleSearch = () => {
    if (selectedPerson && onSearch) {
      onSearch(selectedPerson, persona || {
        name: '',
        skills: [],
        career: []
      })
    }
  }

  const handleSimilarSearchClick = () => {
    if (selectedPerson) {
      setIsFilterModalOpen(true)
    }
  }

  const handleFilterProceed = (filters) => {
    // Pass filters to the search function
    if (selectedPerson && onSimilarSearch) {
      onSimilarSearch(selectedPerson, filters)
    }
  }

  const handleFilterClose = () => {
    setIsFilterModalOpen(false)
  }

  return (
    <div className="instruction-panel">
      {selectedPerson ? (
        <div className="instruction-content">
          <div className="instruction-persona">
            <PersonCard person={selectedPerson} persona={persona} />
          </div>
          {!generatingPersona && selectedPerson && (
            <div className="similar-search-section">
              <button 
                className="similar-search-button"
                onClick={handleSimilarSearchClick}
              >
                {t('search.findSimilar')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="instruction-empty">
          <p className="instruction-empty-text">
            {t('search.selectPerson') || 'Select a person from the search bar above to view their details'}
          </p>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleFilterClose}
        onProceed={handleFilterProceed}
      />
    </div>
  )
}

export default Instruction

