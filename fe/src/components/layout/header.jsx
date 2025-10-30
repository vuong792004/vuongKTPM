import { useMemo, useState } from 'react';
import { SearchOutlined, ShoppingOutlined, UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { ConfigProvider, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import './header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [current, setCurrent] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // map key -> route
    const routeMap = useMemo(() => ({
        home: '/',
        support: '/support',
        orders: '/orders',
        profile: '/profile',
        cart: '/cart',
        login: '/login',
        register: '/register',
        admin: '/admin',
    }), []);

    // menu items
    const items = useMemo(() => {
        const commonItems = [
            { key: 'home', label: 'Home' },
            { type: 'divider' },
            { key: 'support', label: 'Support' },
            { key: 'orders', label: 'Orders' },
            {
                key: 'cart',
                icon: <ShoppingOutlined style={{ fontSize: '17px' }} />,
                label: 'Cart',
            },
        ];

        // thêm search khi không ở home
        if (location.pathname !== "/") {
            commonItems.push({
                key: 'search',
                icon: <SearchOutlined style={{ fontSize: '17px' }} />,
                label: 'Search',
            });
        }

        // thêm login / profile / admin cho đủ routeMap
        commonItems.push(
            { key: 'login', label: 'Sign in' },
            // { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
            // { key: 'admin', label: 'Admin', icon: <DashboardOutlined /> },
        );

        return commonItems;
    }, [location.pathname]);

    // xử lý click menu
    const onClick = (e) => {
        setCurrent(e.key);

        if (e.key === 'search') {
            setShowSearch(prev => !prev);
            return;
        }

        const targetRoute = routeMap[e.key];
        if (targetRoute) navigate(targetRoute);
    };

    // enter search
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?keyword=${encodeURIComponent(searchValue)}`);
            setShowSearch(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        itemSelectedColor: 'black',
                        itemHoverColor: 'black',
                        horizontalItemSelectedColor: 'black',
                        horizontalItemBorderColor: 'black',
                    },
                },
            }}
        >
            <div className="header-sticky">
                <div className="header-container">
                    <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <img src="/images/logo.png" alt="logo" className="header-logo" />
                    </div>
                    <Menu
                        onClick={onClick}
                        selectedKeys={current ? [current] : []}
                        mode="horizontal"
                        items={items}
                        className="header-menu"
                    />
                </div>

                {/* search bar */}
                {location.pathname !== "/" && (
                    <div className={`header-search-bar ${showSearch ? "show" : ""}`}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="header-search-input"
                            autoFocus={showSearch}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default Header;
