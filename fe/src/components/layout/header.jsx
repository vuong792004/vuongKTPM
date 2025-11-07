import { useContext, useEffect, useMemo, useState } from 'react';
import { SearchOutlined, ShoppingOutlined, UserOutlined, ExclamationCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import { Badge, ConfigProvider, Menu, message, Modal } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import './header.css';
import { AuthContext } from '../context/auth.context';
import { getCartCount } from '../../services/api.service';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [current, setCurrent] = useState('');
    const { user, setUser, cartCount, setCartCount } = useContext(AuthContext);

    // search state
    const [showSearch, setShowSearch] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!user) {
                setCartCount(0);
                return;
            }
            try {
                const res = await getCartCount();
                if (res.data.success) {
                    setCartCount(res.data.cartCount);
                }
            } catch (err) {
                console.error("Failed to fetch cart count:", err);
            }
        };
        fetchCartCount();
    }, [user, location.pathname]);

    const routeMap = useMemo(() => ({
        support: '/support',
        orders: '/orders',
        profile: '/profile',
        cart: '/cart',
        login: '/login',
        register: '/register',
        home: '/',
        admin: '/admin'
    }), []);

    const items = useMemo(() => {
        const commonItems = [
            { key: 'home', label: 'Home' },
            { type: 'divider' },
            { key: 'support', label: 'Support' },
            { key: 'orders', label: 'Orders' },
            {
                key: 'cart',
                icon: user ? (
                    <Badge
                        count={cartCount}
                        showZero
                        size="small"
                        offset={[4, -2]}
                        overflowCount={99}
                        style={{
                            fontSize: "11px",
                            minWidth: "15px",
                            height: "16px",
                            lineHeight: "16px",
                        }}
                    >
                        <ShoppingOutlined style={{ fontSize: '18px' }} />
                    </Badge>
                ) : (
                    <ShoppingOutlined style={{ fontSize: '18px' }} />
                ),
                label: 'Cart',
            }


        ];

        // Ở homepage thì KHÔNG thêm nút search
        if (location.pathname !== "/") {
            commonItems.push({
                key: 'search',
                icon: <SearchOutlined style={{ fontSize: '17px' }} />,
                label: 'Search',
            });
        }

        if (user) {
            //admin
            if (user.role?.toLowerCase() === "admin") {
                return [
                    { key: 'home', label: 'Home' },
                    {
                        key: 'admin',
                        label: 'Admin',
                        icon: <DashboardOutlined style={{ fontSize: '17px' }} />,
                    },
                    { key: 'logout', label: 'Logout' },
                ];
            }

            //user thường
            return [
                ...commonItems,
                { key: 'profile', label: 'Profile', icon: <UserOutlined style={{ fontSize: '17px' }} /> },
                { key: 'logout', label: 'Logout' },
            ];
        }

        return [...commonItems, { key: 'login', label: 'Sign in' }];
    }, [user, location.pathname, cartCount]);

    const onClick = e => {
        setCurrent(e.key);

        if (!user && (e.key === "cart" || e.key === "orders")) {
            message.warning("You must be logged in to access this feature");
            return;
        }

        if (e.key === 'logout') {
            Modal.confirm({
                title: "Are you sure you want to log out?",
                icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
                okText: "Yes, Logout",
                okType: "danger",
                cancelText: "No",
                onOk: () => {
                    setUser(null);
                    localStorage.removeItem('access_token');
                    message.success("Logout successful");
                    navigate('/');
                },
            });
            return;
        }

        if (e.key === "search") {
            setShowSearch(prev => !prev);
            return;
        }

        const targetRoute = routeMap[e.key];
        if (targetRoute) navigate(targetRoute);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
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
                    <a href="/">
                        <img src="/images/logo.png" alt="logo" className="header-logo" />
                    </a>
                    <Menu
                        onClick={onClick}
                        selectedKeys={current ? [current] : []}
                        mode="horizontal"
                        items={items}
                        className="header-menu"
                    />
                </div>

                {/* Search bar chỉ render nếu KHÔNG ở home */}
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
