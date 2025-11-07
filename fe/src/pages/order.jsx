import { useEffect, useState } from 'react';
import '../styles/orders.css';
import { getOrderHistory, cancelOrder } from '../services/api.service';
import dayjs from "dayjs";
import { Modal, message } from "antd";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                const res = await getOrderHistory();
                if (res.data && res.data.success) {
                    setOrders(res.data.order);
                    if (res.data.order.length > 0) {
                        setSelected(res.data.order[0]); // set first order
                    }
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
            }
        };
        fetchOrderHistory();
    }, []);

    const statusClass = (status) => {
        if (status === 'DELIVERED') return 'status-delivered';
        if (status === 'PROCESSING' || status === 'PENDING') return 'status-processing';
        return 'status-default';
    };

    const handleCancelOrder = (orderId) => {
        Modal.confirm({
            title: "Are you sure you want to cancel this order?",
            content: "This action cannot be undone.",
            okText: "Yes, Cancel",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    const res = await cancelOrder(orderId);
                    if (res.data.success) {
                        message.success("Order cancelled successfully");
                        setOrders(prev =>
                            prev.map(o =>
                                o.order_id === orderId
                                    ? { ...o, status: "CANCELLED" }
                                    : o
                            )
                        );
                        setSelected(prev => ({ ...prev, status: "CANCELLED" }));
                    } else {
                        message.error("Failed to cancel the order");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("An error occurred while cancelling the order");
                }
            },
        });
    };

    return (
        <div className="orders-page">
            <header className="orders-header">
                <h1>Order history</h1>
                <p>Track the status of your devices and download receipts easily.</p>
            </header>

            <div className="orders-layout">
                {orders.length > 0 ? (
                    <>
                        {/* Danh sách đơn hàng */}
                        <aside className="orders-list">
                            {orders.map(order => (
                                <button
                                    key={order.order_id}
                                    className={`orders-item ${selected?.order_id === order.order_id ? 'active' : ''}`}
                                    onClick={() => setSelected(order)}
                                >
                                    <div className="orders-item__top">
                                        <h3>Order #{order.order_id}</h3>
                                        <span className={`orders-status ${statusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p>{dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}</p>
                                    <span className="orders-total">
                                        ${Number(order.total_amount).toLocaleString()}
                                    </span>
                                </button>
                            ))}
                        </aside>

                        {/* Chi tiết đơn hàng */}
                        <section className="orders-detail">
                            {selected ? (
                                <div className="orders-card">
                                    <h2>Order #{selected.order_id}</h2>
                                    <p className="orders-detail__date">
                                        Placed on {dayjs(selected.created_at).format("DD/MM/YYYY HH:mm")}
                                    </p>

                                    <div className="orders-detail__summary">
                                        <div>
                                            <span>Status</span>
                                            <strong className={`orders-status ${statusClass(selected.status)}`}>
                                                {selected.status}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Total</span>
                                            <strong>${Number(selected.total_amount).toLocaleString()}</strong>
                                        </div>
                                        <div>
                                            <span>Payment Method</span>
                                            <strong>{selected.paymentMethod || "COD"}</strong>
                                        </div>
                                    </div>

                                    <div className="orders-detail__shipping">
                                        <h3>Shipping details</h3>
                                        <p><strong>Name:</strong> {selected.receiverName}</p>
                                        <p><strong>Phone:</strong> {selected.receiverPhone}</p>
                                        <p><strong>Address:</strong> {selected.receiverAddress}</p>
                                    </div>

                                    <div className="orders-detail__items">
                                        <h3>Items</h3>
                                        <ul>
                                            {selected.items.map(item => (
                                                <li key={item.order_item_id}>
                                                    {item.variant.product.name} x {item.quantity} (${item.price})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {selected.status === "PENDING" && (
                                        <div className="orders-detail__actions">
                                            <button
                                                className="cancel-btn"
                                                onClick={() => handleCancelOrder(selected.order_id)}
                                            >
                                                CANCEL
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: "#999" }}>No order selected</p>
                            )}
                        </section>
                    </>
                ) : (
                    <section className="orders-empty">
                        <h3>No orders yet</h3>
                        <p>
                            Looks like you haven’t placed any orders.
                            Browse our products and shop your favorite items!
                        </p>
                        <button
                            className="orders-support__cta"
                            onClick={() => navigate("/")}
                        >
                            Shop Now
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
