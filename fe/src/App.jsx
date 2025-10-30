import Header from './components/layout/header';
import Footer from './components/layout/footer';
import { Outlet } from 'react-router-dom';
import BackToTopButton from './components/layout/BackToTopButton';
import ScrollToTop from './components/layout/ScrollToTop';


const App = () => {

  return (
    <>

      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <ScrollToTop />
          <Outlet />
        </main>
        <BackToTopButton />
        <Footer />
      </div>

    </>
  );
};

export default App;
