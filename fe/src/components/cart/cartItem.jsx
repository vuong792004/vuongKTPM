import { useNavigate, Link } from 'react-router-dom';
import './cart.css';
import { MinusOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { updateCartQuantity, deleteProductFromCart } from '../../services/api.service';
import { Popconfirm, message } from 'antd';
import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';

const CartItem = ({ items, setItems, cartId, selectedIds, setSelectedIds }) => {
    const navigate = useNavigate();
    const { setCartCount } = useContext(AuthContext);

    // update số lượng
    const updateQuantity = async (id, delta) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newQuantity = Math.max(1, item.quantity + delta);

        if (newQuantity > item.stock) {
            message.warning(`Not enough stock. Only ${item.stock} available.`);
            return;
        }

        setItems(prev =>
            prev.map(i =>
                i.id === id ? { ...i, quantity: newQuantity } : i
            )
        );

        try {
            await updateCartQuantity(cartId, id, newQuantity);
            if (delta > 0) {
                setCartCount(prev => prev + delta);
            } else if (delta < 0 && item.quantity > 1) {
                setCartCount(prev => prev + delta);
            }
        } catch (err) {
            console.error("Failed to update cart:", err);
        }
    };

    // xóa 1 sản phẩm
    const removeItem = async (id) => {
        try {
            const res = await deleteProductFromCart(id);
            if (res.data.success) {
                const removedItem = items.find(i => i.id === id);
                setItems(prev => prev.filter(i => i.id !== id));
                setSelectedIds(prev => prev.filter(pid => pid !== id));
                if (removedItem) {
                    setCartCount(prev => Math.max(0, prev - removedItem.quantity));
                }
            }
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    // xóa nhiều sản phẩm được chọn
    const removeAllItems = async () => {
        if (selectedIds.length === 0) return;
        try {
            const removedItems = items.filter(i => selectedIds.includes(i.id));
            await Promise.all(selectedIds.map(id => deleteProductFromCart(id)));
            setItems(prev => prev.filter(i => !selectedIds.includes(i.id)));
            setSelectedIds([]);
            const totalRemoved = removedItems.reduce((sum, i) => sum + i.quantity, 0);
            setCartCount(prev => Math.max(0, prev - totalRemoved));
        } catch (err) {
            console.error("Error deleting selected products:", err);
        }
    };

    // xóa tất cả sản phẩm hết hàng
    const removeAllOutOfStock = async () => {
        const outOfStockItems = items.filter(i => i.stock <= 0);
        if (outOfStockItems.length === 0) return;
        try {
            await Promise.all(outOfStockItems.map(i => deleteProductFromCart(i.id)));
            setItems(prev => prev.filter(i => i.stock > 0));
            const totalRemoved = outOfStockItems.reduce((sum, i) => sum + i.quantity, 0);
            setCartCount(prev => Math.max(0, prev - totalRemoved));
        } catch (err) {
            console.error("Error deleting out-of-stock products:", err);
        }
    };

    const selectAll = () => setSelectedIds(items.map(i => i.id));
    const deselectAll = () => setSelectedIds([]);
    const toggleSelect = (id) =>
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );

    // chia items thành 2 nhóm: còn hàng và hết hàng
    const inStockItems = items.filter(i => i.stock > 0);
    const outOfStockItems = items.filter(i => i.stock <= 0);

    return (
        <section className="cart-items">
            {items.length === 0 ? (
                <div className="cart-empty">
                    <h3>Your cart is empty</h3>
                    <p>Add some products from the store to get started.</p>
                    <button className="cart-empty__cta" onClick={() => navigate('/')}>
                        Continue shopping
                    </button>
                </div>
            ) : (
                <>
                    {/* Actions */}
                    <div className="cart-actions">
                        <button className="select-all" onClick={selectAll}>Select All</button>
                        <button className="deselect-all" onClick={deselectAll}>Deselect All</button>
                    </div>

                    {/* Còn hàng */}
                    {inStockItems.map(item => (
                        <article className="cart-item" key={item.id}>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                className="cart-item__checkbox"
                            />
                            <Link to={`/product/${item.productId}`} className="cart-item__link">
                                <img src={item.image} alt={item.name} className="cart-item__image" />
                            </Link>
                            <div className="cart-item__content">
                                <div className="cart-item__info">
                                    <Link to={`/product/${item.productId}`} className="cart-item__link">
                                        <h3 className="cart-item__name">{item.name}</h3>
                                        <p className="cart-item__variant">{item.variant}</p>
                                    </Link>
                                </div>

                                <div className="cart-item__actions">
                                    <div className="cart-quantity">
                                        <button
                                            className="cart-quantity__btn"
                                            onClick={() => updateQuantity(item.id, -1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <MinusOutlined />
                                        </button>
                                        <span className="cart-quantity__value">{item.quantity}</span>
                                        <button
                                            className="cart-quantity__btn"
                                            onClick={() => updateQuantity(item.id, 1)}
                                            disabled={item.quantity >= item.stock}
                                        >
                                            <PlusOutlined />
                                        </button>
                                    </div>
                                    <p className="cart-item__price">
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </p>
                                    <button
                                        className="cart-remove"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <DeleteOutlined /> Remove
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    {/* Hết hàng */}
                    {outOfStockItems.map(item => (
                        <article className="cart-item out-of-stock" key={item.id}>
                            <Link to={`/product/${item.productId}`} className="cart-item__link">
                                <img src={item.image} alt={item.name} className="cart-item__image" />
                            </Link>
                            <div className="cart-item__content">
                                <div className="cart-item__info">
                                    <h3 className="cart-item__name">{item.name}</h3>
                                    <p className="cart-item__variant">{item.variant}</p>
                                    <p className="cart-item__status">Out of stock</p>
                                </div>

                                <div className="cart-item__actions">
                                    <div className="cart-quantity">
                                        <button className="cart-quantity__btn" disabled>
                                            <MinusOutlined />
                                        </button>
                                        <span className="cart-quantity__value">{item.quantity}</span>
                                        <button className="cart-quantity__btn" disabled>
                                            <PlusOutlined />
                                        </button>
                                    </div>
                                    <p className="cart-item__price">
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </p>
                                    <button
                                        className="cart-remove"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <DeleteOutlined /> Remove
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    {/* Group action buttons */}
                    {(items.length > 0 || outOfStockItems.length > 0) && (
                        <div className="cart-remove-actions">
                            {items.length > 0 && (
                                <Popconfirm
                                    title="Remove items"
                                    description="Do you want to remove all selected items?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={removeAllItems}
                                    placement="bottom"
                                >
                                    <button className="cart-removeall">
                                        <DeleteOutlined /> Empty Cart
                                    </button>
                                </Popconfirm>
                            )}

                            {outOfStockItems.length > 0 && (
                                <Popconfirm
                                    title="Remove out-of-stock items"
                                    description="Do you want to remove all out-of-stock products?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={removeAllOutOfStock}
                                    placement="bottom"
                                >
                                    <button className="cart-removeall outofstock-btn">
                                        <DeleteOutlined /> Remove out-of-stock
                                    </button>
                                </Popconfirm>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default CartItem;
