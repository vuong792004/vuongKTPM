import { filterProducts, getAllProducts, getDetailProduct, getProductsPaginate, getCategory, getCart, postAddProductToCart, deleteProductInCart, postHandleCartToCheckOut, getCheckOutPage, postPlaceOrder, getCartCount, postAddToCartFromDetailPage, getOrderHistory, putCancelOrder } from 'controllers/client/product-controller'
import { deleteAllWishlist, deleteWishlist, getWishlist, postUpdateProfile, postWishlist } from 'controllers/client/user-controller'

import express, { Express } from 'express'
import { verifyToken } from 'src/middleware/verifyToken'
const router = express.Router()
import fileUploadMiddleware from 'src/middleware/multer'

const api = (app: Express) => {

    //product
    router.get("/products", getAllProducts)
    router.get("/product", getProductsPaginate)
    router.get("/product/:id", getDetailProduct)
    router.get("/products/filter", filterProducts)
    router.get("/category", getCategory)


    //cart
    router.get("/cart", verifyToken, getCart)
    router.post("/add-product/:id", verifyToken, postAddProductToCart)
    router.delete("/delete-product/:id", verifyToken, deleteProductInCart)
    router.get("/count-cart", verifyToken, getCartCount)
    router.post("/add-to-cart-from-detail-page/:id", verifyToken, postAddToCartFromDetailPage)


    //checkout
    router.post("/handle-cart-to-checkout", verifyToken, postHandleCartToCheckOut); //cập nhật giỏ hàng trước khi checkout
    router.get("/checkout", verifyToken, getCheckOutPage); //lấy thông tin giỏ hàng của user chuẩn bị thanh toán
    router.post("/place-order", verifyToken, postPlaceOrder); // thực hiện đặt hàng

    //order
    router.get("/order-history", verifyToken, getOrderHistory);
    router.put("/cancel-order/:orderId", verifyToken, putCancelOrder);

    //user
    router.put(
        "/profile",
        verifyToken,
        fileUploadMiddleware("avatar", "avatar"), // field name = "avatar", lưu vào public/avatar
        postUpdateProfile
    );

     //wishlist 
    router.get("/wishlist", verifyToken, getWishlist);
    router.post("/wishlist/:productId", verifyToken, postWishlist);
    router.delete("/wishlist/:productId", verifyToken, deleteWishlist);
    router.delete("/wishlist", verifyToken, deleteAllWishlist);


    app.use("/api", router)


}

export default api