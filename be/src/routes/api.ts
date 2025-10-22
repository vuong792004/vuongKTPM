import { getAllProducts, getProductsPaginate } from 'controllers/client/product-controller'
import express, { Express } from 'express'
const router = express.Router()

const api = (app: Express) => {

    //product
    router.get("/products", getAllProducts)
    router.get("/product", getProductsPaginate)



    app.use("/api", router)
        

}

export default api