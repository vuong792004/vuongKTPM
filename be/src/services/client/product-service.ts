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

export {
    countTotalProductClientPages,fetchProductsPaginated,fetchAllProducts

}