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

//update cart before checkout
const updateCartDetailBeforeCheckout = async (
    cartId: string,
    cartDetails: { item_id: string, quantity: string }[]
) => {

    //ktra giỏ hàng có tồn tại kh
    const cart = await prisma.cart.findUnique({ where: { id: +cartId } })
    if (!cart) {
        throw new Error("Giỏ hàng không tồn tại");
    }

    //get sum 
    let sum = 0

    //update quantity each product in cart
    for (let i = 0; i < cartDetails.length; i++) {
        const itemId = +cartDetails[i].item_id;
        const quantity = +cartDetails[i].quantity;

        // kiểm tra cartItem có thuộc về giỏ hàng này không
        const cartItem = await prisma.cartItem.findUnique({
            where: { item_id: itemId },
        });

        if (!cartItem || cartItem.cart_id !== +cartId) {
            throw new Error(`Sản phẩm với item_id=${itemId} không có trong giỏ hàng`);
        }

        //tính sum
        sum += quantity;

        await prisma.cartItem.update({
            where: { item_id: itemId },
            data: { quantity },
        });
    }

    //update sum cart
    await prisma.cart.update({
        where: {
            id: +cartId
        },
        data: {
            sum: sum
        }
    })
};



export {
    countTotalProductClientPages,fetchProductsPaginated,fetchAllProducts, getProductById,getAllCategory, updateCartDetailBeforeCheckout

}