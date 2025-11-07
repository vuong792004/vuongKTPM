import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Table, Skeleton } from "antd";
import { getAllOrders, getAllUsers, getAllProduct } from "../../services/admin.service";

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isSubscribed = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [productRes, usersRes, orderRes] = await Promise.all([
                    getAllProduct(),
                    getAllUsers(),
                    getAllOrders(),
                ]);

                if (!isSubscribed) return;

                setProducts(Array.isArray(productRes?.data) ? productRes.data : []);
                setUsers(Array.isArray(usersRes?.data) ? usersRes.data : []);
                setOrders(Array.isArray(orderRes?.data) ? orderRes.data : []);
            } catch (error) {
                console.error("Failed to load admin overview data:", error);
                if (isSubscribed) {
                    setProducts([]);
                    setUsers([]);
                    setOrders([]);
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { isSubscribed = false; };
    }, []);
    console.log(users, orders)
    const totalInventory = useMemo(() => {
        return products.reduce((sum, product) => {
            return (
                sum +
                product.variants.reduce((variantSum, variant) => {
                    return (
                        variantSum +
                        variant.Inventory.reduce((invSum, inv) => invSum + (Number(inv.stock) || 0), 0)
                    );
                }, 0)
            );
        }, 0);
    }, [products]);

    const topProducts = useMemo(() => {
        return [...products]
            .map((product) => {
                const totalStock = product.variants.reduce((sum, variant) => {
                    return sum + variant.Inventory.reduce((invSum, inv) => invSum + (Number(inv.stock) || 0), 0);
                }, 0);
                return { ...product, stock: totalStock };
            })
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 5);
    }, [products]);

    return (
        <div className="admin-dashboard">
            <Typography.Title level={3}>Store overview</Typography.Title>
            <Typography.Paragraph>
                Track the key performance indicators of your catalogue at a glance.
            </Typography.Paragraph>

            {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                            <Card>
                                <Statistic title="Total products" value={products.length} />
                            </Card>
                        </Col>
                        <Col xs={24} md={6}>
                            <Card>
                                <Statistic title="Total users" value={users.length} />
                            </Card>
                        </Col>
                        <Col xs={24} md={6}>
                            <Card>
                                <Statistic title="Total orders" value={orders.length} />
                            </Card>
                        </Col>
                        <Col xs={24} md={6}>
                            <Card>
                                <Statistic title="Items in stock" value={totalInventory} />
                            </Card>
                        </Col>
                    </Row>


                    <Card title="Top inventory" style={{ marginTop: 24 }}>
                        <Table
                            rowKey={(record) => record?.id}
                            dataSource={topProducts}
                            pagination={false}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <Table
                                        rowKey={(v) => v.id}
                                        dataSource={record.variants.map((variant) => ({
                                            ...variant,
                                            stock: variant.Inventory?.[0]?.stock ?? 0,
                                        }))}
                                        pagination={false}
                                        columns={[
                                            { title: "Color", dataIndex: "color", key: "color" },
                                            { title: "Storage", dataIndex: "storage", key: "storage" },
                                            {
                                                title: "Price",
                                                dataIndex: "price",
                                                key: "price",
                                                render: (value) =>
                                                    value
                                                        ? `${Number(value).toLocaleString(undefined, {
                                                            style: "currency",
                                                            currency: "USD",
                                                        })}`
                                                        : "-",
                                            },
                                            { title: "Stock", dataIndex: "stock", key: "stock" },
                                        ]}
                                    />
                                ),
                            }}
                            columns={[
                                { title: "Product", dataIndex: "name", key: "name" },
                                {
                                    title: "Category",
                                    dataIndex: "category",
                                    key: "category",
                                    render: (value) => value?.name || "Unknown",
                                },
                                { title: "Stock (Total)", dataIndex: "stock", key: "stock" },
                            ]}
                        />
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
