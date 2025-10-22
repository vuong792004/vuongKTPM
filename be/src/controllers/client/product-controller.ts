
import { prisma } from 'config/client'
import { Response, Request } from 'express'
import { countTotalProductClientPages, fetchAllProducts, fetchProductsPaginated } from 'services/client/product-service';

const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await fetchAllProducts();
        res.status(200).json({
            message: "Lấy danh sách sản phẩm thành công",
            data: products,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy sản phẩm",
            error: err.message,
        });
    }
}


const getProductsPaginate = async (req: Request, res: Response) => {
    const { page, pageSize } = req.query
    let currentPage = page ? +page : 1
    if (currentPage <= 0) currentPage = 1;
    const totalProduct = await prisma.product.count();
    const totalPages = await countTotalProductClientPages(+pageSize);
    try {
        const products = await fetchProductsPaginated(+page, +pageSize);
        res.status(200).json({
            message: "Lấy danh sách sản phẩm thành công",
            meta: {
                totalPages,
                current: page,
                pageSize,
                totalProduct
            },
            data: products,

        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy sản phẩm",
            error: err.message,
        });
    }
}

export {
    getAllProducts, getProductsPaginate

}
