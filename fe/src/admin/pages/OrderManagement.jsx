import { useEffect, useMemo, useState } from "react";
import {
    Button,
    DatePicker,
    Form,
    message,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    Input,
} from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getAllOrders, updateStatusOrder } from "../../services/admin.service";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const orderStatuses = ["PENDING", "CANCELED", "COMPLETE"];

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrders();
            setOrders(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error("Unable to load orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesSearch = normalizedSearch
                ? [order.order_id, order.user?.name, order.user?.email]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(normalizedSearch)
                    )
                : true;

            const matchesStatus =
                statusFilter === "all" || order.status === statusFilter;

            const matchesDate = dateRange.length
                ? dayjs(order.created_at).isBetween(
                    dateRange[0].startOf("day"),
                    dateRange[1].endOf("day"),
                    null,
                    "[]"
                )
                : true;

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [orders, searchTerm, statusFilter, dateRange]);

    const handleEditOrder = (order) => {
        setEditingOrder(order);
    };

    const handleUpdateOrder = async () => {
        try {
            const values = await form.validateFields();
            await updateStatusOrder(editingOrder.order_id, values.status);

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.order_id === editingOrder.order_id
                        ? { ...order, status: values.status }
                        : order
                )
            );

            setEditingOrder(null);
            message.success("Order status updated successfully!");
        } catch (err) {
            console.error(err);
            message.error("Failed to update order status!");
        }
    };

    const columns = [
        {
            title: "Order ID",
            dataIndex: "order_id",
            key: "order_id",
            sorter: (a, b) => a.order_id - b.order_id,
        },
        {
            title: "Customer",
            key: "customerName",
            render: (_, record) => `${record.user?.name ?? "—"}`,
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
        },
        {
            title: "Total",
            dataIndex: "total_amount",
            key: "total_amount",
            sorter: (a, b) => a.total_amount - b.total_amount,
            render: (value) =>
                Number(value)?.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                }) ?? "—",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value) => {
                const colors = {
                    PENDING: "orange",
                    COMPLETE: "green",
                    CANCELED: "red",
                };
                return <Tag color={colors[value] || "default"}>{value}</Tag>;
            },
        },
        {
            title: "Placed on",
            dataIndex: "created_at",
            key: "created_at",
            render: (value) => dayjs(value).format("YYYY-MM-DD HH:mm"),
            sorter: (a, b) =>
                dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEditOrder(record)}>
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-orders">
            <Typography.Title level={3}>Order management</Typography.Title>
            <Typography.Paragraph>
                Search, filter, and update order statuses to ensure every purchase is
                fulfilled on time.
            </Typography.Paragraph>

            <Space style={{ marginBottom: 16, flexWrap: "wrap" }} size={[16, 16]}>
                <Input.Search
                    placeholder="Search by order ID, customer, or email"
                    allowClear
                    enterButton="Search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onSearch={setSearchTerm}
                    style={{ minWidth: 280 }}
                />
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { label: "All statuses", value: "all" },
                        ...orderStatuses.map((status) => ({
                            label: status,
                            value: status,
                        })),
                    ]}
                    style={{ width: 180 }}
                />
                <RangePicker
                    value={dateRange}
                    onChange={(value) => setDateRange(value || [])}
                    allowEmpty={[true, true]}
                />
            </Space>

            <Table
                rowKey={(record) => record.order_id}
                columns={columns}
                dataSource={filteredOrders}
                loading={loading}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: "No orders found." }}
            />

            <Modal
                open={Boolean(editingOrder)}
                title={`Edit order #${editingOrder?.order_id ?? ""}`.trim()}
                onCancel={() => setEditingOrder(null)}
                onOk={handleUpdateOrder}
                okText="Save changes"
                destroyOnClose
                afterOpenChange={(open) => {
                    if (open && editingOrder) {
                        form.setFieldsValue({
                            status: editingOrder.status,
                            note: editingOrder.note,
                        });
                    } else {
                        form.resetFields();
                    }
                }}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Status"
                        name="status"
                        rules={[{ required: true, message: "Please select a status" }]}
                    >
                        <Select
                            options={orderStatuses.map((status) => ({
                                label: status,
                                value: status,
                            }))}
                        />
                    </Form.Item>

                    {/* Shipping info: chỉ hiển thị, không sửa */}
                    {editingOrder && (
                        <div style={{ marginTop: 16 }}>
                            <Typography.Title
                                level={5}
                                style={{ marginBottom: 12, color: "#1677ff" }}
                            >
                                Shipping Information
                            </Typography.Title>

                            <div
                                style={{
                                    background: "#fafafa",
                                    borderRadius: 8,
                                    padding: "12px 16px",
                                    border: "1px solid #f0f0f0",
                                }}
                            >
                                <p style={{ marginBottom: 6 }}>
                                    <b>Receiver:</b> {editingOrder.receiverName}
                                </p>
                                <p style={{ marginBottom: 6 }}>
                                    <b>Phone:</b> {editingOrder.receiverPhone}
                                </p>
                                <p style={{ marginBottom: 0 }}>
                                    <b>Address:</b> {editingOrder.receiverAddress}
                                </p>
                            </div>
                        </div>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default OrderManagement;
