import { filterProducts, getAllProducts, getDetailProduct, getProductsPaginate, getCategory, getCart, postAddProductToCart, deleteProductInCart,  postHandleCartToCheckOut } from 'controllers/client/product-controller'
import express, { Express } from 'express'
import { verifyToken } from 'src/middleware/verifyToken'
const router = express.Router()

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

    //checkout
    router.post("/handle-cart-to-checkout", postHandleCartToCheckOut); //cập nhật giỏ hàng trước khi checkout.


    app.use("/api", router)


}

export default api