import './MainHeader.css'

const MainHeader = ({ breadcrumbs = [] }) => {
  return (
    <div className="main-header">
      {breadcrumbs.map((crumb, index) => (
        <span key={index} className="breadcrumb">
          {crumb}
        </span>
      ))}
    </div>
  )
}

export default MainHeader

