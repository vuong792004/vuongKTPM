import { filterProducts, getAllProducts, getDetailProduct, getProductsPaginate,getCategory, postHandleCartToCheckOut } from 'controllers/client/product-controller'
import express, { Express } from 'express'
const router = express.Router()

const api = (app: Express) => {

    //product
    router.get("/products", getAllProducts)
    router.get("/product", getProductsPaginate)
    router.get("/product/:id", getDetailProduct)
    router.get("/products/filter", filterProducts)
    router.get("/category", getCategory)

    //checkout
    router.post("/handle-cart-to-checkout", postHandleCartToCheckOut); //cập nhật giỏ hàng trước khi checkout.

    app.use("/api", router)
        

}

export default api