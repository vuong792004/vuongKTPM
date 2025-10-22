
import { prisma } from 'config/client'
import { Response, Request } from 'express'
import { countTotalProductClientPages, fetchAllProducts, fetchProductsPaginated, getProductById,getAllCategory, updateCartDetailBeforeCheckout } from 'services/client/product-service';

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

const getDetailProduct = async (req: Request, res: Response) => {
    const id = req.params.id
    try {
        const product = await getProductById(id)
        res.status(200).json({
            message: "Lấy thông tin sản phẩm thành công",
            data: product,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin sản phẩm",
            error: err.message,
        });
    }
}

//category
const getCategory = async (req: Request, res: Response) => {
    try {
        const categories = await getAllCategory()
        res.status(200).json({
            message: "Lấy danh mục sản phẩm thành công",
            data: categories,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy danh mục sản phẩm",
            error: err.message,
        });
    }
}



//filter
const filterProducts = async (req: Request, res: Response) => {
    try {
        const { keyword, category, subCategory, minPrice, maxPrice, sort } = req.query;

        let where: any = {};

        if (keyword) {
            where.name = {
                contains: String(keyword).toLowerCase(),
            };
        }


        // filter theo category
        if (category) {
            where.category = {
                name: String(category).toUpperCase(), // giả sử category là MAC/IPHONE
            };
        }

        // filter theo subCategory
        if (subCategory) {
            where.subCategory = String(subCategory);
        }

        // filter theo khoảng giá (basePrice)
        if (minPrice || maxPrice) {
            where.basePrice = {};
            if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
            if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
        }

        // sắp xếp
        let orderBy: any = {};
        switch (sort) {
            case "priceAsc":
                orderBy = { basePrice: "asc" };
                break;
            case "priceDesc":
                orderBy = { basePrice: "desc" };
                break;
            case "newest":
                orderBy = { id: "desc" }; // hoặc createdAt nếu có
                break;
            case "oldest":
                orderBy = { id: "asc" };
                break;
            case "nameAsc":
                orderBy = { name: "asc" };
                break;
            case "nameDesc":
                orderBy = { name: "desc" };
                break;
            default:
                orderBy = { id: "desc" };
                break;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy,
            include: { variants: true, category: true },
        });

        res.json(products);
    } catch (err) {
        console.error("Filter products error:", err);
        res.status(500).json({ error: "Error filtering products" });
    }
};
//------------------------------------CHECKOUT----------------------------------------------
const postHandleCartToCheckOut = async (req: Request, res: Response) => {

    //đặt hàng truyền idCart , quantity , variantID
    const { cart_id, cartDetails } = req.body as {
        cart_id: string,
        cartDetails: { item_id: string, quantity: string }[]
    }
    try {

        await updateCartDetailBeforeCheckout(cart_id, cartDetails);
        res.status(200).json({
            success: true,
            message: "Cập nhật thông tin giỏ hàng thành công, chuẩn bị checkout",
        });

    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

}
export {
    getAllProducts, getProductsPaginate, getDetailProduct, filterProducts,getCategory, postHandleCartToCheckOut
}
