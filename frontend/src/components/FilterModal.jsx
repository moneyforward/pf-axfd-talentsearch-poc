import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './FilterModal.css'

const FilterModal = ({ isOpen, onClose, onProceed }) => {
  const { t } = useLanguage()
  const [filters, setFilters] = useState({
    gender: {
      male: false,
      female: false
    },
    experience: {
      lessThan3: false,
      lessThan5: false,
      moreThan5: false
    },
    database: false,
    joinDate: {
      from: '',
      to: '',
      noInput: false
    },
    birthDate: {
      from: '',
      to: '',
      noInput: false
    },
    employmentPeriod: {
      from: '',
      to: '',
      noInput: false
    },
    departureDate: {
      from: '',
      to: '',
      noInput: false
    },
    skills: {
      'SAP_大塚商事': false,
      'MFL_業務統括': false,
      '財務_MFクレジット': false,
      '経理_MFクレジット': false,
      'レシート一般顧客': false,
      '社会保険労務': false,
      'SAP_業務統括': false,
      'MF_人事給与統括': false,
      '経営統括': false,
      '商流分析': false,
      '監査法人': false,
      'MFCL_業務統括': false,
      '財務_人事給与統括': false,
      '公会計/自治体': false,
      '債権': false,
      '預金連携': false,
      'アパレル': false,
      '債務/支払': false,
      '小売/EC': false,
      '債権回収': false,
      '確定申告': false,
      '個品別管理(飲食・小売)': false,
      '個品別管理(大量、EC)': false,
      '経理職員_経理職員': false
    }
  })

  if (!isOpen) return null

  const handleGenderChange = (gender) => {
    setFilters(prev => ({
      ...prev,
      gender: {
        ...prev.gender,
        [gender]: !prev.gender[gender]
      }
    }))
  }

  const handleExperienceChange = (exp) => {
    setFilters(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        [exp]: !prev.experience[exp]
      }
    }))
  }

  const handleDateChange = (dateType, field, value) => {
    setFilters(prev => ({
      ...prev,
      [dateType]: {
        ...prev[dateType],
        [field]: value
      }
    }))
  }

  const handleDateNoInput = (dateType) => {
    setFilters(prev => ({
      ...prev,
      [dateType]: {
        ...prev[dateType],
        noInput: !prev[dateType].noInput,
        from: '',
        to: ''
      }
    }))
  }

  const handleSkillChange = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: !prev.skills[skill]
      }
    }))
  }

  const handleProceed = () => {
    // Pass filters to parent component
    onProceed(filters)
    onClose()
  }

  const handleSkip = () => {
    // Skip filters - pass empty filters
    onProceed({})
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="filter-modal-overlay" onClick={handleClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-modal-header">
          <h2 className="filter-modal-title">{t('filterModal.title')}</h2>
          <button className="filter-modal-close" onClick={handleClose}>{t('filterModal.close')}</button>
        </div>

        {/* Main Content - Scrollable */}
        <div className="filter-modal-content">
          <div className="filter-modal-main">
            {/* Gender */}
            <div className="filter-row">
              <div className="filter-label">{t('filterModal.gender.title')}</div>
              <div className="filter-options">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.gender.male}
                    onChange={() => handleGenderChange('male')}
                  />
                  <span>{t('filterModal.gender.male')}</span>
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.gender.female}
                    onChange={() => handleGenderChange('female')}
                  />
                  <span>{t('filterModal.gender.female')}</span>
                </label>
              </div>
            </div>

            {/* Experience */}
            <div className="filter-row">
              <div className="filter-label">{t('filterModal.experience.title')}</div>
              <div className="filter-options">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.experience.lessThan3}
                    onChange={() => handleExperienceChange('lessThan3')}
                  />
                  <span>{t('filterModal.experience.lessThan3')}</span>
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.experience.lessThan5}
                    onChange={() => handleExperienceChange('lessThan5')}
                  />
                  <span>{t('filterModal.experience.lessThan5')}</span>
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.experience.moreThan5}
                    onChange={() => handleExperienceChange('moreThan5')}
                  />
                  <span>{t('filterModal.experience.moreThan5')}</span>
                </label>
              </div>
            </div>

            {/* Database */}
            <div className="filter-row">
              <div className="filter-label">{t('filterModal.database')}</div>
              <div className="filter-options">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.database}
                    onChange={() => setFilters(prev => ({ ...prev, database: !prev.database }))}
                  />
                  <span>{t('filterModal.database')}</span>
                </label>
              </div>
            </div>

            {/* Join Date */}
            <div className="filter-row">
              <div className="filter-label">{t('filterModal.dates.joinDate')}</div>
              <div className="filter-options">
                <div className="filter-date-group-horizontal">
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.from')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.joinDate.from}
                      onChange={(e) => handleDateChange('joinDate', 'from', e.target.value)}
                      disabled={filters.joinDate.noInput}
                    />
                  </div>
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.to')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.joinDate.to}
                      onChange={(e) => handleDateChange('joinDate', 'to', e.target.value)}
                      disabled={filters.joinDate.noInput}
                    />
                  </div>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.joinDate.noInput}
                      onChange={() => handleDateNoInput('joinDate')}
                    />
                    <span>{t('filterModal.dates.noInput')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Birth Date */}
            <div className="filter-row">
              <div className="filter-label">{t('filterModal.dates.birthDate')}</div>
              <div className="filter-options">
                <div className="filter-date-group-horizontal">
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.from')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.birthDate.from}
                      onChange={(e) => handleDateChange('birthDate', 'from', e.target.value)}
                      disabled={filters.birthDate.noInput}
                    />
                  </div>
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.to')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.birthDate.to}
                      onChange={(e) => handleDateChange('birthDate', 'to', e.target.value)}
                      disabled={filters.birthDate.noInput}
                    />
                  </div>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.birthDate.noInput}
                      onChange={() => handleDateNoInput('birthDate')}
                    />
                    <span>{t('filterModal.dates.noInput')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Employment Period */}
            <div className="filter-row">
              <div className="filter-label">{t('filterModal.dates.employmentPeriod')}</div>
              <div className="filter-options">
                <div className="filter-date-group-horizontal">
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.from')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.employmentPeriod.from}
                      onChange={(e) => handleDateChange('employmentPeriod', 'from', e.target.value)}
                      disabled={filters.employmentPeriod.noInput}
                    />
                  </div>
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.to')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.employmentPeriod.to}
                      onChange={(e) => handleDateChange('employmentPeriod', 'to', e.target.value)}
                      disabled={filters.employmentPeriod.noInput}
                    />
                  </div>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.employmentPeriod.noInput}
                      onChange={() => handleDateNoInput('employmentPeriod')}
                    />
                    <span>{t('filterModal.dates.noInput')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Departure Date */}
            <div className="filter-row">
              <div className="filter-label">{t('filterModal.dates.departureDate')}</div>
              <div className="filter-options">
                <div className="filter-date-group-horizontal">
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.from')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.departureDate.from}
                      onChange={(e) => handleDateChange('departureDate', 'from', e.target.value)}
                      disabled={filters.departureDate.noInput}
                    />
                  </div>
                  <div className="filter-date-item">
                    <label className="filter-date-label-small">{t('filterModal.dates.to')}</label>
                    <input
                      type="date"
                      className="filter-date-input-small"
                      value={filters.departureDate.to}
                      onChange={(e) => handleDateChange('departureDate', 'to', e.target.value)}
                      disabled={filters.departureDate.noInput}
                    />
                  </div>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.departureDate.noInput}
                      onChange={() => handleDateNoInput('departureDate')}
                    />
                    <span>{t('filterModal.dates.noInput')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section - Full Width */}
          <div className="filter-skills-section">
            <h3 className="filter-section-title">{t('filterModal.skills.title')}</h3>
            <div className="filter-skills-grid">
              {Object.keys(filters.skills).map((skill) => (
                <label key={skill} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.skills[skill]}
                    onChange={() => handleSkillChange(skill)}
                  />
                  <span>{t(`filterModal.skills.${skill}`)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-modal-footer">
          <button className="filter-button filter-button-skip" onClick={handleSkip}>
            {t('filterModal.footer.skip')}
          </button>
          <div className="filter-modal-actions">
            <button className="filter-button filter-button-apply" onClick={handleProceed}>
              {t('filterModal.footer.apply')}
            </button>
            <button className="filter-button filter-button-cancel" onClick={handleClose}>
              {t('filterModal.footer.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterModal

