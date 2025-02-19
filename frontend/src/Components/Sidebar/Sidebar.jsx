import React from 'react'
import'./Sidebar.css'
import{Link} from 'react-router-dom'
import cart from '../Assets/Cartt.png'; // Path to your cart icon
import List from '../Assets/Listt.png'; // Path to your cart icon
import admin from '../Assets/Admin.png';
import sales from '../Assets/Sales.png';
import Order from '../Assets/order.png';
import  dashboard from  '../Assets/data.png';
const Sidebar = () => {
  return (
    <div className="sidebar">
          
            <Link to={'/dashboard'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
            <img src={dashboard} alt="Dashboard" className="nav-dashboard-icon" />
            <p>DASHBOARD</p>
        </div>
        </Link>


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

        <Link to={'/admin'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
            <img src={sales} alt="Sales" className="nav-Admin-icon" />
            <p>ADMIN </p>
        </div>
        </Link>


        <Link to={'/adminuser'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
        <img src={admin} alt="Admin" className="nav-Admin-icon" />
            <p>ADMIN USER </p>
        </div>
        </Link>


        <Link to={'/adminorder'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
             <img src={Order} alt="order" className="nav-order-icon" />
            <p>ADMIN ORDER </p>
        </div>
        </Link>
      
    </div>
  )
}

export default Sidebar