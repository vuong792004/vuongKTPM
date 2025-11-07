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

]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <AntdApp>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </AntdApp>
)
