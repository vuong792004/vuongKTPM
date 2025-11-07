import { useMemo } from 'react';
import './cart.css'
import { useNavigate } from 'react-router-dom';

const CartSummary = ({ items, selectedIds }) => {
    const navigate = useNavigate();

    //Lọc sản phẩm đã chọn và còn hàng
    const selectedItems = useMemo(
        () => items.filter(item => selectedIds.includes(item.id) && item.stock > 0),
        [items, selectedIds]
    );

    const subtotal = useMemo(
        () => selectedItems.reduce((total, item) => total + item.price * item.quantity, 0),
        [selectedItems]
    );

    const estimatedTax = useMemo(() => Math.round(subtotal * 0.08 * 100) / 100, [subtotal]);
    const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 19;
    const total = useMemo(() => subtotal + estimatedTax + shippingFee, [subtotal, estimatedTax, shippingFee]);

    const handleCheckout = () => {
        if (selectedItems.length === 0) return;
        // truyền selectedItems sang CheckoutPage
        navigate('/checkout', { state: { selectedItems } });
    };

    return (
        <aside className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row">
                <span>Estimated tax</span>
                <span>${estimatedTax.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : `$${shippingFee}`}</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__total">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
            </div>

            <button
                className="cart-summary__checkout"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
            >
                Proceed to checkout
            </button>

            <div className="cart-summary__note">
                <h4>Need help?</h4>
                <p>Our support team is ready to assist with order and warranty questions.</p>
                <button className="cart-summary__link" onClick={() => navigate('/support')}>
                    Contact support
                </button>
            </div>
        </aside>
    )
};

export default CartSummary;
