import { useEffect, useState, useRef } from "react";
import { Pagination, Slider, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./product.css";

// Mock data
const mockCategories = [
    { category_id: 1, name: "Mac" },
    { category_id: 2, name: "iPhone" },
    { category_id: 3, name: "iPad" },
    { category_id: 4, name: "AirPods" },
];

const mockProducts = [
    {
        id: 1,
        name: "MacBook Pro 14",
        category: { name: "Mac" },
        image: "macbook-pro-14.jpeg",
        basePrice: 1999,
        status: true,
    },
    {
        id: 2,
        name: "iPhone 15 Pro",
        category: { name: "iPhone" },
        image: "iphone-15-pro.jpeg",
        basePrice: 1199,
        status: true,
    },
    {
        id: 3,
        name: "iPad Air 2024",
        category: { name: "iPad" },
        image: "ipad-air.jpeg",
        basePrice: 899,
        status: true,
    },
    {
        id: 4,
        name: "AirPods Pro 2",
        category: { name: "AirPods" },
        image: "airpods-pro.jpeg",
        basePrice: 299,
        status: true,
    },
];

const ProductPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const productSectionRef = useRef(null);

    const [products, setProducts] = useState(mockProducts);
    const [categories, setCategories] = useState(mockCategories);
    const [ratings, setRatings] = useState({});
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [subCategory, setSubCategory] = useState(searchParams.get("subCategory") || "");
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "");

    // lọc sản phẩm mock theo filter
    const loadProducts = (filters = {}, scroll = true) => {
        let list = [...mockProducts].filter((p) => p.status);

        if (filters.keyword) {
            list = list.filter((p) =>
                p.name.toLowerCase().includes(filters.keyword.toLowerCase())
            );
        }
        if (filters.category) {
            list = list.filter((p) => p.category?.name === filters.category);
        }
        if (filters.minPrice) {
            list = list.filter((p) => p.basePrice >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
            list = list.filter((p) => p.basePrice <= Number(filters.maxPrice));
        }
        if (filters.sort) {
            if (filters.sort === "priceAsc") list.sort((a, b) => a.basePrice - b.basePrice);
            if (filters.sort === "priceDesc") list.sort((a, b) => b.basePrice - a.basePrice);
            if (filters.sort === "nameAsc") list.sort((a, b) => a.name.localeCompare(b.name));
            if (filters.sort === "nameDesc") list.sort((a, b) => b.name.localeCompare(a.name));
        }

        setProducts(list);

        // mock rating random
        const ratingData = {};
        list.forEach((p) => {
            const avg = (Math.random() * 5).toFixed(1);
            const count = Math.floor(Math.random() * 100);
            ratingData[p.id] = { avgRating: avg, count };
        });
        setRatings(ratingData);

        setPage(1);
        if (scroll && productSectionRef.current) {
            productSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Effect filter
    useEffect(() => {
        const filters = { keyword, category, subCategory, minPrice, maxPrice, sort };
        loadProducts(filters, true);

        const params = {};
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (subCategory) params.subCategory = subCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sort) params.sort = sort;
        setSearchParams(params);
    }, [category, subCategory, minPrice, maxPrice, sort, setSearchParams]);

    // Reset filters
    const resetFilters = () => {
        setKeyword("");
        setCategory("");
        setSubCategory("");
        setMinPrice("");
        setMaxPrice("");
        setSort("");
        setSearchParams({});
        loadProducts({}, true);
    };

    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = Array.isArray(products)
        ? products.slice(startIndex, startIndex + pageSize)
        : [];

    const goToDetailPage = (id) => navigate(`/product/${id}`);

    const handleAddWishlist = (id) => {
        message.success(`Product ${id} added to wishlist (mock)!`);
    };

    return (
        <section className="product-section">
            <div className="product-section__header">
                <h3 className="product-section__title" ref={productSectionRef}>
                    APPLE WORLD
                </h3>
            </div>

            <div className="product-layout">
                {/* Sidebar Filter */}
                <aside className="product-filter-panel">
                    {/* Search */}
                    <div className="filter-group">
                        <label className="filter-group__label">Search Product</label>
                        <input
                            type="text"
                            placeholder="Enter product name..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="filter-search-input"
                        />
                    </div>
                    {/* Category */}
                    <div className="filter-group">
                        <label className="filter-group__label">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All</option>
                            {categories.map((c) => (
                                <option key={c.category_id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Price Range */}
                    <div className="filter-group">
                        <label className="filter-group__label">Price range</label>
                        <Slider
                            range
                            min={0}
                            max={5000}
                            step={50}
                            value={[Number(minPrice) || 0, Number(maxPrice) || 5000]}
                            onChange={(values) => {
                                setMinPrice(values[0]);
                                setMaxPrice(values[1]);
                            }}
                        />
                        <div className="price-range__labels">
                            <span>${minPrice || 0}</span>
                            <span>${maxPrice || 5000}</span>
                        </div>
                    </div>
                    {/* Sort */}
                    <div className="filter-group">
                        <label className="filter-group__label">Sort by</label>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Default</option>
                            <option value="priceAsc">Price: Low → High</option>
                            <option value="priceDesc">Price: High → Low</option>
                            <option value="nameAsc">Name: A → Z</option>
                            <option value="nameDesc">Name: Z → A</option>
                        </select>
                    </div>
                    {/* Reset */}
                    <div className="filter-group" style={{ display: "flex", gap: "10px" }}>
                        <button className="filter-reset-button" onClick={resetFilters}>
                            Reset
                        </button>
                    </div>
                </aside>

                {/* Product Results */}
                <div className="product-results">
                    {paginatedProducts.length > 0 ? (
                        <div className="product-container">
                            {paginatedProducts.map((item) => {
                                const rating = ratings[item.id] || { avgRating: 0, count: 0 };
                                return (
                                    <div key={item.id} className="product-card">
                                        <img
                                            src={`/images/${item.image}`}
                                            alt={item.name}
                                            className="product-image"
                                            onClick={() => goToDetailPage(item.id)}
                                        />
                                        <h3
                                            className="product-name"
                                            onClick={() => goToDetailPage(item.id)}
                                        >
                                            {item.name}
                                        </h3>
                                        <p className="product-category">{item.category?.name}</p>

                                        {/* Rating */}
                                        <div className="product-rating">
                                            <span className="stars">
                                                {"★".repeat(Math.round(rating.avgRating)) +
                                                    "☆".repeat(5 - Math.round(rating.avgRating))}
                                            </span>
                                            <span className="score">&nbsp;{rating.avgRating}</span>
                                        </div>

                                        <p className="product-price">${item.basePrice}</p>
                                        <button
                                            className="wishlist-button"
                                            onClick={() => handleAddWishlist(item.id)}
                                        >
                                            Add to Wishlist
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="product-empty-state">
                            <h4>No products found</h4>
                            <p>Try adjusting your filters or check back later for new arrivals.</p>
                        </div>
                    )}

                    {products.length > pageSize && (
                        <div className="product-pagination">
                            <Pagination
                                current={page}
                                pageSize={pageSize}
                                total={products.length}
                                onChange={(p) => {
                                    setPage(p);
                                    if (productSectionRef.current) {
                                        productSectionRef.current.scrollIntoView({ behavior: "smooth" });
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductPage;
