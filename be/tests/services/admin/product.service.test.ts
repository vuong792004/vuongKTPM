
import { prisma } from "config/client";
import { handleCreateProduct, handleHideProduct, handleHideVariant } from "services/admin/product-service";

jest.mock("config/client", () => ({
    prisma: {
        product: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        productVariant: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        inventoryLog: {
            create: jest.fn(),
        },
    },
}));

describe("ADMIN PRODUCT SERVICE - UNIT TEST", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // CREATE PRODUCT
    it("should create product with variants and inventory", async () => {
        const mockProduct = { id: 1, name: "iPhone 15" };

        (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

        const result = await handleCreateProduct(
            "iPhone 15",
            "30000000",
            "New iPhone",
            "1",
            "img.png",
            1,
            [
                {
                    color: "Blue",
                    storage: "256GB",
                    price: 32000000,
                    stock: 10,
                },
            ]
        );

        expect(prisma.product.create).toHaveBeenCalled();
        expect(result).toEqual(mockProduct);
    });

    // HIDE PRODUCT
    it("should toggle product status", async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({
            id: 1,
            status: true,
        });

        (prisma.product.update as jest.Mock).mockResolvedValue({
            id: 1,
            status: false,
        });

        const result = await handleHideProduct("1");

        expect(prisma.product.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { status: false },
        });

        expect(result.status).toBe(false);
    });

    it("should throw error if product not found", async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(handleHideProduct("999"))
            .rejects.toThrow("Product not found");
    });

    // HIDE VARIANT
    it("should toggle variant status", async () => {
        (prisma.productVariant.findUnique as jest.Mock).mockResolvedValue({
            id: 1,
            status: true,
            Inventory: [],
        });

        (prisma.productVariant.update as jest.Mock).mockResolvedValue({
            id: 1,
            status: false,
        });

        const result = await handleHideVariant("1");

        expect(prisma.productVariant.update).toHaveBeenCalled();
        expect(result.status).toBe(false);
    });

    it("should throw error if variant not found", async () => {
        (prisma.productVariant.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(handleHideVariant("999"))
            .rejects.toThrow("Variant not found");
    });
});
