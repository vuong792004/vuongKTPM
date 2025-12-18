
import { prisma } from 'config/client'
import { Response, Request } from 'express'
import { getAllOrder,handleUpdateStatusOrder} from 'services/admin/order-service'

const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await getAllOrder();
        res.status(200).json({
            message: "Lấy danh sách tất cả order thành công",
            data: orders,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy tất cả order",
            error: err.message,
        });
    }
}

const updateStatusOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const status = req.body.status;
        const orders = await handleUpdateStatusOrder(status, +orderId);
        res.status(200).json({
            message: "Cập nhật trạng thái đơn hàng thành công",
            data: orders,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng",
            error: err.message,
        });
    }
}

export {
    getOrders,updateStatusOrder
}