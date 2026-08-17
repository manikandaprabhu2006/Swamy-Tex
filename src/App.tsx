import { Suspense, lazy } from "react";
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

const Home = lazy(() => import("@/pages/Home"));
const Shop = lazy(() => import("@/pages/Shop"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));
const Profile = lazy(() => import("@/pages/Profile"));
const Addresses = lazy(() => import("@/pages/Addresses"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const PolicyPage = lazy(() => import("@/pages/PolicyPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminProductEdit = lazy(() => import("@/pages/admin/AdminProductEdit"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold" />
        <p className="font-display text-sm uppercase tracking-luxe text-gold">
          SWAMY TEX
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />

              <Navbar />

              <main>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/shop" element={<Shop />} />

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

                    <Route
                      path="/product/:slug"
                      element={<ProductDetail />}
                    />

                    <Route path="/cart" element={<Cart />} />

                    <Route path="/wishlist" element={<Wishlist />} />

                    <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />

                    <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />

                    <Route
                      path="/orders/:id"
                      element={<RequireAuth><OrderDetail /></RequireAuth>}
                    />

                    <Route
                      path="/track-order"
                      element={<TrackOrder />}
                    />

                    <Route
                      path="/profile"
                      element={<Profile />}
                    />

                    <Route
                      path="/profile/addresses"
                      element={<RequireAuth><Addresses /></RequireAuth>}
                    />

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
                      path="/about"
                      element={<About />}
                    />

                    <Route
                      path="/contact"
                      element={<Contact />}
                    />

                    <Route
                      path="/privacy-policy"
                      element={<PolicyPage kind="privacy" />}
                    />

                    <Route
                      path="/terms"
                      element={<PolicyPage kind="terms" />}
                    />

                    <Route
                      path="/shipping-policy"
                      element={<PolicyPage kind="shipping" />}
                    />

                    <Route
                      path="/refund-policy"
                      element={<PolicyPage kind="refund" />}
                    />

                    <Route path="/admin" element={<AdminLayout />}>
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

                    <Route
                      path="*"
                      element={<NotFound />}
                    />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
              <StyleAssistant />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}