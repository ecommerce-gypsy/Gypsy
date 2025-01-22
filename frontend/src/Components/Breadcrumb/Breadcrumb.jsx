import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css"; // Optional: Add custom styles

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="breadcrumb">
      <ul>
        
        <li>
          <Link to="/">Home</Link>
        </li>

        {/* Dynamically generate breadcrumb items */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className={isLast ? "breadcrumb-active" : ""}>
              {isLast ? (
                value.replace(/-/g, " ").toUpperCase()
              ) : (
                <Link to={to}>{value.replace(/-/g, " ")}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
