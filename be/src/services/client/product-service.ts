import { prisma } from "config/client";




const fetchAllProducts = async (page: number = 1, pageSize: number = 50) => {
    return await prisma.product.findMany({


        include: {
            category: {
                select: {
                    name: true,
                },
            },
            variants: {
                include: {
                    Inventory: {
                        select: {
                            sold: true,
                            stock: true
                        }
                    }
                }
            }
        },
    });
};

//phân trang
//tính số trang cần hiện ra 
const countTotalProductClientPages = async (pageSize: number) => {
    const totalItems = await prisma.product.count()
    const totalPages = Math.ceil(totalItems / pageSize);
    return totalPages
};

const fetchProductsPaginated = async (page: number = 1, pageSize: number = 50) => {
    return await prisma.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
            status: true,
        },
        include: {
            category: {
                select: {
                    name: true,
                },
            },
        },
    });
};
const getProductById = async (id: string) => {
    return await prisma.product.findUnique({
        where: {
            id: +id,
            status: true,
        },
        include: {
            category: {
                select: {
                    name: true,
                },
            },
            variants: {
                where: { status: true },
                include: {
                    Inventory: true
                }
            }

        }
    })
};


//category
const getAllCategory = async () => {
    return await prisma.category.findMany()
};

//cart
const getProductInCart = async (id: number) => {
    const cart = await prisma.cart.findUnique({ where: { user_id: id } })
    if (cart) {
        return await prisma.cartItem.findMany({
            where: {
                cart_id: cart.id
            },
            include: {
                variant: true
            }
        })
    }

    return [];

};

//add product
const addProductToCart = async (quantity: number, id_variant: number, user: Express.User) => {
    const cart = await prisma.cart.findUnique({ where: { user_id: user.id } })

    const variant = await prisma.productVariant.findUnique({ where: { id: id_variant } })


    //    nếu đã có giỏ hàng
    //      -> cập nhật giỏ hàng
    //      -> cập nhật chi tiết giỏ hàng -> nếu chưa có, tạo mới.có rồi, cập nhật quantity -> update + insert

    if (cart) {
        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                sum: {
                    increment: quantity,
                }
            }
        })

        const currentCartItem = await prisma.cartItem.findFirst({
            where: {
                cart_id: cart.id,
                variant_id: id_variant
            }
        })

        await prisma.cartItem.upsert({
            where: {
                item_id: currentCartItem?.item_id ?? 0
            },
            update: {
                quantity: {
                    increment: quantity
                }
            },
            create: {
                price: variant.price,
                quantity: quantity,
                variant_id: id_variant,
                cart_id: cart.id
            }
        })
    }
    else {
        // nếu chưa có giỏ hàng
        //    -> tạo mới giỏ hàng
        //    -> tạo mới chi tiết giỏ hàng

        await prisma.cart.create({
            data: {
                user_id: user.id,
                sum: quantity,
                items: {
                    create: [
                        {
                            variant_id: variant.id,
                            price: variant.price,
                            quantity: quantity
                        }
                    ]
                }
            },

        })
    }
}

const handleDeleteProductInCart = async (cartItemId: string, sumCart: number, userId: number) => {

    //lấy quantity để trừ đi 
    const currentCartItem = await prisma.cartItem.findUnique({ where: { item_id: +cartItemId } })
    if (!currentCartItem) throw new Error("Không tìm thấy sản phẩm bạn muốn xóa trong giỏ hàng");

    const quantity = currentCartItem.quantity

    // lấy cart hiện tại theo userId
    const cart = await prisma.cart.findUnique({
        where: { user_id: userId }
    });
    if (!cart) throw new Error("Giỏ hàng không tồn tại");


    // xóa cart item
    await prisma.cartItem.delete({
        where: { item_id: +cartItemId }
    })

    //xóa cart 
    if (sumCart === 1) {
        //delete cart
        await prisma.cart.delete({ where: { id: cart.id } })
    } else {
        //update sum cart
        await prisma.cart.update({
            where: { user_id: userId },
            data: {
                sum: {
                    decrement: quantity
                }
            }
        })
    }

};

export {
    countTotalProductClientPages, fetchProductsPaginated, fetchAllProducts, getProductById, getAllCategory
    , getProductInCart, addProductToCart, handleDeleteProductInCart
}