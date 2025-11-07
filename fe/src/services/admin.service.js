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

//product
const getAllProduct = () => {
    const URL_BACKEND = `/api/products`;
    return axios.get(URL_BACKEND);
}



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



export {
    getAllUsers, getAllOrders, getAllProduct
}