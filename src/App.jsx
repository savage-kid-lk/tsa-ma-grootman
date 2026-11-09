import { Suspense, lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Checkout from './pages/Checkout.jsx';
import CheckoutResult from './pages/CheckoutResult.jsx';
import AuthPage from './pages/account/AuthPage.jsx';
import Account from './pages/account/Account.jsx';
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent.jsx'));

function NotFound() {
  return (
    <div className="container notfound">
      <h1 style={{ fontSize: '2.4rem', textTransform: 'uppercase' }}>Page not found</h1>
      <p className="muted" style={{ margin: '16px 0 28px' }}>That page doesn't exist.</p>
      <Link to="/" className="btn btn-dark">Back home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="checkout/result" element={<RequireAuth><CheckoutResult /></RequireAuth>} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="reset-password" element={<RequireAuth><AuthPage key="reset" mode="reset" /></RequireAuth>} />
        <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<RequireAuth admin><Suspense fallback={<div className="container notfound"><span className="spinner" /></div>}><AdminLayout /></Suspense></RequireAuth>}>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductForm key="edit" />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="content" element={<AdminContent />} />
      </Route>
    </Routes>
  );
}
