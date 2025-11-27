import { useLanguage } from '../contexts/LanguageContext'
import './SimilarEmployeeCard.css'

const SimilarEmployeeCard = ({ result }) => {
  const { t } = useLanguage()
  
  if (!result) {
    console.error('SimilarEmployeeCard: result is missing')
    return <div>Error: Missing result data</div>
  }
  
  const { candidate, evaluation, rank } = result

  if (!candidate || !evaluation) {
    console.error('SimilarEmployeeCard: missing candidate or evaluation', { candidate, evaluation })
    return <div>Error: Missing candidate or evaluation data</div>
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-high'
    if (score >= 60) return 'score-medium'
    return 'score-low'
  }

  return (
    <div className="similar-employee-card">
      <div className="similar-card-header">
        <span className="rank-badge">#{rank}</span>
        <div className="similar-card-info">
          <h3>{candidate.employee_name || 'Unknown'}</h3>
          <p className="similar-card-meta">
            {candidate.job_title || 'N/A'} | {candidate.dept_3 || 'N/A'} / {candidate.dept_4 || 'N/A'}
          </p>
          <p className="similar-card-email">{candidate.mail || 'N/A'}</p>
        </div>
        <div className="overall-score">
          <span className={`score-value ${getScoreColor(evaluation.scores?.overall || 0)}`}>
            {evaluation.scores?.overall || 0}
          </span>
          <span className="score-label">総合スコア</span>
        </div>
      </div>
      
      <div className="score-breakdown">
        <div className="score-item">
          <span className="score-name">技術スキル</span>
          <div className="score-bar-container">
            <div className="score-bar-wrapper">
              <div 
                className={`score-bar ${getScoreColor(evaluation.scores?.technical_skills || 0)}`}
                style={{ width: `${evaluation.scores?.technical_skills || 0}%` }}
              ></div>
            </div>
            <span className="score-number">{evaluation.scores?.technical_skills || 0}</span>
          </div>
        </div>
        <div className="score-item">
          <span className="score-name">ドメイン専門性</span>
          <div className="score-bar-container">
            <div className="score-bar-wrapper">
              <div 
                className={`score-bar ${getScoreColor(evaluation.scores?.domain_expertise || 0)}`}
                style={{ width: `${evaluation.scores?.domain_expertise || 0}%` }}
              ></div>
            </div>
            <span className="score-number">{evaluation.scores?.domain_expertise || 0}</span>
          </div>
        </div>
        <div className="score-item">
          <span className="score-name">経験レベル</span>
          <div className="score-bar-container">
            <div className="score-bar-wrapper">
              <div 
                className={`score-bar ${getScoreColor(evaluation.scores?.experience_level || 0)}`}
                style={{ width: `${evaluation.scores?.experience_level || 0}%` }}
              ></div>
            </div>
            <span className="score-number">{evaluation.scores?.experience_level || 0}</span>
          </div>
        </div>
        <div className="score-item">
          <span className="score-name">役割適合性</span>
          <div className="score-bar-container">
            <div className="score-bar-wrapper">
              <div 
                className={`score-bar ${getScoreColor(evaluation.scores?.role_alignment || 0)}`}
                style={{ width: `${evaluation.scores?.role_alignment || 0}%` }}
              ></div>
            </div>
            <span className="score-number">{evaluation.scores?.role_alignment || 0}</span>
          </div>
        </div>
        <div className="score-item">
          <span className="score-name">ソフトスキル</span>
          <div className="score-bar-container">
            <div className="score-bar-wrapper">
              <div 
                className={`score-bar ${getScoreColor(evaluation.scores?.soft_skills || 0)}`}
                style={{ width: `${evaluation.scores?.soft_skills || 0}%` }}
              ></div>
            </div>
            <span className="score-number">{evaluation.scores?.soft_skills || 0}</span>
          </div>
        </div>
      </div>
      
      <div className="evaluation-details">
        <div className="strengths">
          <h4>強み</h4>
          <ul>
            {(evaluation.strengths || []).map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div className="gaps">
          <h4>改善点</h4>
          <ul>
            {(evaluation.gaps || []).map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        </div>
        
        <div className="explanation">
          <p>{evaluation.explanation || 'No explanation available'}</p>
        </div>
      </div>
    </div>
  )
}

export default SimilarEmployeeCard

