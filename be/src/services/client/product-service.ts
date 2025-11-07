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
                variant: {
                    include: {
                        product: true,
                        Inventory: true
                    },

                }
            }
        })
    }

    return [];

};


//add product
const addProductToCart = async (
    quantity: number,
    id_variant: number,
    user: Express.User
) => {
    // Lấy giỏ hàng
    let cart = await prisma.cart.findUnique({
        where: { user_id: user.id },
    });

    // Lấy variant + stock
    const variant = await prisma.productVariant.findUnique({
        where: { id: id_variant },
        include: { Inventory: true },
    });

    if (!variant) {
        return { success: false, message: "Variant not found" };
    }

    const stock = variant.Inventory?.[0]?.stock ?? 0;

    // Nếu chưa có giỏ → tạo mới
    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                user_id: user.id,
                sum: quantity,
                items: {
                    create: [
                        {
                            variant_id: variant.id,
                            price: variant.price,
                            quantity: quantity,
                        },
                    ],
                },
            },
        });

        return {
            success: true,
            message: "Added to cart successfully",
            currentQuantity: quantity,
            stock,
        };
    }

    // Nếu có giỏ hàng → tìm item
    const currentCartItem = await prisma.cartItem.findFirst({
        where: { cart_id: cart.id, variant_id: id_variant },
    });

    const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;
    const newQuantity = currentQuantity + quantity;

    //  Check vượt stock
    if (newQuantity > stock) {
        return {
            success: false,
            message: `Not enough stock. Only ${stock} available.`,
            currentQuantity,
            stock,
        };
    }

    // Update cart sum
    await prisma.cart.update({
        where: { id: cart.id },
        data: {
            sum: { increment: quantity },
        },
    });

    //  Update hoặc create item
    if (currentCartItem) {
        await prisma.cartItem.update({
            where: { item_id: currentCartItem.item_id },
            data: { quantity: newQuantity },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                price: variant.price,
                quantity: quantity,
                variant_id: id_variant,
                cart_id: cart.id,
            },
        });
    }

    return {
        success: true,
        message: "Added to cart successfully",
        currentQuantity: newQuantity,
        stock,
    };
};


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

//place order
const handlePlaceOrder = async (
    userId: number,
    receiverName: string,
    receiverAddress: string,
    receiverPhone: string,
    totalAmount: number,
    paymentMethod: string,
    items: { variantId: number; quantity: number; price: number }[]
) => {
    if (!items || items.length === 0) {
        return { success: false, message: "No items selected for checkout" };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Kiểm tra tồn kho trước
            for (const i of items) {
                const inventory = await tx.inventory.findFirst({
                    where: { product_variant_id: i.variantId },
                    include: { variant: { include: { product: true } } },
                });

                if (!inventory) {
                    throw new Error(`Inventory not found for variant ${i.variantId}`);
                }

                if (inventory.stock < i.quantity) {
                    throw new Error(
                        `Product ${inventory.variant.product.name} (${inventory.variant.color} ${inventory.variant.storage}) is out of stock. Only ${inventory.stock} left.`
                    );
                }
            }

            //  Nếu đủ stock → tạo order
            await tx.order.create({
                data: {
                    user_id: userId,
                    total_amount: totalAmount,
                    status: "PENDING",
                    paymentMethod,
                    paymentStatus: "PAYMENT_UNPAID",
                    receiverName,
                    receiverAddress,
                    receiverPhone,
                    items: {
                        create: items.map(i => ({
                            variant_id: i.variantId,
                            quantity: i.quantity,
                            price: i.price,
                        })),
                    },
                },
            });

            // Trừ kho + ghi log
            for (const i of items) {
                const inventory = await tx.inventory.findFirst({
                    where: { product_variant_id: i.variantId },
                });

                if (inventory) {
                    await tx.inventory.update({
                        where: { id: inventory.id },
                        data: {
                            stock: { decrement: i.quantity },
                            sold: { increment: i.quantity },
                        },
                    });

                    await tx.inventoryLog.create({
                        data: {
                            product_variant_id: i.variantId,
                            action_type: "ORDER",
                            quantity: i.quantity,
                            note: "Stock decreased after order placement",
                            created_by: userId,
                        },
                    });
                }
            }

            // Xoá các cartItem liên quan
            await tx.cartItem.deleteMany({
                where: {
                    cart: { user_id: userId },
                    variant_id: { in: items.map(i => i.variantId) },
                },
            });
        });

        return { success: true, message: "Order placed successfully" };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to place order" };
    }
};

//order history
const listOrdersByUserId = async (userId: number) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                user_id: userId
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
        });
        if (!orders || orders.length === 0) {
            return []
        }
        return orders;
    } catch (error: any) {
        throw new Error("Có lỗi xảy ra khi lấy lịch sử đặt hàng");
    }
};

//hủy đơn hàng
const cancelOrderByUserId = async (userId: number, orderId: number) => {
    try {
        return await prisma.$transaction(async (tx) => {
            //ktra có đơn hàng hay kh 
            const order = await prisma.order.findFirst({
                where: {
                    order_id: orderId,
                    user_id: userId,
                    status: "PENDING" //chỉ hủy đơn hàng đang chờ xử lý
                },
                include: {
                    items: true
                }
            })

            if (!order) throw new Error("Order not found or order cannot be cancelled");

            //Cập nhật lại stock cho từng variant
            for (const item of order.items) {
                await tx.inventory.updateMany({
                    where: { product_variant_id: item.variant_id },
                    data: {
                        stock: { increment: item.quantity },
                        sold: { decrement: item.quantity },
                    },
                });


                // log vào inventoryLog
                await tx.inventoryLog.create({
                    data: {
                        product_variant_id: item.variant_id,
                        action_type: "CANCEL_ORDER",
                        quantity: item.quantity,
                        note: `Hoàn trả khi hủy đơn hàng #${orderId}`,
                        created_by: userId,
                    },
                });
            }
            //Cập nhật trạng thái đơn
            return await tx.order.update({
                where: { order_id: orderId },
                data: { status: "CANCELED" },
            });
        });

    } catch (error: any) {
        throw new Error("Có lỗi xảy ra khi hủy đơn hàng");
    }

}

export {
    countTotalProductClientPages, fetchProductsPaginated, fetchAllProducts, getProductById, getAllCategory
    , getProductInCart, addProductToCart, handleDeleteProductInCart, updateCartDetailBeforeCheckout, handlePlaceOrder,
    listOrdersByUserId, cancelOrderByUserId
}