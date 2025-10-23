import { Role, UserStatus } from "@prisma/client";
import { prisma } from "config/client";
import { TOTAL_ITEMS_PER_PAGE } from "config/constant";

const getAllUser = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            created_at: true,
            address: true,
            avatar: true
        },
    });
};


const handleDisabledUser = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    })

    if (!user) throw new Error("User not found");

    const newStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    return await prisma.user.update({
        where: {
            id
        },
        data: {
            status: newStatus
        }
    })

}



export { getAllUser ,handleDisabledUser}