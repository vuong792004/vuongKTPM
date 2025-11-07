import Header from './components/layout/header';
import Footer from './components/layout/footer';
import { Outlet } from 'react-router-dom';
import BackToTopButton from './components/layout/BackToTopButton';
import ScrollToTop from './components/layout/ScrollToTop';
import { useContext, useEffect } from 'react';
import { getAccountAPI } from './services/api.service';
import { AuthContext } from './components/context/auth.context';
import { Spin } from 'antd';

const App = () => {
  const { setUser, isAppLoading, setAppLoading } = useContext(AuthContext);

  // giữ thông tin user khi F5
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await getAccountAPI();
      if (res.data) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error("Error fetching account:", err);
    } finally {
      setAppLoading(false);
    }
  };

  return (
    <>
      {isAppLoading ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <div className="app-wrapper">
          <Header />
          <main className="main-content">
            <ScrollToTop />
            <Outlet />
          </main>
          <BackToTopButton />
          <Footer />
        </div>
      )}
    </>
  );
};

export default App;
