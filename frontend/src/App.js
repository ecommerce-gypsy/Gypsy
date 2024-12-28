import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './Components/Navbar/Navbar';
import { LoginSignup } from './Pages/LoginSignup';
import Cart from './Pages/Cart';
import { Product } from './Pages/Product';


import Wishlist from './Pages/Wishlist';



import CustProduct from './Pages/custproduct';
import { Home } from './Pages/Home';
import Anklets from './Pages/Anklets';
import Neckpieces from './Pages/Neckpieces';
import Bracelets from './Pages/Bracelets';
import Admin from './Pages/Admin';
import AddProduct from './Components/AddProduct/AddProduct';
import ListProduct from './Components/ListProduct/ListProduct';
import Sidebar from './Components/Sidebar/Sidebar';



const App = () => {
  return (
    <BrowserRouter>
      <Navbar /> {/* Cart count is handled in Navbar via CartContext */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/product/:productId" element={<Product />} />
    <Route path="/admin" element={<Admin/>}/>
    <Route path="/addproduct" element={<AddProduct/>}/>
    <Route path="/listproduct" element={<ListProduct/>}/>
    <Route path="/sidebar" element={<Sidebar/>}/>
       

        <Route path="/anklets" element={<Anklets />} />
      <Route path="/bracelets" element={<Bracelets/>}/>
      <Route path="/neckpieces" element={<Neckpieces/>}/>
        <Route path="/custproduct" element={<CustProduct/>}/> 
        
      </Routes>
    </BrowserRouter>
  );
};


export default App;
