import UnifiedSearch from './UnifiedSearch'
import './MainHeader.css'

const MainHeader = ({ breadcrumbs = [], onPersonSelect, selectedPerson, onClear, onNaturalLanguageResults, onSimilarSearch }) => {
  return (
    <div className="main-header">
      <div className="main-header-breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="breadcrumb">
            {crumb}
          </span>
        ))}
      </div>
      <div className="main-header-search">
        <UnifiedSearch
          onEmployeeSelect={onPersonSelect}
          selectedEmployee={selectedPerson}
          onSimilarSearch={onSimilarSearch}
          onNaturalLanguageResults={onNaturalLanguageResults}
        />
      </div>
    </div>
  )
}

export default MainHeader

