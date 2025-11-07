import { useContext, useEffect, useState } from 'react';
import '../styles/profile.css';
import { AuthContext } from '../components/context/auth.context';
import dayjs from "dayjs";
import { deleteAllWishList, deleteWishList, getWishlist, updateUserProfile } from '../services/api.service';
import { Modal, message } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined, HeartFilled } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { Popconfirm } from "antd";

const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'update', label: 'Update Info' },
    { key: 'wishlist', label: 'Wishlist' },
];

const ProfilePage = () => {

    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const { user, setUser } = useContext(AuthContext);

    //wishlist
    const [wishlist, setWishlist] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    // update profile
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Đồng bộ formData & avatar preview khi user thay đổi
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                address: user.address || "",
            });

            if (user.avatar) {
                setPreview(`${import.meta.env.VITE_BACKEND_URL}/avatar/${user.avatar}`);
            } else {
                setPreview(null);
            }
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'wishlist') {
            setLoadingWishlist(true);
            getWishlist()
                .then(res => {
                    if (Array.isArray(res.data)) {
                        setWishlist(res.data);
                    } else if (res.data?.data) {
                        setWishlist(res.data.data);
                    } else {
                        setWishlist([]);
                    }
                })
                .catch(() => setWishlist([]))
                .finally(() => setLoadingWishlist(false));
        }
    }, [activeTab]);

    const year = dayjs(user.createdAt).year();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAvatarFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        Modal.confirm({
            title: "Confirm Update",
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            content: "Are you sure you want to update your profile information?",
            okText: "Yes, Update",
            cancelText: "No",
            onOk: async () => {
                try {
                    const data = new FormData();
                    data.append("name", formData.name);
                    data.append("phone", formData.phone);
                    data.append("address", formData.address);
                    if (avatarFile) data.append("avatar", avatarFile);

                    const res = await updateUserProfile(data);
                    if (res.data.success) {
                        message.success("Profile updated successfully!");
                        setUser(res.data.user); // cập nhật lại context
                        setActiveTab("overview");
                        setAvatarFile(null);
                    } else {
                        message.error(res.data.message || "Update failed!");
                    }
                } catch (err) {
                    console.error("Error updating profile:", err);
                    message.error("Something went wrong!");
                }
            }
        });
    };

    // Xoá 1 sản phẩm
    const handleRemove = async (id) => {
        try {
            await deleteWishList(id);
            setWishlist(prev => prev.filter(item => item.id !== id));
            message.success("Removed from wishlist!");
        } catch (err) {
            console.error("Error removing wishlist item:", err);
            message.error("Failed to remove product.");
        }
    };

    // Xoá toàn bộ
    const handleClearAll = async () => {
        try {
            await deleteAllWishList();
            setWishlist([]);
            message.success("All items removed from wishlist!");
        } catch (err) {
            console.error("Error clearing wishlist:", err);
            message.error("Failed to clear wishlist.");
        }
    };



    return (
        <div className="profile-page">
            <header className="profile-hero">
                {user.avatar ? (
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/avatar/${user.avatar}`}
                        alt={user.name}
                        className="profile-avatar"
                    />
                ) : (
                    <div className="profile-avatar-fallback">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div>
                    <h1>{user.name}</h1>
                    <p>Member since {year}</p>
                </div>
            </header>

            <div className="profile-layout">
                <aside className="profile-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </aside>

                <section className="profile-content">
                    {activeTab === 'overview' && (
                        <div className="profile-card">
                            <h2>Account information</h2>
                            <div className="profile-grid">
                                <div><span>Full name</span><strong>{user.name}</strong></div>
                                <div><span>Email</span><strong>{user.email}</strong></div>
                                <div><span>Phone</span><strong>{user.phone}</strong></div>
                                <div><span>Address</span>{user.address ? (
                                    <strong>{user.address}</strong>
                                ) : (
                                    <strong style={{ color: '#999' }}>No address</strong>
                                )}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'update' && (
                        <div className="profile-card">
                            <h2>Update Profile</h2>
                            <form className="profile-form" onSubmit={handleSubmit}>
                                <label>
                                    Full name
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Phone
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        inputMode="numeric"
                                        pattern="[0-9]{9,11}"
                                        placeholder="Enter phone (9-11 digits)"
                                    />
                                </label>
                                <label>
                                    Address
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </label>
                                <label>
                                    Avatar
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                {preview && (
                                    <img src={preview} alt="Preview" className="avatar-preview" />
                                )}

                                <button type="submit" className="profile-save">Save changes</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="profile-card">
                            <div className="wishlist-header">
                                <h2>My Wishlist</h2>
                                {wishlist.length > 0 && (
                                    <Popconfirm
                                        title="Delete all items"
                                        description="Are you sure you want to clear your wishlist?"
                                        okText="Yes"
                                        cancelText="No"
                                        onConfirm={handleClearAll}
                                        icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                                    >
                                        <button className="wishlist-clear-btn">
                                            <DeleteOutlined /> Delete All
                                        </button>
                                    </Popconfirm>
                                )}
                            </div>

                            {loadingWishlist ? (
                                <p>Loading...</p>
                            ) : wishlist.length > 0 ? (
                                <div className="wishlist-grid">
                                    {wishlist.map(item => (
                                        <div key={item.id} className="wishlist-item">
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL}/product/${item.product.image}`}
                                                alt={item.product.name}
                                                onClick={() => navigate(`/product/${item.product.id}`)}
                                                className="wishlist-image"
                                            />
                                            <div className="wishlist-info">
                                                <h4
                                                    className="wishlist-name"
                                                    onClick={() => navigate(`/product/${item.product.id}`)}
                                                >
                                                    {item.product.name}
                                                </h4>
                                                <p><span className="wishlist-label">Category:</span> {item.product.category?.name}</p>
                                                <p><span className="wishlist-label">Base Price:</span>
                                                    <span className="wishlist-price">${item.product.basePrice}</span>
                                                </p>
                                            </div>
                                            <Popconfirm
                                                title="Remove item"
                                                description="Are you sure you want to remove this product?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={() => handleRemove(item.id)}
                                                icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                                            >
                                                <button className="wishlist-remove-btn">
                                                    <HeartFilled style={{ color: "red" }} /> Remove
                                                </button>
                                            </Popconfirm>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "#999" }}>No items in wishlist.</p>
                            )}
                        </div>
                    )}



                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
