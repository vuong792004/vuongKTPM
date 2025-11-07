import { useEffect, useState, useRef } from "react";
import { message, Pagination, Slider } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./product.css";
import { filterProducts, getAllCategory, addToWishList } from "../../services/api.service";

const ProductPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const productSectionRef = useRef(null);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [subCategory, setSubCategory] = useState(searchParams.get("subCategory") || "");
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "");

    const [typingTimeout, setTypingTimeout] = useState(null);

    // Fetch categories
    useEffect(() => {
        getAllCategory()
            .then((res) => {
                const list = res?.data?.data || res?.data || [];
                if (Array.isArray(list)) setCategories(list);
            })
            .catch(() => setCategories([]));
    }, []);

    // Load products
    const loadProducts = (filters = {}, scroll = true) => {
        filterProducts(filters)
            .then((res) => {
                let list = [];
                if (res.data?.data) list = res.data.data;
                else if (Array.isArray(res.data)) list = res.data;

                list = list.filter((p) => p.status === true);
                setProducts(list);
            })
            .catch(() => setProducts([]));

        setPage(1);
        if (scroll && productSectionRef.current) {
            productSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Add to wishlist
    const handleAddWishlist = async (productId) => {
        try {
            const res = await addToWishList(productId);
            const { status, message: msg } = res.data;

            if (status === "success") message.success(msg);
            else if (status === "warning") message.warning(msg);
            else message.error(msg || "Có lỗi xảy ra");
        } catch {
            message.error("Lỗi hệ thống!");
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

    // Debounce search
    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
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
        }, 500);
        setTypingTimeout(timeout);
    }, [keyword]);

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

    return (
        <section className="product-section">
            <div className="product-section__header">
                <h3 className="product-section__title" ref={productSectionRef}>APPLE WORLD</h3>
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
                                <option key={c.category_id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Price Range */}
                    <div className="filter-group">
                        <label className="filter-group__label">Price range</label>
                        <Slider
                            range min={0} max={5000} step={50}
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
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
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
                            {paginatedProducts.map((item) => (
                                <div key={item.id} className="product-card">
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}/product/${item.image}`}
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

                                    {/* Rating temporarily hidden */}

                                    <p className="product-price">${item.basePrice}</p>
                                    <button className="wishlist-button"
                                        onClick={() => handleAddWishlist(item.id)}
                                    >
                                        Add to Wishlist
                                    </button>
                                </div>
                            ))}
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
