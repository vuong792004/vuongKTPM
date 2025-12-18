import { prisma } from "config/client"


//wishlist
const fetchWishList = async (userId: number) => {

    return await prisma.wishlist.findMany({
        where: {
            user_id: userId
        },
        include: {
            product: {
                include: {
                    category: true
                }
            }
        }
    })

}

const handlePostWishlist = async (userId: number, productId: number) => {
    const isExistProduct = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!isExistProduct) {
        return { status: "warning", message: "Product does not exist" };
    }

    const isExist = await prisma.wishlist.findFirst({
        where: { user_id: userId, product_id: productId }
    });

    if (isExist) {
        return { status: "warning", message: "Product is already in your wishlist" };
    }

    const newItem = await prisma.wishlist.create({
        data: { user_id: userId, product_id: productId }
    });

    return { status: "success", message: "Product has been added to your wishlist successfully" };

};

const handleDeleteWishlist = async (userId: number, productId: number) => {

    const isExist = await prisma.wishlist.findFirst({
        where: {
            user_id: userId,
            product_id: productId
        }
    })
    if (!isExist) {
        throw new Error("Sản phẩm không tồn tại trong danh sách yêu thích");
    }

    return prisma.wishlist.deleteMany({
        where: {
            user_id: userId,
            product_id: productId
        }
    })
}

const handleDeleteAllWishlist = async (userId: number) => {

    return await prisma.wishlist.deleteMany({
        where: {
            user_id: userId
        }
    })
}

const handleGetReview = async (productId: number) => {
    try {
        return await prisma.review.findMany({
            where: {
                product_id: productId
            },
            include: {
                user: true
            }
        })
    }

    catch (error: any) {
        throw new Error("Có lỗi xảy ra khi lấy đánh giá sản phẩm");
    }
};
export {
    fetchWishList,handlePostWishlist,handleDeleteWishlist,handleDeleteAllWishlist,handleGetReview
}
