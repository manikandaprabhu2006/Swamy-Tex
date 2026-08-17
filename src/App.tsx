import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/features/theme/ThemeContext";
import { ToastProvider } from "@/features/toast/ToastContext";
import { CartProvider } from "@/features/cart/CartContext";
import { WishlistProvider } from "@/features/wishlist/WishlistContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RequireAuth from "@/components/RequireAuth";
import StyleAssistant from "@/components/StyleAssistant";

// Pages
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import CategoryPage from "@/pages/CategoryPage";
import ProductDetail from "@/pages/ProductDetail";

import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";

import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import TrackOrder from "@/pages/TrackOrder";

import Profile from "@/pages/Profile";
import Addresses from "@/pages/Addresses";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import AuthCallback from "@/pages/AuthCallback";

import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PolicyPage from "@/pages/PolicyPage";

import NotFound from "@/pages/NotFound";

// Admin
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminProductEdit from "@/pages/admin/AdminProductEdit";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCategories from "@/pages/admin/AdminCategories";

/* =========================================================
   Scroll To Top
========================================================= */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

/* =========================================================
   App
========================================================= */

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />

              {/* Global Navbar */}
              <Navbar />

              {/* Main Application */}
              <main className="min-h-screen">
                <Routes>

                  {/* =================================================
                      HOME
                  ================================================= */}

                  <Route path="/" element={<Home />} />

                  {/* =================================================
                      SHOP
                  ================================================= */}

                  <Route path="/shop" element={<Shop />} />

                  {/* =================================================
                      CATEGORIES
                  ================================================= */}

                  <Route
                    path="/men"
                    element={
                      <CategoryPage
                        categorySlug="men"
                        title="Men's Collection"
                      />
                    }
                  />

                  <Route
                    path="/women"
                    element={
                      <CategoryPage
                        categorySlug="women"
                        title="Women's Collection"
                      />
                    }
                  />

                  <Route
                    path="/kids"
                    element={
                      <CategoryPage
                        categorySlug="kids"
                        title="Kids Collection"
                      />
                    }
                  />

                  <Route
                    path="/group-shirts"
                    element={
                      <CategoryPage
                        categorySlug="group-shirts"
                        title="Group Shirts"
                      />
                    }
                  />

                  <Route
                    path="/new-arrivals"
                    element={
                      <CategoryPage
                        flag="new"
                        title="New Arrivals"
                      />
                    }
                  />

                  <Route
                    path="/offers"
                    element={
                      <CategoryPage
                        flag="offer"
                        title="Offers"
                      />
                    }
                  />

                  {/* =================================================
                      PRODUCT
                  ================================================= */}

                  <Route
                    path="/product/:slug"
                    element={<ProductDetail />}
                  />

                  {/* =================================================
                      CART / WISHLIST
                  ================================================= */}

                  <Route
                    path="/cart"
                    element={<Cart />}
                  />

                  <Route
                    path="/wishlist"
                    element={<Wishlist />}
                  />

                  {/* =================================================
                      AUTHENTICATED SHOPPING
                  ================================================= */}

                  <Route
                    path="/checkout"
                    element={
                      <RequireAuth>
                        <Checkout />
                      </RequireAuth>
                    }
                  />

                  <Route
                    path="/orders"
                    element={
                      <RequireAuth>
                        <Orders />
                      </RequireAuth>
                    }
                  />

                  <Route
                    path="/orders/:id"
                    element={
                      <RequireAuth>
                        <OrderDetail />
                      </RequireAuth>
                    }
                  />

                  {/* =================================================
                      ORDER TRACKING
                  ================================================= */}

                  <Route
                    path="/track-order"
                    element={<TrackOrder />}
                  />

                  {/* =================================================
                      PROFILE
                  ================================================= */}

                  <Route
                    path="/profile"
                    element={<Profile />}
                  />

                  <Route
                    path="/profile/addresses"
                    element={
                      <RequireAuth>
                        <Addresses />
                      </RequireAuth>
                    }
                  />

                  {/* =================================================
                      AUTHENTICATION
                  ================================================= */}

                  <Route
                    path="/login"
                    element={<Login />}
                  />

                  <Route
                    path="/signup"
                    element={<Signup />}
                  />

                  <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                  />

                  <Route
                    path="/auth/callback"
                    element={<AuthCallback />}
                  />

                  {/* =================================================
                      INFORMATION PAGES
                  ================================================= */}

                  <Route
                    path="/about"
                    element={<About />}
                  />

                  <Route
                    path="/contact"
                    element={<Contact />}
                  />

                  {/* =================================================
                      POLICIES
                  ================================================= */}

                  <Route
                    path="/privacy-policy"
                    element={
                      <PolicyPage kind="privacy" />
                    }
                  />

                  <Route
                    path="/terms"
                    element={
                      <PolicyPage kind="terms" />
                    }
                  />

                  <Route
                    path="/shipping-policy"
                    element={
                      <PolicyPage kind="shipping" />
                    }
                  />

                  <Route
                    path="/refund-policy"
                    element={
                      <PolicyPage kind="refund" />
                    }
                  />

                  {/* =================================================
                      ADMIN
                  ================================================= */}

                  <Route
                    path="/admin"
                    element={<AdminLayout />}
                  >
                    <Route
                      index
                      element={<AdminDashboard />}
                    />

                    <Route
                      path="products"
                      element={<AdminProducts />}
                    />

                    <Route
                      path="products/new"
                      element={<AdminProductEdit />}
                    />

                    <Route
                      path="products/:id"
                      element={<AdminProductEdit />}
                    />

                    <Route
                      path="orders"
                      element={<AdminOrders />}
                    />

                    <Route
                      path="customers"
                      element={<AdminCustomers />}
                    />

                    <Route
                      path="categories"
                      element={<AdminCategories />}
                    />
                  </Route>

                  {/* =================================================
                      404
                  ================================================= */}

                  <Route
                    path="*"
                    element={<NotFound />}
                  />

                </Routes>
              </main>

              {/* Global Footer */}
              <Footer />

              {/* AI Fashion Assistant */}
              <StyleAssistant />

            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}