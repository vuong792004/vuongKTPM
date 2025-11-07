import { Layout, Menu, Typography, Button } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  TagsOutlined,
  ShoppingOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./admin.css";

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Overview",
    path: "/admin",
  },
  {
    key: "products",
    icon: <AppstoreOutlined />,
    label: "Products",
    path: "/admin/products",
  },

  {
    key: "users",
    icon: <TeamOutlined />,
    label: "Users",
    path: "/admin/users",
  },
  {
    key: "orders",
    icon: <ShoppingOutlined />,
    label: "Orders",
    path: "/admin/orders",
  },
  {
    key: "inventory",
    icon: <ShopOutlined />,
    label: "Inventory",
    path: "/admin/inventory",
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKeys = useMemo(() => {
    if (location.pathname === "/admin") {
      return ["dashboard"];
    }

    // tìm item có path khớp dài nhất với pathname
    const matchedItem = menuItems
      .filter((item) => location.pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0];

    return matchedItem ? [matchedItem.key] : [];
  }, [location.pathname]);

  const onMenuClick = ({ key }) => {
    const item = menuItems.find((menuItem) => menuItem.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  return (
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        className="admin-sider"
      >
        <div className="admin-logo">
          <a href="/admin">
            <img src="/images/logo.png" alt="logo" className="header-logo" />
          </a>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={onMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Typography.Title level={4} className="admin-header__title">
            Administration Console
          </Typography.Title>
          <Button type="primary" onClick={() => navigate("/")}>
            Back To Storefront
          </Button>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
