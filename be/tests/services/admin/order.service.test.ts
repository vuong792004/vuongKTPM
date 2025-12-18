
import { OrderStatus } from "@prisma/client";
import { prisma } from "config/client";
import { getAllOrder, handleUpdateStatusOrder } from "services/admin/order-service";

jest.mock("config/client", () => ({
    prisma: {
        order: {
            findMany: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe("ADMIN ORDER SERVICE - UNIT TEST", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // GET ALL ORDERS (ADMIN)
    it("should get all orders with user info", async () => {
        const mockOrders = [
            {
                order_id: 1,
                status: OrderStatus.PENDING,
                user: { id: 1, email: "admin@test.com" },
            },
        ];

        (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

        const result = await getAllOrder();

        expect(prisma.order.findMany).toHaveBeenCalledWith({
            include: { user: true },
        });

        expect(result).toEqual(mockOrders);
    });

    // UPDATE ORDER STATUS (ADMIN)
    it("should update order status to COMPLETE", async () => {
        const updatedOrder = {
            order_id: 1,
            status: OrderStatus.COMPLETE,
        };

        (prisma.order.update as jest.Mock).mockResolvedValue(updatedOrder);

        const result = await handleUpdateStatusOrder(
            OrderStatus.COMPLETE,
            1
        );

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { order_id: 1 },
            data: { status: OrderStatus.COMPLETE },
        });

        expect(result).toEqual(updatedOrder);
    });

    it("should throw error when order does not exist", async () => {
        (prisma.order.update as jest.Mock).mockRejectedValue(
            new Error("Order not found")
        );

        await expect(
            handleUpdateStatusOrder(OrderStatus.CANCELED, 999)
        ).rejects.toThrow("Order not found");
    });
});
