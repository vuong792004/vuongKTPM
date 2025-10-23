import { getUsers,disabledUser,postUpdateUser } from 'controllers/admin/user-controller' 
import express, { Express } from 'express'
import fileUploadMiddleware from 'src/middleware/multer'
import { verifyToken } from 'src/middleware/verifyToken'
import { getOrders} from 'controllers/admin/order-controller' 

const router = express.Router()

const webRoutes = (app: Express) => {

    //user
    router.get("/admin/users", verifyToken, getUsers)
    router.put("/admin/disabled-users/:id", verifyToken, disabledUser)
    router.put("/admin/users/:userId", fileUploadMiddleware("avatar", "avatar"), verifyToken, postUpdateUser)

    //order
    router.get("/admin/orders", verifyToken, getOrders)

    app.use("/", router)
}

export default webRoutes
