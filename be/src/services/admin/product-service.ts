import { prisma } from "config/client";


const handleCreateProduct = async (
    name: string,
    basePrice: string,
    description: string,
    category_id: string,
    productImg: string,
    userId: number, // để ghi log
    variants: {
        color: string;
        storage?: string;
        price: number;
        stock: number;
    }[]
) => {
    return await prisma.product.create({
        data: {
            name: name,
            basePrice: +basePrice,
            description: description,
            image: productImg,
            category: {
                connect: { category_id: +category_id },
            },
            variants: {
                create: variants.map((v) => ({
                    color: v.color,
                    storage: v.storage,
                    price: v.price,
                    // khi tạo variant thì tạo luôn inventory + log
                    Inventory: {
                        create: {
                            stock: v.stock,
                            sold: 0,
                        },
                    },
                    InventoryLog: {
                        create: {
                            action_type: "IMPORT",
                            quantity: v.stock,
                            note: "Initial stock when creating product",
                            created_by: userId,
                        },
                    },
                })),
            },
        },
        include: {
            variants: {
                include: {
                    Inventory: true,
                    InventoryLog: true,
                },
            },
        },
    });
};



const handleHideProduct = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id: +id },
    });
    if (!product) throw new Error("Product not found");

    return await prisma.product.update({
        where: { id: +id },
        data: { status: !product.status },
    });
};


const handleUpdateProduct = async (
    id: string,
    name: string,
    basePrice: string,
    description: string,
    category_id: string,
    productImg: string | undefined,
    userId: number,
    status: string,
    variants: {
        id?: number;
        color: string;
        storage?: string;
        price: number;
        stock: number;
        status: boolean; // true = Visible, false = Hidden
    }[]
) => {
    // Lấy product cũ
    const oldProduct = await prisma.product.findUnique({
        where: { id: +id },
        include: {
            variants: { include: { Inventory: true } },
        },
    });

    if (!oldProduct) throw new Error("Product not found");

    // Update product info (có cả status)
    await prisma.product.update({
        where: { id: +id },
        data: {
            name,
            basePrice: +basePrice,
            description,
            image: productImg ?? oldProduct.image,
            category: { connect: { category_id: +category_id } },
            status: status as any,
        },
    });

    // Xử lý variants
    for (const v of variants) {
        if (v.id) {
            // variant cũ
            const oldVariant = oldProduct.variants.find((ov) => ov.id === v.id);
            const oldStock = oldVariant?.Inventory?.[0]?.stock ?? 0;

            await prisma.productVariant.update({
                where: { id: v.id },
                data: {
                    color: v.color,
                    storage: v.storage,
                    price: v.price,
                    status: v.status, //update status variant
                    Inventory: {
                        updateMany: {
                            where: { product_variant_id: v.id },
                            data: { stock: v.stock },
                        },
                    },
                },
            });

            if (oldStock !== v.stock) {
                await prisma.inventoryLog.create({
                    data: {
                        product_variant_id: v.id,
                        action_type: "ADJUST",
                        quantity: v.stock - oldStock,
                        note: "Stock adjusted when updating product",
                        created_by: userId,
                    },
                });
            }
        } else {
            // variant mới
            await prisma.productVariant.create({
                data: {
                    product_id: +id,
                    color: v.color,
                    storage: v.storage,
                    price: v.price,
                    status: v.status, //set status cho variant mới
                    Inventory: { create: { stock: v.stock, sold: 0 } },
                    InventoryLog: {
                        create: {
                            action_type: "IMPORT",
                            quantity: v.stock,
                            note: "New variant added",
                            created_by: userId,
                        },
                    },
                },
            });
        }
    }

    // Trả lại product sau khi update
    return await prisma.product.findUnique({
        where: { id: +id },
        include: {
            variants: {
                include: { Inventory: true, InventoryLog: true },
            },
        },
    });
};


//variant
const handleHideVariant = async (id: string) => {
    const variant = await prisma.productVariant.findUnique({
        where: { id: +id },
        include: { Inventory: true },
    });

    if (!variant) throw new Error("Variant not found");

    const newStatus = !variant.status;

    return await prisma.productVariant.update({
        where: { id: +id },
        data: {
            status: newStatus,
        },
    });
};


export {
    handleCreateProduct, handleUpdateProduct, handleHideProduct,handleHideVariant
}