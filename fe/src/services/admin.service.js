// import axios from "axios";
import axios from './axios.customize';

//user
const getAllUsers = () => {
    const URL_BACKEND = `/admin/users`;
    const token = localStorage.getItem("access_token");
    return axios.get(URL_BACKEND, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const disableUser = (id) => {
    const URL_BACKEND = `/admin/disabled-users/${id}`;
    const token = localStorage.getItem("access_token");
    return axios.put(URL_BACKEND, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
const updateUser = (userId, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("address", data.address);
    formData.append("phone", data.phone);
    formData.append("role", data.role);
    formData.append("status", data.status);

    if (data.avatar && data.avatar[0]) {
        formData.append("avatar", data.avatar[0].originFileObj);
    }//dùng formData axios sẽ tự thêm header "Content-Type": "multipart/form-data; boundary=..."


    const URL_BACKEND = `/admin/users/${userId}`;
    const token = localStorage.getItem("access_token");
    return axios.put(URL_BACKEND, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

//product
const getAllProduct = () => {
    const URL_BACKEND = `/api/products`;
    return axios.get(URL_BACKEND);
}

const createProduct = (data) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("basePrice", String(data.basePrice));
    formData.append("description", data.description || "");
    formData.append("category_id", String(data.category_id));

    if (data.productImg?.[0]?.originFileObj) {
        formData.append("productImg", data.productImg[0].originFileObj);
    }

    formData.append(
        "variants",
        JSON.stringify(
            Array.isArray(data.variants)
                ? data.variants.map(v => ({ ...v, status: Boolean(v.status) }))
                : []
        )
    );

    return axios.post("/admin/products", formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    });
};

const updateProduct = (id, data) => {

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("basePrice", data.basePrice);
    formData.append("description", data.description);
    formData.append("category_id", data.category_id);

    if (data.productImg && data.productImg[0]) {
        formData.append("productImg", data.productImg[0].originFileObj);
    }//dùng formData axios sẽ tự thêm header "Content-Type": "multipart/form-data; boundary=..."

    formData.append("variants", JSON.stringify(data.variants));

    const URL_BACKEND = `/admin/products/${id}`;
    const token = localStorage.getItem("access_token");
    return axios.put(URL_BACKEND, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const hideProduct = (id) => {
    const URL_BACKEND = `/admin/hide-product/${id}`;
    const token = localStorage.getItem("access_token");
    return axios.put(URL_BACKEND, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    );
};


//orders
const getAllOrders = () => {
    const URL_BACKEND = `/admin/orders`;
    const token = localStorage.getItem("access_token");
    return axios.get(URL_BACKEND, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const updateStatusOrder = (orderId, status) => {
    const URL_BACKEND = `/admin/orders/${orderId}`;
    const token = localStorage.getItem("access_token");
    return axios.put(URL_BACKEND, { status }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};


//inventory
const getAllInventory = () => {
    const URL_BACKEND = `/admin/inventory`;
    const token = localStorage.getItem("access_token");
    return axios.get(URL_BACKEND, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};




export {
    getAllUsers, getAllOrders, getAllProduct, createProduct, updateProduct, hideProduct, getAllInventory,
    updateStatusOrder, disableUser, updateUser
}