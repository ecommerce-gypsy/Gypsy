import React from 'react'
import'./Sidebar.css'
import{Link} from 'react-router-dom'
import cart from '../assets/cart.png'; // Path to your cart icon
import List from '../assets/list.png'; // Path to your cart icon

const Sidebar = () => {
  return (
    <div className="sidebar">
        <Link to={'/addproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
            <img src={cart} alt="Cart" className="nav-cart-icon" />
            <p>ADD PRODUCT</p>
        </div>
        </Link>
        <Link to={'/listproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
            <img src={List} alt="Cart" className="nav-List-icon" />
            <p>PRODUCT LIST</p>
        </div>
        </Link>

    </div>
  )
}

export default Sidebar