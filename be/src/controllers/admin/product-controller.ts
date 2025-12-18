
import { prisma } from 'config/client'
import { Response, Request } from 'express'
import { handleCreateProduct, handleHideProduct, handleHideVariant, handleUpdateProduct } from 'services/admin/product-service'


const postCreateProduct = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new Error("Unauthorized");

        const { name, basePrice, description, category_id } = req.body;
        if (!name || !basePrice || !category_id)
            throw new Error("Missing required fields");

        const variants = JSON.parse(req.body.variants || "[]");
        if (variants.length === 0)
            throw new Error("Variants are required");

        const productImg = req.file?.filename;

        const newProduct = await handleCreateProduct(
            name,
            basePrice,
            description,
            category_id,
            productImg,
            userId,
            variants
        );

        if (!newProduct) throw new Error("Create failed");

        return res.status(201).json({ data: newProduct });
    } catch (e) {
        return res.status(500).json({ message: e.message });
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

//inventory
const getInventory = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true, // nếu muốn lấy luôn category
                variants: {
                    include: {
                        Inventory: true,
                        InventoryLog: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Inventory fetched successfully",
            data: products,
        });
    } catch (error: any) {
        console.error("Error fetching inventory:", error);
        return res.status(500).json({
            message: "Failed to fetch inventory",
            error: error.message,
        });
    }
};


export {
    postCreateProduct, postUpdateProduct, postHideProduct, postHideVariant, getInventory
}