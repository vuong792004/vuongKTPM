// import axios from "axios";
import axios from './axios.customize';


//auth
const postLogin = (email, password) => {
    const URL_BACKEND = `/auth/login`;
    const data = { email, password }
    return axios.post(URL_BACKEND, data);
}
const getAccountAPI = () => {
    const token = localStorage.getItem("access_token");
    return axios.get("/auth/account", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};


const postRegister = (name, email, password, confirmPassword) => {
    const URL_BACKEND = `/auth/register`;
    const data = { name, email, password, confirmPassword }
    return axios.post(URL_BACKEND, data);
}

//cart 
const getCartCount = async () => {
    const token = localStorage.getItem("access_token");
    const URL_BACKEND = `/api/count-cart`;
    return axios.get(URL_BACKEND, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const getCart = async () => {
    const token = localStorage.getItem("access_token");
    const URL_BACKEND = `/api/cart`;
    return axios.get(URL_BACKEND, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const deleteProductFromCart = async (itemId) => {
    const token = localStorage.getItem("access_token");
    return axios.delete(`/api/delete-product/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

const updateCartQuantity = async (cartId, itemId, quantity) => {
    const token = localStorage.getItem("access_token");
    return axios.post(
        `/api/handle-cart-to-checkout`,
        {
            cart_id: cartId,
            cartDetails: [{ item_id: itemId, quantity }]
        },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
};


//product
const getAllCategory = () => {
    const URL_BACKEND = `/api/category`;
    return axios.get(URL_BACKEND);
}

const filterProducts = (filters) => {
    const URL_BACKEND = `/api/products/filter`;
    return axios.get(URL_BACKEND, { params: filters });
};

const getProductById = (id) => {
    const URL_BACKEND = `/api/product/${id}`;
    return axios.get(URL_BACKEND);
}


export {
    postLogin, getAccountAPI, getCartCount, postRegister, getAllCategory, filterProducts, getProductById,
    getCart, deleteProductFromCart, updateCartQuantity
}