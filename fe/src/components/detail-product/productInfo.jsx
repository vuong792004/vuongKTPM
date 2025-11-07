import { useContext, useState, useEffect, useMemo } from "react";
import './productInfor.css';
import { Divider, message } from "antd";
import { addToCartFromDetail } from "../../services/api.service";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/auth.context";

const ProductInfor = ({ productInfo, reviews = [] }) => {
    const { user, setCartCount } = useContext(AuthContext);

    const [selectedColor, setSelectedColor] = useState("");
    const [selectedStorage, setSelectedStorage] = useState("");
    const [quantity, setQuantity] = useState(1);

    const colors = useMemo(() => {
        return productInfo?.variants
            ? [...new Set(productInfo.variants.map(v => v.color))]
            : [];
    }, [productInfo]);

    const storages = useMemo(() => {
        if (!productInfo?.variants) return [];
        return productInfo.variants
            .filter(v => v.color === (selectedColor || colors[0]))
            .map(v => v.storage);
    }, [productInfo, selectedColor, colors]);

    const selectedVariant = useMemo(() => {
        if (!productInfo?.variants) return null;
        return productInfo.variants.find(
            v =>
                v.color === (selectedColor || colors[0]) &&
                v.storage === (selectedStorage || storages[0])
        );
    }, [productInfo, selectedColor, selectedStorage, colors, storages]);

    useEffect(() => {
        if (colors.length > 0) {
            setSelectedColor(colors[0]);
        }
    }, [colors]);

    useEffect(() => {
        if (storages.length > 0) {
            setSelectedStorage(storages[0]);
        }
    }, [storages]);

    const handleAddToCart = async () => {
        if (!user) {
            message.warning("You need to log in to add products to your cart.");
            return;
        }

        try {
            const res = await addToCartFromDetail(selectedVariant.id, quantity);

            if (res.data.success) {
                message.success("Product added to cart successfully!");
                setCartCount(prev => prev + quantity);
            } else {
                message.warning(
                    `You already have ${res.data.currentQuantity} in cart. Only ${res.data.stock} available.`
                );
                setQuantity(Math.max(1, res.data.stock - res.data.currentQuantity));
            }
        } catch (err) {
            message.error("Something went wrong. Please try again!");
        }
    };


    // hàm tính trung bình sao
    const avgRating = useMemo(() => {
        if (!reviews || reviews.length === 0) return 0;
        return (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1);
    }, [reviews]);

    if (!productInfo || !productInfo.variants) {
        return null;
    }

    // Tính stock và sold từ variant
    const stock = selectedVariant?.Inventory?.[0]?.stock ?? 0;
    const sold = selectedVariant?.Inventory?.[0]?.sold ?? 0;
    const isOutOfStock = stock <= 0;

    return (
        <div className="pi-wrapper">
            <div className="pi-top">
                <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/product/${productInfo.image}`}
                    alt={productInfo.name}
                    className="pi-image"
                />
                <div className="pi-details">
                    <h1 className="pi-title">{productInfo.name}</h1>
                    <p className="pi-category">{productInfo.category?.name ?? "Unknown category"}</p>

                    {/* rung bình sao */}
                    <div className="pi-rating">
                        <span className="stars">
                            {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}
                        </span>
                        <span className="avg-score">{avgRating}</span>
                        <span className="review-count">({reviews.length} reviews)</span>
                    </div>

                    <p className="pi-price">{selectedVariant?.price}$</p>

                    {/* Stock & Sold */}
                    <div className="pi-inventory">
                        {isOutOfStock ? (
                            <span className="pi-outofstock">Out of stock</span>
                        ) : (
                            <>
                                <span className="pi-stock">In Stock: {stock}</span>
                                <span className="pi-sold">Sold: {sold}</span>
                            </>
                        )}
                    </div>

                    {/* Chọn màu */}
                    <div className="pi-colors">
                        <span>Color: </span>
                        {colors.map(color => (
                            <span
                                key={color}
                                className={`pi-color-dot ${selectedColor === color ? "selected" : ""}`}
                                style={{ backgroundColor: color }}
                                title={color}
                                onClick={() => setSelectedColor(color)}
                            />
                        ))}
                    </div>

                    {/* Chọn dung lượng */}
                    <div className="pi-capacities">
                        <span>Storage: </span>
                        {storages.map(storage => (
                            <button
                                key={storage}
                                className={`pi-capacity-btn ${selectedStorage === storage ? "selected" : ""}`}
                                onClick={() => setSelectedStorage(storage)}
                            >
                                {storage}
                            </button>
                        ))}
                    </div>

                    {/* Chọn số lượng */}
                    <div className="pi-quantity">
                        <span>Quantity: </span>
                        <div className="pi-quantity-controls">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="pi-quantity-btn"
                                disabled={quantity <= 1}
                            >
                                <MinusOutlined />
                            </button>
                            <span className="pi-quantity-value">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                                className="pi-quantity-btn"
                                disabled={quantity >= stock}   // disable khi đã = stock
                            >
                                <PlusOutlined />
                            </button>
                        </div>
                    </div>


                    <button
                        className="pi-add-btn"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                    >
                        {isOutOfStock ? "Unavailable" : "Add to Cart"}
                    </button>

                </div>
            </div>
            <Divider />
            <div className="pi-description">
                <h3>Product Description</h3>
                <p>{productInfo.description ?? "Chưa có mô tả sản phẩm."}</p>
            </div>
        </div >
    );
};

export default ProductInfor;
