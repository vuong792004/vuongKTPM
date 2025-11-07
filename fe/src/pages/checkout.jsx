import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/checkout.css';
import { AuthContext } from '../components/context/auth.context';
import { placeOrder } from '../services/api.service';
import { Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const CheckoutPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // lấy danh sách sản phẩm được chọn từ CartSummary
    const selectedItems = location.state?.selectedItems || [];

    const [shipping, setShipping] = useState({
        fullName: user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // tính tiền
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const TAX_RATE = 0.08;
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 19;
    const total = Number((subtotal + tax + shippingFee).toFixed(2));

    const handleChange = event => {
        const { name, value } = event.target;
        setShipping(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        Modal.confirm({
            title: "Confirm your order",
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            content: "Are you sure you want to place this order?",
            okText: "Yes, Place order",
            okType: "primary",
            cancelText: "No",
            onOk: async () => {
                setIsSubmitting(true);
                try {
                    const orderData = {
                        receiverName: shipping.fullName,
                        receiverAddress: shipping.address,
                        receiverPhone: shipping.phone,
                        totalAmount: total,
                        paymentMethod: paymentMethod,
                        items: selectedItems.map(item => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    };

                    const res = await placeOrder(orderData);

                    if (res.data.success) {
                        message.success(res.data.message || "Order placed successfully");
                        navigate('/orders');
                    } else {
                        message.error(res.data.message || "Failed to place order");
                    }
                } catch (err) {
                    console.error("Error placing order:", err);
                    message.error("Something went wrong. Please try again!");
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };



    return (
        <div className="checkout-page">
            <header className="checkout-header">
                <h1>Checkout</h1>
                <p>Complete your purchase securely in just a few steps.</p>
            </header>

            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    {/* Shipping details */}
                    <section className="checkout-card">
                        <h2>Shipping details</h2>
                        <div className="checkout-grid">
                            <label className="checkout-field">
                                <span>Full name</span>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={shipping.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label className="checkout-field">
                                <span>Phone number</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={shipping.phone}
                                    onChange={handleChange}
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]{9,11}"
                                    maxLength={11}
                                    placeholder="Enter phone (9-11 digits)"
                                />
                            </label>
                        </div>

                        <label className="checkout-field">
                            <span>Address</span>
                            <input
                                type="text"
                                name="address"
                                value={shipping.address}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </section>

                    {/* Payment method */}
                    <section className="checkout-card">
                        <h2>Payment method</h2>
                        <div className="checkout-payment">
                            <label className={`payment-option ${paymentMethod === 'CARD' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="CARD"
                                    checked={paymentMethod === 'CARD'}
                                    onChange={event => setPaymentMethod(event.target.value)}
                                />
                                <div>
                                    <strong>Credit / Debit card</strong>
                                    <p>Visa, MasterCard, JCB supported</p>
                                </div>
                            </label>

                            <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={event => setPaymentMethod(event.target.value)}
                                />
                                <div>
                                    <strong>Cash on delivery</strong>
                                    <p>Pay with cash or card when you receive the package</p>
                                </div>
                            </label>

                            <label className={`payment-option ${paymentMethod === 'BANK' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="BANK"
                                    checked={paymentMethod === 'BANK'}
                                    onChange={event => setPaymentMethod(event.target.value)}
                                />
                                <div>
                                    <strong>Bank transfer</strong>
                                    <p>Transfer in VND using the provided QR code</p>
                                </div>
                            </label>
                        </div>
                    </section>

                    <footer className="checkout-footer">
                        <button type="button" className="checkout-back" onClick={() => navigate('/cart')}>
                            Back to cart
                        </button>
                        <button type="submit" className="checkout-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Processing…' : 'Place order'}
                        </button>
                    </footer>
                </form>

                {/* Order summary */}
                <aside className="checkout-summary">
                    <div className="checkout-card">
                        <h2>Order summary</h2>
                        <ul className="checkout-items">
                            {selectedItems.map(item => (
                                <li key={item.id}>
                                    <div>
                                        <strong>{item.name}</strong>
                                        <p>Quantity: {item.quantity}</p>
                                    </div>
                                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="checkout-divider" />
                        <div className="checkout-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="checkout-row">
                            <span>Estimated tax (8%)</span>
                            <span>${tax.toLocaleString()}</span>
                        </div>
                        <div className="checkout-row">
                            <span>Shipping</span>
                            <span>{shippingFee === 0 ? "Free" : `$${shippingFee}`}</span>
                        </div>
                        <div className="checkout-total">
                            <span>Total</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
