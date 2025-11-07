import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import 'nprogress/nprogress.css';
import './styles/global.css'
import ErrorPage from './pages/error.jsx';
import RegisterPage from './pages/register.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import { App as AntdApp } from "antd";
import GuestRoute from './pages/guest.route.jsx';
import DetailProductPage from './pages/detailProduct.jsx';
import PrivateRoute from './pages/private.route.jsx';
import CartPage from './pages/cart.jsx';
import CheckoutPage from './pages/checkout.jsx';
import OrdersPage from './pages/order.jsx';
import ProfilePage from './pages/profile.jsx';
import SupportPage from './pages/support.jsx';
import AdminRoute from './admin/routes/AdminRoute.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/product/:id", element: <DetailProductPage /> },
      {
        path: "/cart",
        element: (
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        )
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        )
      },
      {
        path: "/orders",
        element: (
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        )
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        )
      },
      { path: "/support", element: <SupportPage /> },
    ]
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    )
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    )
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <AntdApp>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </AntdApp>
)
