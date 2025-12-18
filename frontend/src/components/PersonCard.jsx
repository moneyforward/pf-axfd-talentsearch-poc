import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import ReviewModal from './ReviewModal'
import './PersonCard.css'

const API_BASE_URL = '/api'

const PersonCard = ({ person, persona: externalPersona }) => {
  const { t } = useLanguage()
  const [isExistsCV, setIsExistsCV] = useState(false)
  const [isExistsResume, setIsExistsResume] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [persona, setPersona] = useState(externalPersona || null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    if (externalPersona) {
      setPersona(externalPersona)
      return
    }

    if (person) {
      // Check CV and Resume existence
      // TODO: Replace with actual API calls
      // fetch(`${API_BASE_URL}/person/${person.employee_id}/cv/exists`)
      //   .then(res => res.json())
      //   .then(setIsExistsCV)
      
      // First try to load from local data
      setGenerating(true)
      fetch('/data/personas.json')
        .then(res => res.json())
        .then(personas => {
          const persona = personas[person.employee_id]
          if (persona) {
            setPersona(persona)
            setGenerating(false)
          } else {
            // Fallback to API if not in local data
            return fetch(`${API_BASE_URL}/persona`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(person)
            })
              .then(res => res.json())
              .then(data => {
                setPersona(data)
                setGenerating(false)
              })
          }
        })
        .catch(err => {
          console.error('Error loading persona:', err)
          // Try API as fallback
          fetch(`${API_BASE_URL}/persona`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(person)
          })
            .then(res => res.json())
            .then(data => {
              setPersona(data)
              setGenerating(false)
            })
            .catch(apiErr => {
              console.error('Error generating persona:', apiErr)
              setGenerating(false)
            })
        })
    }
  }, [person, externalPersona])

  if (!person) return null

  // Use placeholder image for demo - in production this would come from API
  const faceUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.employee_name || 'User')}&background=FF6B35&color=fff&size=80`
  const deptPath = [
    person.dept_1,
    person.dept_2,
    person.dept_3,
    person.dept_4,
    person.dept_5,
    person.dept_6
  ].filter(Boolean).join(' / ') || t('noDepartment')

  return (
    <div className="person-card">
      <div className="person-card-header">
        <div className="person-card-avatar">
          <img src={faceUrl} alt={person.employee_name || t('noName')} />
        </div>
        <div className="person-card-info">
          <div className="person-card-dept">
            {deptPath} [{person.job_title || t('noJobTitle')}]
          </div>
          <div className="person-card-name">
            {person.employee_name || t('noName')}
            ({person.employee_id || t('noEmployeeId')})
          </div>
        </div>
      </div>

      <div className="person-card-tags">
        <span className="person-tag">{t('resume')}：{isExistsResume ? 'o' : 'x'}</span>
        <span className="person-tag">{t('cv')}：{isExistsCV ? 'o' : 'x'}</span>
        <button 
          className="person-card-review-button"
          onClick={() => setShowReviewModal(true)}
          title={t('viewReviews') || 'View Reviews'}
        >
          {t('reviews') || 'Reviews'}
        </button>
      </div>

      {generating && (
        <div className="person-card-loading">
          {t('generatingSkills')}
        </div>
      )}

      {persona && (
        <>
          {persona.career && persona.career.length > 0 && (
            <div className="person-card-career">
              {persona.career.map((career, idx) => (
                <div key={idx} className="career-item">
                  <div className="career-header">
                    {career.company} | {career.position} | {career.role}
                  </div>
                  <div className="career-description">
                    {career.description || t('noJobDescription')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {persona.skills && persona.skills.length > 0 && (
            <div className="person-card-skills">
              {persona.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag" title={skill.description}>
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {!generating && !persona && (
        <div className="person-card-skills">
          <span className="skill-tag skeleton">{t('generatingSkills')}</span>
        </div>
      )}

      <ReviewModal
        employeeId={person?.employee_id}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </div>
  )
}

export default PersonCard

