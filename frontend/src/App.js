import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './Components/Navbar/Navbar';
import ReviewSummary from './Components/ReviewSummary/ReviewSummary';
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
import AddressForm from './Components/AddressForm/AddressForm';
import AdminUser from './Pages/AdminUser';
import AdminPayment from './Pages/AdminPayment';
import AdminOrder from './Pages/AdminOrder';
import AuthCard from './Pages/AuthCard';
import Chatbot from './Components/Chatbot/Chatbot';
import Settings from './Pages/Settings';
import MarqueeBanner from './Components/MarqueeBanner/MarqueeBanner';
import ResetPassword from './Pages/ResetPassword';
import ResetPasswordForm from './Pages/ResetPasswordForm';
import OrderProcess from './Components/ordersummary/OrderSummary';
import PaymentComponent from './Pages/PaymentComponent';
import CheckoutModal from './Pages/CheckoutModal';
import NeckPieceBanner from './Components/NeckPieceBanner/NeckPieceBanner';
import ReviewList from './Pages/ReviewList';
import Dashboard from './Pages/Dashboard';
import CustomDesignPage from './Pages/CustomDesignPage';
import AddCustomDesign from './Pages/AddCustomDesign';
import AdminOutOfStock from './Pages/AdminOutofStock';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderConfirmation from './Pages/OrderConfirmation';
//import AdminPanel from './Pages/AdminPanel';
import Payment from './Pages/AdminPayment';
import CategoryPage from "./Pages/CategoryPage"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AdminCategory from './Pages/AdminCategory';
import Earrings from './Pages/Earrings';
import ReturnForm from './Pages/ReturnForm';
import MyReturns from './Pages/MyReturns';
import AdminReturns from './Pages/AdminReturns';

// Helper component to manage layout
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Hide Navbar, Header, and Chatbot on /login and /admin pages
  const hideLayout = location.pathname === '/login' || location.pathname === '/admin'|| location.pathname === '/dashboard'|| location.pathname === '/addproduct'|| location.pathname === '/listproduct'|| location.pathname === '/adminuser'|| location.pathname === '/adminorder'|| location.pathname === '/reviewlist'|| location.pathname === '/adminpanel'|| location.pathname === '/adminoutofstock'|| location.pathname === '/adminpayment'|| location.pathname === '/adminreturns'|| location.pathname === '/addcustomdesign';

  return (
    <>
      {!hideLayout && <Navbar />}
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Chatbot />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
      <ToastContainer/>
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
          <Route path="/earrings" element={<Earrings />} />
          <Route path="/ankletbanner" element={<AnkletBanner />} />
          <Route path="/AddressForm" element={<AddressForm />} />
          <Route path="/bracelets" element={<Bracelets />} />
          <Route path="/review" element={<ReviewSummary />} />
          <Route path="/neckpieces" element={<Neckpieces />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/custproduct" element={<CustProduct />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/reviewsection" element={<ReviewSection />} />
          <Route path="/adminuser" element={<AdminUser />} />
          <Route path="/adminpayment" element={<AdminPayment />} />
          <Route path="/adminorder" element={<AdminOrder />} />
          <Route path="/authcard" element={<AuthCard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-form" element={<ResetPasswordForm />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/marqueebanner" element={<MarqueeBanner />} />
          <Route path="/checkoutmodal" element={<CheckoutModal />} />
          <Route path="/neckpiecebanner" element={<NeckPieceBanner />} />
          <Route path="/reviewlist" element={<ReviewList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customdesignpage" element={<CustomDesignPage />} />
          <Route path="/AddCustomDesign" element={<AddCustomDesign/>}/>
      <Route path="/adminoutofstock" element={<AdminOutOfStock/>}/>
      <Route path="/order/:orderId" element={<OrderConfirmation />} />
      <Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
      <Route path="/adminpayment" element={<Payment/>} />
      <Route path="/category/:categoryId" element={<CategoryPage />} /> 
      <Route path="/admincategory" element={<AdminCategory />} />



      
      <Route path="/returnform" element={<ReturnForm/>} />
          <Route path="/myreturns" element={<MyReturns/>} />
          {/* Admin view */}
          <Route path="/adminreturns" element={<AdminReturns />} />

        {/* <Route path="/return-request" element={<ReturnForm/>} />
          <Route path="/my-returns" element={<MyReturns/>} />
       
          <Route path="/admin/returns" element={<AdminReturns />} />  */}
      </Routes>
       
      </Layout>
    </BrowserRouter>
  );
};

export default App;
