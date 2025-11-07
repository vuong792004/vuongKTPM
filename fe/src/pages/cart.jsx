import { useEffect, useState } from 'react';
import CartItem from '../components/cart/cartItem';
import CartSummary from '../components/cart/cartSummary';
import CartHeader from '../components/cart/cartHeader';
import { getCart } from '../services/api.service';

const CartPage = () => {
    const [items, setItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await getCart();
                if (res.data && res.data.success) {
                    setCartId(res.data.cartId);
                    const mappedItems = res.data.cart_detail.map(d => ({
                        id: d.item_id,
                        name: d.variant.product?.name || `Variant ${d.variant_id}`,
                        variant: `${d.variant.color} ${d.variant.storage ? `· ${d.variant.storage}` : ""}`,
                        price: Number(d.variant.price),
                        image: d.variant.product
                            ? `${import.meta.env.VITE_BACKEND_URL}/product/${d.variant.product.image}`
                            : "/images/placeholder.png",
                        quantity: d.quantity,
                        productId: d.variant.product_id,
                        variantId: d.variant_id,
                        stock: d.variant.Inventory?.[0]?.stock ?? 0

                    }));

                    setItems(mappedItems);
                    console.log(res.data)
                    setSelectedIds(mappedItems.map(i => i.id)); // mặc định chọn tất cả
                }
            } catch (err) {
                console.error("Error fetching cart:", err);
            }
        };
        fetchCart();
    }, []);

    return (
        <div className="cart-page" style={{
            maxWidth: "1200px",
            margin: "40px auto 80px",
            padding: "0 20px",
        }}>
            <CartHeader />
            <div className="cart-layout" style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2.2fr) minmax(280px, 1fr)",
                gap: "24px",
                alignItems: "start"
            }}>
                <CartItem
                    items={items}
                    setItems={setItems}
                    cartId={cartId}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                />
                <CartSummary items={items} selectedIds={selectedIds} />
            </div>
        </div>
    );
};

export default CartPage;
