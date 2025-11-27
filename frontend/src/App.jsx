import { useState, useEffect } from 'react'
import { useLanguage } from './contexts/LanguageContext'
import Login from './Login'
import Sidebar from './components/Sidebar'
import MainHeader from './components/MainHeader'
import Instruction from './components/Instruction'
import PersonCard from './components/PersonCard'
import SimilarEmployeeCard from './components/SimilarEmployeeCard'
import LanguageToggle from './components/LanguageToggle'
import { ShiningText } from './components/ShiningText'
import './App.css'

const API_BASE_URL = '/api'

function App() {
  const { t } = useLanguage()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [matchedPeople, setMatchedPeople] = useState([])
  const [similarSearchStage, setSimilarSearchStage] = useState('idle') // idle, analyzing, filtering, evaluating, complete
  const [thinkingLines, setThinkingLines] = useState([])
  const [topSimilarCandidates, setTopSimilarCandidates] = useState([])
  const [resumeProgress, setResumeProgress] = useState({ current: 0, total: 0 })

  // Debug logging for state changes
  useEffect(() => {
    if (similarSearchStage === 'complete') {
      console.log('🔍 [Similar Search] State check (complete):', {
        stage: similarSearchStage,
        candidates: topSimilarCandidates,
        candidatesLength: topSimilarCandidates?.length || 0,
        isArray: Array.isArray(topSimilarCandidates),
        type: typeof topSimilarCandidates,
        candidatesValue: JSON.stringify(topSimilarCandidates).substring(0, 200)
      })
    }
  }, [similarSearchStage, topSimilarCandidates])

  // Check for saved user session
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const handleSearch = async (person, persona) => {
    console.log('Searching for person:', person, 'with persona:', persona)
    setLoading(true)
    setMatchedPeople([])

    try {
      const response = await fetch(`${API_BASE_URL}/person/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person: person,
          persona: persona,
          instructions: 'Find the person based on the provided details.',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to search for people')
      }

      const data = await response.json()
      if (data && data.result) {
        setMatchedPeople(data.result)
      } else {
        setMatchedPeople([])
      }
    } catch (err) {
      console.error('Error searching for people:', err)
      setMatchedPeople([])
    } finally {
      setLoading(false)
    }
  }

  const handleSimilarSearch = async (targetEmployee, userFilters = {}) => {
    console.log('🔍 [Similar Search] Starting search with:', {
      targetEmployee,
      userFilters,
      hasEmployeeId: !!targetEmployee?.employee_id
    })

    if (!targetEmployee) {
      console.error('❌ [Similar Search] No target employee provided')
      return
    }

    setSimilarSearchStage('analyzing')
    setThinkingLines([])
    setTopSimilarCandidates([])
    setMatchedPeople([])

    const language = localStorage.getItem('language') || 'ja'
    const isEnglish = language === 'en'

    console.log('🔍 [Similar Search] Stage set to: analyzing, Language:', language)

    try {
      // Layer 1: Analysis
      setThinkingLines([{ 
        text: isEnglish 
          ? '🤔 Analyzing target employee profile...' 
          : '🤔 ターゲット従業員のプロファイルを分析中...', 
        status: 'active' 
      }])
      
      // Validate targetEmployee before sending
      if (!targetEmployee || typeof targetEmployee !== 'object') {
        console.error('❌ [Similar Search] Invalid employee data:', targetEmployee)
        throw new Error(isEnglish ? 'Invalid employee data' : '従業員データが無効です')
      }
      
      if (!targetEmployee.employee_id) {
        console.error('❌ [Similar Search] Missing employee_id:', targetEmployee)
        throw new Error(isEnglish ? 'Employee ID is required' : '従業員IDが必要です')
      }

      console.log('📤 [Similar Search] Sending analysis request:', { 
        employee_id: targetEmployee.employee_id,
        employee_name: targetEmployee.employee_name,
        job_title: targetEmployee.job_title,
        dept_3: targetEmployee.dept_3,
        language: language,
        full_target_employee: targetEmployee
      })

      const analysisResponse = await fetch(`${API_BASE_URL}/search/similar-employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_employee: targetEmployee,
          language: language
        })
      })

      console.log('📥 [Similar Search] Analysis response status:', analysisResponse.status, analysisResponse.statusText)

      if (!analysisResponse.ok) {
        let errorMessage = isEnglish ? 'Analysis failed' : '分析に失敗しました'
        try {
          const errorData = await analysisResponse.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
          console.error('❌ [Similar Search] Backend error response:', {
            status: analysisResponse.status,
            statusText: analysisResponse.statusText,
            errorData: errorData,
            errorMessage: errorMessage
          })
        } catch (e) {
          const errorText = await analysisResponse.text()
          console.error('❌ [Similar Search] Error response (not JSON):', {
            status: analysisResponse.status,
            statusText: analysisResponse.statusText,
            errorText: errorText,
            parseError: e.message
          })
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const analysisData = await analysisResponse.json()
      console.log('✅ [Similar Search] Analysis complete:', {
        search_id: analysisData.search_id,
        stage: analysisData.stage,
        thinking_text: analysisData.thinking_text,
        has_analysis_result: !!analysisData.analysis_result,
        hard_filters: analysisData.analysis_result?.hard_filters,
        soft_criteria: analysisData.analysis_result?.soft_criteria
      })
      
      setThinkingLines([
        { 
          text: isEnglish 
            ? `✅ Profile analysis complete: ${analysisData.thinking_text}` 
            : `✅ プロファイル分析完了: ${analysisData.thinking_text}`, 
          status: 'complete' 
        },
        { 
          text: isEnglish 
            ? '🔍 Searching database...' 
            : '🔍 データベースを検索中...', 
          status: 'active' 
        }
      ])

      // Layer 2: Filter
      setSimilarSearchStage('filtering')
      console.log('🔍 [Similar Search] Stage set to: filtering')
      
      const filterRequest = {
        search_id: analysisData.search_id,
        hard_filters: analysisData.analysis_result.hard_filters,
        target_employee_id: targetEmployee.employee_id,
        language: language,
        user_filters: userFilters
      }
      
      console.log('📤 [Similar Search] Sending filter request:', filterRequest)
      
      const filterResponse = await fetch(`${API_BASE_URL}/search/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterRequest)
      })

      console.log('📥 [Similar Search] Filter response status:', filterResponse.status, filterResponse.statusText)

      if (!filterResponse.ok) {
        let errorMessage = isEnglish ? 'Filtering failed' : 'フィルタリングに失敗しました'
        try {
          const errorData = await filterResponse.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
          console.error('❌ [Similar Search] Filter error:', {
            status: filterResponse.status,
            errorData: errorData
          })
        } catch (e) {
          const errorText = await filterResponse.text()
          console.error('❌ [Similar Search] Filter error (not JSON):', {
            status: filterResponse.status,
            errorText: errorText
          })
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const filterData = await filterResponse.json()
      console.log('✅ [Similar Search] Filter complete:', {
        stats: filterData.stats,
        candidate_count: filterData.candidate_ids?.length || 0,
        candidate_ids: filterData.candidate_ids,
        thinking_text: filterData.thinking_text
      })
      
      setThinkingLines([
        { 
          text: isEnglish 
            ? `✅ Profile analysis complete: ${analysisData.thinking_text}` 
            : `✅ プロファイル分析完了: ${analysisData.thinking_text}`, 
          status: 'complete' 
        },
        { text: `✅ ${filterData.thinking_text}`, status: 'complete' },
        { 
          text: isEnglish 
            ? `💭 Analyzing resumes of ${filterData.stats.filtered_count} candidates in detail...` 
            : `💭 ${filterData.stats.filtered_count}人の候補者のレジュメを詳細分析中...`, 
          status: 'active' 
        }
      ])

      // Layer 3: Evaluation with real-time streaming
      setSimilarSearchStage('evaluating')
      console.log('🔍 [Similar Search] Stage set to: evaluating')
      
      // Set up progress tracking
      const totalCandidates = Math.min(filterData.candidate_ids.length, 30)
      console.log('📊 [Similar Search] Starting evaluation for', totalCandidates, 'candidates')
      setResumeProgress({ current: 0, total: totalCandidates })
      
      // Add the progress line that will update
      setThinkingLines([
        { 
          text: isEnglish 
            ? `✅ Profile analysis complete: ${analysisData.thinking_text}` 
            : `✅ プロファイル分析完了: ${analysisData.thinking_text}`, 
          status: 'complete' 
        },
        { text: `✅ ${filterData.thinking_text}`, status: 'complete' },
        { 
          text: isEnglish 
            ? `💭 Analyzing resume (0/${totalCandidates})` 
            : `💭 レジュメ分析中 (0/${totalCandidates})`, 
          status: 'active',
          isProgress: true
        }
      ])
      
      const evaluateRequest = {
        search_id: analysisData.search_id,
        target_employee: targetEmployee,
        candidate_ids: filterData.candidate_ids,
        soft_criteria: analysisData.analysis_result.soft_criteria,
        language: language
      }
      
      console.log('📤 [Similar Search] Sending evaluate request:', {
        search_id: evaluateRequest.search_id,
        candidate_count: evaluateRequest.candidate_ids?.length || 0,
        has_soft_criteria: !!evaluateRequest.soft_criteria
      })
      
      // EventSource doesn't support POST, so we need to use fetch with streaming
      const evaluateResponse = await fetch(`${API_BASE_URL}/search/evaluate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluateRequest)
      })

      console.log('📥 [Similar Search] Evaluate response status:', evaluateResponse.status, evaluateResponse.statusText)

      if (!evaluateResponse.ok) {
        let errorMessage = isEnglish ? 'Evaluation failed' : '評価に失敗しました'
        try {
          const errorData = await evaluateResponse.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
          console.error('❌ [Similar Search] Evaluate error:', {
            status: evaluateResponse.status,
            errorData: errorData
          })
        } catch (e) {
          const errorText = await evaluateResponse.text()
          console.error('❌ [Similar Search] Evaluate error (not JSON):', {
            status: evaluateResponse.status,
            errorText: errorText
          })
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const reader = evaluateResponse.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const rawData = line.slice(6)
              console.log('📨 [Similar Search] Received SSE data:', rawData.substring(0, 200))
              const data = JSON.parse(rawData)
              console.log('📨 [Similar Search] Parsed SSE data:', {
                type: data.type,
                has_top_3: !!data.top_3_candidates,
                top_3_count: data.top_3_candidates?.length || 0
              })
              
              if (data.type === 'progress') {
                // Update progress in real-time
                setResumeProgress({ current: data.current, total: data.total })
                setThinkingLines(prevLines => {
                  return prevLines.map((line, idx) => {
                    if (line.isProgress) {
                      const isEnglish = (localStorage.getItem('language') || 'ja') === 'en'
                      return {
                        ...line,
                        text: isEnglish
                          ? `💭 Analyzing resume (${data.current}/${data.total})`
                          : `💭 レジュメ分析中 (${data.current}/${data.total})`
                      }
                    }
                    return line
                  })
                })
              } else if (data.type === 'complete') {
                // Final results received
                console.log('✅ [Similar Search] Evaluation complete:', {
                  thinking_text: data.thinking_text,
                  top_3_count: data.top_3_candidates?.length || 0,
                  top_3_candidates: data.top_3_candidates,
                  full_data: data
                })
                
                setResumeProgress({ current: data.total, total: data.total })
                
                // Update thinking lines - mark progress as complete and add final message
                setThinkingLines(prevLines => {
                  const updated = prevLines.map(line => {
                    if (line.isProgress) {
                      return {
                        ...line,
                        status: 'complete',
                        isProgress: false
                      }
                    }
                    return line
                  })
                  return [...updated, { 
                    text: `✅ ${data.thinking_text}`, 
                    status: 'complete' 
                  }]
                })
                
                const candidates = data.top_3_candidates || []
                console.log('📊 [Similar Search] Setting candidates:', {
                  count: candidates.length,
                  candidates: candidates
                })
                
                setTopSimilarCandidates(candidates)
                setSimilarSearchStage('complete')
                console.log('✅ [Similar Search] Stage set to: complete')
              }
            } catch (e) {
              console.error('❌ [Similar Search] Error parsing SSE data:', {
                error: e.message,
                line: line.substring(0, 200),
                stack: e.stack
              })
            }
          }
        }
      }

    } catch (err) {
      console.error('❌ [Similar Search] Error caught:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        targetEmployee: targetEmployee,
        currentStage: 'checking...'
      })
      
      const isEnglish = (localStorage.getItem('language') || 'ja') === 'en'
      setThinkingLines([{ 
        text: isEnglish 
          ? `❌ Error: ${err.message}` 
          : `❌ エラー: ${err.message}`, 
        status: 'error' 
      }])
      setSimilarSearchStage('idle')
      setTopSimilarCandidates([])
      console.log('🔄 [Similar Search] Reset to idle state after error')
    }
  }

  // Show login page if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app-container">
      <div className="app-layout">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="app-main">
          <header className="app-header">
            <div className="header-content">
              <h1 className="app-title">{t('appTitle')}</h1>
              <div className="header-language">
                <LanguageToggle />
              </div>
            </div>
          </header>

          <MainHeader breadcrumbs={[t('backfillSearch')]} />

          <div className="app-content">
            <Instruction onSearch={handleSearch} onSimilarSearch={handleSimilarSearch} />
            <div className="app-results">
              {/* Similar Employee Search Results */}
              {similarSearchStage !== 'idle' && (
                <>
                  {thinkingLines.length > 0 && (
                    <div className="thinking-process">
                      {thinkingLines.map((line, index) => {
                        // Show progress line with updating number and shimmer
                        if (line.isProgress && similarSearchStage === 'evaluating') {
                          return (
                            <div key={index} className="thinking-line active">
                              <ShiningText text={line.text} />
                            </div>
                          )
                        }
                        // Show shimmer for active lines
                        if (line.status === 'active') {
                          return (
                            <div key={index} className="thinking-line active">
                              <ShiningText text={line.text} />
                            </div>
                          )
                        }
                        // Regular completed/error lines
                        return (
                          <div key={index} className={`thinking-line ${line.status}`}>
                            {line.text}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {similarSearchStage === 'complete' && (
                    <>
                      {topSimilarCandidates && topSimilarCandidates.length > 0 ? (
                        <div className="results-grid">
                          {topSimilarCandidates.map((result) => {
                            console.log('Rendering candidate:', result)
                            return (
                              <SimilarEmployeeCard
                                key={result.candidate?.employee_id || result.rank}
                                result={result}
                              />
                            )
                          })}
                        </div>
                      ) : (
                        <div className="results-empty">
                          {t('noResults')}
                          <div style={{fontSize: '12px', marginTop: '10px', color: '#666'}}>
                            Debug: stage={similarSearchStage}, candidates={topSimilarCandidates?.length || 0}, 
                            type={typeof topSimilarCandidates}, isArray={Array.isArray(topSimilarCandidates)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              
              {/* Regular Search Results */}
              {similarSearchStage === 'idle' && (
                <>
                  {loading && (
                    <div className="results-loading">{t('searchingResults')}</div>
                  )}
                  {!loading && matchedPeople.length === 0 && (
                    <div className="results-empty">{t('noResults')}</div>
                  )}
                  {!loading && matchedPeople.length > 0 && (
                    <div className="results-grid">
                      {matchedPeople.map((item, index) => (
                        <PersonCard
                          key={item.person?.employee_id || index}
                          person={item.person}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

