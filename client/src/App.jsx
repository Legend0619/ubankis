import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Treatment from "./pages/Treatment.jsx";
import Product from "./pages/Product.jsx";
import Membership from "./pages/Membership.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Assessment from "./pages/Assessment.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Account from "./pages/Account.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/treatments/:slug" element={<Treatment />} />
          <Route path="/products/:slug" element={<Product />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/checkout/success/:id" element={<RequireAuth><OrderSuccess /></RequireAuth>} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="/account/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="/admin/*" element={<RequireAuth admin><Admin /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
