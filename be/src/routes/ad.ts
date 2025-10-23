import { getUsers, disabledUser, postUpdateUser } from 'controllers/admin/user-controller'
import express, { Express } from 'express'
import fileUploadMiddleware from 'src/middleware/multer'
import { verifyToken } from 'src/middleware/verifyToken'
import { getOrders, updateStatusOrder } from 'controllers/admin/order-controller'
import { getInventory, postCreateProduct, postHideProduct, postHideVariant, postUpdateProduct } from 'controllers/admin/product-controller'

const router = express.Router()

const webRoutes = (app: Express) => {

    //user
    router.get("/admin/users", verifyToken, getUsers)
    router.put("/admin/disabled-users/:id", verifyToken, disabledUser)
    router.put("/admin/users/:userId", fileUploadMiddleware("avatar", "avatar"), verifyToken, postUpdateUser)

    //order
    router.get("/admin/orders", verifyToken, getOrders)
    router.put("/admin/orders/:orderId", verifyToken, updateStatusOrder)

    //product
    router.post("/admin/products", fileUploadMiddleware("productImg", "product"), verifyToken, postCreateProduct)
    router.put("/admin/products/:id", fileUploadMiddleware("productImg", "product"), verifyToken, postUpdateProduct)
    router.put("/admin/hide-product/:id", verifyToken, postHideProduct)

    //variants
    router.put("/admin/hide-variant/:id", verifyToken, postHideVariant)

     //inventory
    router.get("/admin/inventory", verifyToken, getInventory)


    app.use("/", router)
}

export default webRoutes
