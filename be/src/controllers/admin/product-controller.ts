
import { prisma } from 'config/client'
import { Response, Request } from 'express'
import { handleCreateProduct, handleHideProduct, handleHideVariant, handleUpdateProduct } from 'services/admin/product-service'


const postCreateProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as number;
        const { name, basePrice, description, category_id } = req.body;
        const file = req.file;
        const productImg = file?.filename ?? undefined;

        // Parse variants
        let variants = [];
        try {
            variants = JSON.parse(req.body.variants);
        } catch (e) {
            variants = [];
        }

        // variants FE gửi là array [{ color, storage, price, stock }]
        const newProduct = await handleCreateProduct(
            name,
            basePrice,
            description,
            category_id,
            productImg,
            userId,
            variants
        );

        return res.status(201).json({
            message: "Product created successfully",
            data: newProduct,
        });
    } catch (error: any) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            message: "Failed to create product",
            error: error.message,
        });
    }
};



const postHideProduct = async (req: Request, res: Response) => {
    const id = req.params.id
    try {
        const message = await handleHideProduct(id)
        return res.status(201).json({
            message: "Product updated successfully",
            data: message,
        });
    } catch (error: any) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            message: "Failed to update product",
            error: error.message,
        });
    }
}

const postUpdateProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as number;
        const id = req.params.id
        const { name, basePrice, description, category_id, status } = req.body;
        const file = req.file;
        const productImg = file?.filename ?? undefined;

        // Parse variants
        let variants = [];
        try {
            variants = JSON.parse(req.body.variants);
        } catch (e) {
            variants = [];
        }

        const updateProduct = await handleUpdateProduct(
            id, name, basePrice, description, category_id, productImg, userId,
            status, variants)

        return res.status(201).json({
            message: "Product updated successfully",
            data: updateProduct,
        });
    } catch (error: any) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            message: "Failed to update product",
            error: error.message,
        });
    }
}


//variants
const postHideVariant = async (req: Request, res: Response) => {
    const id = req.params.id
    try {
        const message = await handleHideVariant(id)
        return res.status(201).json({
            message: "Variant hidden successfully",
            data: message,
        });
    } catch (error: any) {
        console.error("Error hiding variant:", error);
        return res.status(500).json({
            message: "Failed to hide variant",
            error: error.message,
        });
    }
}
export {
    postCreateProduct, postUpdateProduct, postHideProduct,postHideVariant
}