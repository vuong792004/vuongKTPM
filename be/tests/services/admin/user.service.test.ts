
import { prisma } from "config/client";
import { Role, UserStatus } from "@prisma/client";
import { getAllUser, handleDisabledUser, handleUpdateUser } from "services/admin/user-service";

jest.mock("config/client", () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe("ADMIN USER SERVICE - UNIT TEST", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // GET ALL USERS
    it("should return list of users", async () => {
        const mockUsers = [
            {
                id: 1,
                name: "Admin",
                email: "admin@gmail.com",
                role: Role.admin,
                status: UserStatus.ACTIVE,
            },
        ];

        (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

        const result = await getAllUser();

        expect(prisma.user.findMany).toHaveBeenCalled();
        expect(result).toEqual(mockUsers);
    });

    // DISABLE / ENABLE USER
    it("should disable active user", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 1,
            status: "ACTIVE",
        });

        (prisma.user.update as jest.Mock).mockResolvedValue({
            id: 1,
            status: "DISABLED",
        });

        const result = await handleDisabledUser(1);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { status: "DISABLED" },
        });

        expect(result.status).toBe("DISABLED");
    });

    it("should throw error if user not found (disable)", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(handleDisabledUser(999))
            .rejects.toThrow("User not found");
    });

    // UPDATE USER
    it("should update user info", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 1,
            avatar: "old.png",
        });

        const updatedUser = {
            id: 1,
            name: "New Name",
            email: "new@gmail.com",
        };

        (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

        const result = await handleUpdateUser(
            1,
            "New Name",
            "new@gmail.com",
            "HCM",
            "0123456789",
            Role.customer,
            UserStatus.ACTIVE,
            undefined
        );

        expect(prisma.user.update).toHaveBeenCalled();
        expect(result).toEqual(updatedUser);
    });

    it("should throw error if user not found (update)", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
            handleUpdateUser(
                999,
                "Name",
                "email@gmail.com",
                "HN",
                "0123",
                Role.customer,
                UserStatus.ACTIVE
            )
        ).rejects.toThrow("User not found");
    });
});
