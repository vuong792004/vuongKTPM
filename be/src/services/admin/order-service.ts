import { prisma } from "config/client";

const getAllOrder = async () => {
    return await prisma.order.findMany(
        { include: { user: true } }
    );
}

export { getAllOrder}