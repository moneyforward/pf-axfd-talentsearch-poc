
interface MainHeaderProps {
  breadcrumbs?: string[];
}

const MainHeader = (props: MainHeaderProps) => (
  <header className="main-header">
    {props.breadcrumbs &&
      props.breadcrumbs.map((crumb, index) => (
        <span key={index} className="breadcrumb-item">
          {crumb}
        </span>
      ))
    }
  </header>
);

export default MainHeader;
