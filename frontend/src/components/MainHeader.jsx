import SearchPerson from './SearchPerson'
import './MainHeader.css'

const MainHeader = ({ breadcrumbs = [], onPersonSelect, selectedPerson, onClear }) => {
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
        <SearchPerson 
          onPersonSelect={onPersonSelect}
          selectedPerson={selectedPerson}
          onClear={onClear}
        />
      </div>
    </div>
  )
}

export default MainHeader

