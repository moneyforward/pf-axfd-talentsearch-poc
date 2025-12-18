import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './ReviewModal.css'

const API_BASE_URL = '/api'

const ReviewModal = ({ employeeId, isOpen, onClose }) => {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true)
      setError(null)
      fetch(`${API_BASE_URL}/reviews/${employeeId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch reviews')
          }
          return res.json()
        })
        .then(data => {
          setReviews(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching reviews:', err)
          setError(err.message)
          setLoading(false)
        })
    }
  }, [isOpen, employeeId])

  if (!isOpen) return null

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={e => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>{t('reviewData') || 'Review Data'}</h2>
          <button className="review-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="review-modal-body">
          {loading && (
            <div className="review-loading">
              {t('loading') || 'Loading...'}
            </div>
          )}
          
          {error && (
            <div className="review-error">
              {t('errorLoadingReviews') || 'Error loading reviews'}: {error}
            </div>
          )}
          
          {!loading && !error && reviews && (
            <>
              {reviews.monthly && (
                <div className="review-section">
                  <h3>{t('monthlyReview') || 'Monthly Review'}</h3>
                  <div className="review-details">
                    <div className="review-field">
                      <strong>{t('fiscalCycle') || 'Fiscal Cycle'}:</strong> {reviews.monthly.fy_cycle}
                    </div>
                    <div className="review-field">
                      <strong>{t('yearMonth') || 'Year/Month'}:</strong> {reviews.monthly.year_month}
                    </div>
                    <div className="review-field">
                      <strong>{t('monthlyGoal') || 'Monthly Goal'}:</strong> {reviews.monthly.monthly_goal}
                    </div>
                    <div className="review-field">
                      <strong>{t('monthlyReview') || 'Monthly Review'}:</strong>
                      <div className="review-text">{reviews.monthly.monthly_review}</div>
                    </div>
                    <div className="review-field">
                      <strong>{t('organization') || 'Organization'}:</strong> {reviews.monthly.org1} / {reviews.monthly.org2}
                      {reviews.monthly.org3 && ` / ${reviews.monthly.org3}`}
                    </div>
                    <div className="review-field">
                      <strong>{t('jobFamily') || 'Job Family'}:</strong> {reviews.monthly.job_family}
                    </div>
                  </div>
                </div>
              )}
              
              {reviews.half_year && (
                <div className="review-section">
                  <h3>{t('halfYearReview') || 'Half-Year Review'}</h3>
                  <div className="review-details">
                    <div className="review-field">
                      <strong>{t('fiscalCycle') || 'Fiscal Cycle'}:</strong> {reviews.half_year.fy_cycle}
                    </div>
                    <div className="review-field">
                      <strong>{t('uploadYearMonth') || 'Upload Year/Month'}:</strong> {reviews.half_year.upload_year_month}
                    </div>
                    <div className="review-field">
                      <strong>{t('selfAssessmentScore') || 'Self Assessment Score'}:</strong> {reviews.half_year.self_assessment_score || t('notAvailable') || 'N/A'}
                    </div>
                    {reviews.half_year.half_year_self_review_achievement_growth && (
                      <div className="review-field">
                        <strong>{t('achievementGrowth') || 'Achievement & Growth'}:</strong>
                        <div className="review-text">{reviews.half_year.half_year_self_review_achievement_growth}</div>
                      </div>
                    )}
                    {reviews.half_year.short_term_1yr && (
                      <div className="review-field">
                        <strong>{t('shortTerm1yr') || 'Short Term (1yr)'}:</strong>
                        <div className="review-text">{reviews.half_year.short_term_1yr}</div>
                      </div>
                    )}
                    {reviews.half_year.med_term_2_3yr && (
                      <div className="review-field">
                        <strong>{t('medTerm23yr') || 'Medium Term (2-3yr)'}:</strong>
                        <div className="review-text">{reviews.half_year.med_term_2_3yr}</div>
                      </div>
                    )}
                    {reviews.half_year.career_intentions && (
                      <div className="review-field">
                        <strong>{t('careerIntentions') || 'Career Intentions'}:</strong> {reviews.half_year.career_intentions}
                      </div>
                    )}
                    <div className="review-field">
                      <strong>{t('organization') || 'Organization'}:</strong> {reviews.half_year.org1} / {reviews.half_year.org2}
                    </div>
                    <div className="review-field">
                      <strong>{t('jobFamily') || 'Job Family'}:</strong> {reviews.half_year.job_family}
                    </div>
                  </div>
                </div>
              )}
              
              {!reviews.monthly && !reviews.half_year && (
                <div className="review-no-data">
                  {t('noReviewData') || 'No review data available for this employee.'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewModal

