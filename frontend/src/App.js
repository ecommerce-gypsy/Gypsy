import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './Components/Navbar/Navbar';
import { SalesReport } from './Components/SalesReport/SalesReport';
import { LoginSignup } from './Pages/LoginSignup';
import Cart from './Pages/Cart';
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
import ProductDetail from './Pages/ProductDetail';
import Account from './Pages/Account';
import AnkletBanner from './Components/AnkletBanner/AnkletBanner';
import { Gallery } from './Components/Gallery';
import Header from './Components/Header/Header';
import FAQ from './Components/Faq';
import ReviewSection from './Components/ReviewSection';
import Checkout from './Pages/Checkout';
import AddressForm from './Components/AddressForm/AddressForm';
import AdminUser from './Pages/AdminUser';
import AdminPayment from './Pages/AdminPayment';
import AdminOrder from './Pages/AdminOrder';




const App = () => {
  return (
    <BrowserRouter>
      <Navbar /> {/* Cart count is handled in Navbar via CartContext */}
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/salesreport" element={<SalesReport />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/account" element={<Account />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/listproduct" element={<ListProduct />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/anklets" element={<Anklets />} />
        <Route path="/ankletbanner" element={<AnkletBanner />} />
        <Route path="/AddressForm" element={<AddressForm />} />
        <Route path="/bracelets" element={<Bracelets />} />
        <Route path="/neckpieces" element={<Neckpieces />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/custproduct" element={<CustProduct />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/reviewsection" element={<ReviewSection />} />
        <Route path="/checkout" element={<Checkout />} />
        {/* Admin Routes */}
<Route path="/adminuser" element={<AdminUser />} />

<Route path="/adminpayment" element={<AdminPayment />} />
<Route path="/adminorder" element={<AdminOrder/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
