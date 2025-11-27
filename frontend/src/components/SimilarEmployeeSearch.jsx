import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './SimilarEmployeeSearch.css'

const API_BASE_URL = '/api'

const SimilarEmployeeSearch = ({ targetEmployee }) => {
  const { t } = useLanguage()
  const [searchStage, setSearchStage] = useState('idle') // idle, analyzing, filtering, evaluating, complete
  const [thinkingSections, setThinkingSections] = useState([])
  const [topCandidates, setTopCandidates] = useState([])
  const [error, setError] = useState(null)

  const startSearch = async () => {
    if (!targetEmployee) {
      setError('従業員が選択されていません')
      return
    }

    setSearchStage('analyzing')
    setThinkingSections([])
    setTopCandidates([])
    setError(null)

    try {
      // Layer 1: Analysis
      const analysisResponse = await fetch(`${API_BASE_URL}/search/similar-employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_employee: targetEmployee })
      })

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({ detail: '分析に失敗しました' }))
        const errorMessage = errorData.detail || errorData.message || '分析に失敗しました'
        throw new Error(errorMessage)
      }

      const analysisData = await analysisResponse.json()
      
      setThinkingSections([{
        id: 'analysis',
        title: '🤔 ターゲット従業員のプロファイルを分析中...',
        content: analysisData.thinking_text,
        expanded: true,
        details: analysisData.analysis_result
      }])

      // Layer 2: Filter
      setSearchStage('filtering')
      
      const filterResponse = await fetch(`${API_BASE_URL}/search/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_id: analysisData.search_id,
          hard_filters: analysisData.analysis_result.hard_filters,
          target_employee_id: targetEmployee.employee_id
        })
      })

      if (!filterResponse.ok) {
        throw new Error('フィルタリングに失敗しました')
      }

      const filterData = await filterResponse.json()
      
      setThinkingSections(prev => [...prev, {
        id: 'filtering',
        title: '🔍 データベース検索完了',
        content: filterData.thinking_text,
        expanded: true,
        stats: filterData.stats,
        sqlQuery: filterData.sql_query
      }])

      // Layer 3: Evaluation
      setSearchStage('evaluating')
      
      const evaluateResponse = await fetch(`${API_BASE_URL}/search/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_id: analysisData.search_id,
          target_employee: targetEmployee,
          candidate_ids: filterData.candidate_ids,
          soft_criteria: analysisData.analysis_result.soft_criteria
        })
      })

      if (!evaluateResponse.ok) {
        throw new Error('評価に失敗しました')
      }

      const evaluateData = await evaluateResponse.json()
      
      setThinkingSections(prev => [...prev, {
        id: 'evaluation',
        title: '💭 詳細分析進行中',
        content: evaluateData.thinking_text,
        expanded: true,
        progressMessages: evaluateData.progress_messages
      }])

      setTopCandidates(evaluateData.top_3_candidates)
      setSearchStage('complete')

      // Add final results section
      setThinkingSections(prev => [...prev, {
        id: 'results',
        title: '✅ 最終結果: 最も類似した3人の従業員',
        content: '以下の3人が最も類似している従業員です。',
        expanded: true
      }])

    } catch (err) {
      setError(err.message || '検索中にエラーが発生しました')
      setSearchStage('idle')
    }
  }

  const toggleSection = (sectionId) => {
    setThinkingSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded }
          : section
      )
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-high'
    if (score >= 60) return 'score-medium'
    return 'score-low'
  }

  return (
    <div className="similar-employee-search">
      <button 
        className="search-button"
        onClick={startSearch}
        disabled={searchStage !== 'idle' && searchStage !== 'complete'}
      >
        {searchStage === 'idle' ? t('search.findSimilar') : searchStage === 'complete' ? t('search.findSimilar') : t('search.searching')}
      </button>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {thinkingSections.length > 0 && (
        <div className="thinking-sections">
          {thinkingSections.map((section) => (
            <div key={section.id} className="thinking-section">
              <div 
                className="thinking-section-header"
                onClick={() => toggleSection(section.id)}
              >
                <span className="section-title">{section.title}</span>
                <span className="section-toggle">
                  {section.expanded ? '▼' : '▶'}
                </span>
              </div>
              
              {section.expanded && (
                <div className="thinking-section-content">
                  <p className="thinking-text">{section.content}</p>
                  
                  {section.details && (
                    <div className="section-details">
                      <h4>抽出された検索条件:</h4>
                      <ul>
                        <li><strong>職種:</strong> {section.details.hard_filters.job_family || '指定なし'}</li>
                        <li><strong>部署:</strong> {section.details.hard_filters.dept_3?.join(', ') || '指定なし'}</li>
                        <li><strong>役職:</strong> {section.details.hard_filters.job_title?.join(', ') || '指定なし'}</li>
                        <li><strong>重要スキル:</strong> {section.details.soft_criteria.key_skills?.join(', ') || 'なし'}</li>
                      </ul>
                    </div>
                  )}
                  
                  {section.stats && (
                    <div className="section-stats">
                      <p>
                        <strong>総従業員数:</strong> {section.stats.total_employees}人<br/>
                        <strong>フィルタ後:</strong> {section.stats.filtered_count}人<br/>
                        <strong>除外率:</strong> {section.stats.elimination_rate}%
                      </p>
                    </div>
                  )}
                  
                  {section.progressMessages && (
                    <div className="progress-messages">
                      {section.progressMessages.map((msg, idx) => (
                        <div key={idx} className="progress-message">{msg}</div>
                      ))}
                    </div>
                  )}
                  
                  {section.sqlQuery && (
                    <details className="sql-details">
                      <summary>SQLクエリを表示</summary>
                      <pre className="sql-query">{section.sqlQuery}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {searchStage === 'complete' && topCandidates.length > 0 && (
        <div className="candidates-results">
          {topCandidates.map((result) => (
            <div key={result.candidate.employee_id} className="candidate-card">
              <div className="candidate-header">
                <span className="rank-badge">#{result.rank}</span>
                <div className="candidate-info">
                  <h3>{result.candidate.employee_name}</h3>
                  <p className="candidate-meta">
                    {result.candidate.job_title} | {result.candidate.dept_3} / {result.candidate.dept_4}
                  </p>
                  <p className="candidate-email">{result.candidate.mail}</p>
                </div>
                <div className="overall-score">
                  <span className={`score-value ${getScoreColor(result.evaluation.scores.overall)}`}>
                    {result.evaluation.scores.overall}
                  </span>
                  <span className="score-label">総合スコア</span>
                </div>
              </div>
              
              <div className="score-breakdown">
                <h4>スコア詳細</h4>
                <div className="score-bars">
                  <div className="score-item">
                    <span className="score-name">技術スキル</span>
                    <div className="score-bar-container">
                      <div 
                        className={`score-bar ${getScoreColor(result.evaluation.scores.technical_skills)}`}
                        style={{ width: `${result.evaluation.scores.technical_skills}%` }}
                      ></div>
                      <span className="score-number">{result.evaluation.scores.technical_skills}</span>
                    </div>
                  </div>
                  <div className="score-item">
                    <span className="score-name">ドメイン専門性</span>
                    <div className="score-bar-container">
                      <div 
                        className={`score-bar ${getScoreColor(result.evaluation.scores.domain_expertise)}`}
                        style={{ width: `${result.evaluation.scores.domain_expertise}%` }}
                      ></div>
                      <span className="score-number">{result.evaluation.scores.domain_expertise}</span>
                    </div>
                  </div>
                  <div className="score-item">
                    <span className="score-name">経験レベル</span>
                    <div className="score-bar-container">
                      <div 
                        className={`score-bar ${getScoreColor(result.evaluation.scores.experience_level)}`}
                        style={{ width: `${result.evaluation.scores.experience_level}%` }}
                      ></div>
                      <span className="score-number">{result.evaluation.scores.experience_level}</span>
                    </div>
                  </div>
                  <div className="score-item">
                    <span className="score-name">役割適合性</span>
                    <div className="score-bar-container">
                      <div 
                        className={`score-bar ${getScoreColor(result.evaluation.scores.role_alignment)}`}
                        style={{ width: `${result.evaluation.scores.role_alignment}%` }}
                      ></div>
                      <span className="score-number">{result.evaluation.scores.role_alignment}</span>
                    </div>
                  </div>
                  <div className="score-item">
                    <span className="score-name">ソフトスキル</span>
                    <div className="score-bar-container">
                      <div 
                        className={`score-bar ${getScoreColor(result.evaluation.scores.soft_skills)}`}
                        style={{ width: `${result.evaluation.scores.soft_skills}%` }}
                      ></div>
                      <span className="score-number">{result.evaluation.scores.soft_skills}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="evaluation-details">
                <div className="strengths">
                  <h4>強み</h4>
                  <ul>
                    {result.evaluation.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="gaps">
                  <h4>改善点</h4>
                  <ul>
                    {result.evaluation.gaps.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="explanation">
                  <p>{result.evaluation.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimilarEmployeeSearch

