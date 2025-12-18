import { getInventory } from "controllers/admin/product-controller";
import { prisma } from "config/client";

// Mock Prisma
jest.mock("config/client", () => ({
    prisma: {
        product: {
            findMany: jest.fn(),
        },
    },
}));

describe("ADMIN PRODUCT CONTROLLER - GET INVENTORY (UNIT TEST)", () => {

    beforeAll(() => {
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // SUCCESS CASE
    it("should fetch inventory successfully", async () => {
        const mockProducts = [
            {
                id: 1,
                name: "iPhone 15",
                category: { id: 1, name: "iPhone" },
                variants: [
                    {
                        Inventory: [{ stock: 10, sold: 0 }],
                        InventoryLog: [
                            {
                                action_type: "IMPORT",
                                quantity: 10,
                                user: {
                                    id: 1,
                                    name: "Admin",
                                    email: "admin@test.com",
                                },
                            },
                        ],
                    },
                ],
            },
        ];

        (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

        const req: any = {};

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getInventory(req, res);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            include: {
                category: true,
                variants: {
                    include: {
                        Inventory: true,
                        InventoryLog: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Inventory fetched successfully",
            data: mockProducts,
        });
    });

    // ERROR CASE
    it("should return 500 when prisma throws error", async () => {
        (prisma.product.findMany as jest.Mock).mockRejectedValue(
            new Error("DB error")
        );

        const req: any = {};

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getInventory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Failed to fetch inventory",
            error: "DB error",
        });
    });
});
