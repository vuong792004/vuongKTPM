import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select, Space, Table, Tag, Typography, Modal, Col, Row } from "antd";
import { getAllInventory } from "../../services/admin.service";
import { getAllCategory } from "../../services/api.service";

const statusFilters = [
    { label: "All", value: "all" },
    { label: "In stock", value: "in" },
    { label: "Low stock", value: "low" },
    { label: "Out of stock", value: "out" },
];

const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let isSubscribed = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [inventoryRes, categoryRes] = await Promise.all([
                    getAllInventory(),
                    getAllCategory(),
                ]);
                if (!isSubscribed) return;
                setProducts(Array.isArray(inventoryRes?.data) ? inventoryRes.data : []);
                setCategories(Array.isArray(categoryRes?.data) ? categoryRes.data : []);
            } catch (error) {
                console.error("Unable to load inventory:", error);
                if (isSubscribed) setProducts([]);
            } finally {
                if (isSubscribed) setLoading(false);
            }
        };

        fetchData();
        return () => {
            isSubscribed = false;
        };
    }, []);

    // Trải phẳng thành từng variant
    const derivedVariants = useMemo(() => {
        return products.flatMap((product) => {
            const categoryName =
                categories.find((c) => c.category_id === product.category_id)?.name ||
                "Uncategorised";

            return product.variants.map((variant) => {
                const stock = Number(variant?.Inventory?.[0]?.stock) || 0;
                const sold = Number(variant?.Inventory?.[0]?.sold) || 0;
                const available = Math.max(stock - sold, 0);
                const reorderPoint = 10;

                let status = "In stock";
                if (available === 0) status = "Out of stock";
                else if (available <= reorderPoint) status = "Low stock";

                return {
                    productId: product.id,
                    productName: product.name,
                    category: categoryName,
                    variantId: variant.id,
                    color: variant.color,
                    storage: variant.storage,
                    price: variant.price,
                    stock,
                    sold,
                    available,
                    status,
                    logs: variant.InventoryLog || [],
                };
            });
        });
    }, [products, categories]);

    // filter
    const filteredVariants = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        return derivedVariants.filter((v) => {
            const matchesSearch = keyword
                ? [v.productName, v.color, v.storage, v.category]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(keyword))
                : true;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "in" && v.status === "In stock") ||
                (statusFilter === "low" && v.status === "Low stock") ||
                (statusFilter === "out" && v.status === "Out of stock");

            return matchesSearch && matchesStatus;
        });
    }, [derivedVariants, searchTerm, statusFilter]);

    // columns
    const columns = [
        { title: "Product", dataIndex: "productName", key: "productName" },
        { title: "Variant", key: "variant", render: (_, r) => `${r.color} ${r.storage || ""}` },
        { title: "Category", dataIndex: "category", key: "category" },
        { title: "Price", dataIndex: "price", key: "price", render: (v) => `$${v}` },
        { title: "Stock", dataIndex: "stock", key: "stock" },
        { title: "Sold", dataIndex: "sold", key: "sold" },
        { title: "Available", dataIndex: "available", key: "available" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "green";
                if (status === "Low stock") color = "orange";
                if (status === "Out of stock") color = "red";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedVariant(record);
                        setIsModalOpen(true);
                    }}
                >
                    View Logs
                </Button>
            ),
        },
    ];

    return (
        <div className="admin-inventory">
            <Typography.Title level={3}>Inventory Management</Typography.Title>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input.Search
                    placeholder="Search by product, variant, or category"
                    allowClear
                    enterButton="Search"
                    onSearch={setSearchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                    style={{ maxWidth: 320 }}
                />
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusFilters}
                    style={{ width: 180 }}
                />
            </Space>

            <Table
                rowKey={(record) => record.variantId}
                columns={columns}
                dataSource={filteredVariants}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal hiển thị Logs của 1 variant */}
            <Modal
                open={isModalOpen}
                title={`Logs for ${selectedVariant?.productName} - ${selectedVariant?.color} ${selectedVariant?.storage}`}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>Close</Button>,
                ]}
                width={900}
            >
                {selectedVariant && (
                    <div style={{ lineHeight: 1.8 }}>
                        {/* Product Info */}
                        <Typography.Title level={5}>Variant Info</Typography.Title>
                        <div
                            style={{
                                background: "#fafafa",
                                padding: "16px",
                                borderRadius: "8px",
                                marginBottom: "16px",
                                border: "1px solid #f0f0f0",
                            }}
                        >
                            <Row gutter={[16, 8]}>
                                <Col span={12}>
                                    <p><b>Product:</b> {selectedVariant.productName}</p>
                                </Col>
                                <Col span={12}>
                                    <p><b>Category:</b> {selectedVariant.category}</p>
                                </Col>
                                <Col span={12}>
                                    <p><b>Color:</b> {selectedVariant.color}</p>
                                </Col>
                                <Col span={12}>
                                    <p><b>Storage:</b> {selectedVariant.storage || "-"}</p>
                                </Col>
                                <Col span={12}>
                                    <p><b>Price:</b> ${selectedVariant.price}</p>
                                </Col>
                                <Col span={12}>
                                    <p><b>Status:   </b>
                                        <Tag color={
                                            selectedVariant.status === "Out of stock" ? "red" :
                                                selectedVariant.status === "Low stock" ? "orange" : "green"
                                        }>
                                            {selectedVariant.status}
                                        </Tag>
                                    </p>
                                </Col>
                                <Col span={24}>
                                    <p><b>Stock:</b> {selectedVariant.stock}</p>
                                </Col>
                                <Col span={24}>
                                    <p><b>Sold:</b> {selectedVariant.sold}</p>
                                </Col>
                                <Col span={24}>
                                    <p><b>Available:</b> {selectedVariant.available}</p>
                                </Col>
                            </Row>
                        </div>

                        {/* Logs */}
                        <Typography.Title level={5}>Logs</Typography.Title>
                        {selectedVariant.logs.length > 0 ? (
                            <Table
                                rowKey={(log) => log.id}
                                dataSource={selectedVariant.logs}
                                columns={[
                                    { title: "Action", dataIndex: "action_type", width: 100 },
                                    { title: "Quantity", dataIndex: "quantity", width: 100 },
                                    { title: "Note", dataIndex: "note", ellipsis: true },
                                    {
                                        title: "User",
                                        key: "user",
                                        render: (log) =>
                                            log.user ? (
                                                <span>
                                                    <b>{log.user.name || "Unknown"}</b>
                                                    <br />
                                                    <small style={{ color: "#888" }}>{log.user.email}</small>
                                                </span>
                                            ) : (
                                                "-"
                                            ),
                                    },
                                    {
                                        title: "Date",
                                        dataIndex: "created_at",
                                        render: (date) =>
                                            new Date(date).toLocaleString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }),
                                    },
                                ]}
                                pagination={false}
                                size="small"
                                bordered
                            />
                        ) : (
                            <p>No logs available</p>
                        )}
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default InventoryManagement;
