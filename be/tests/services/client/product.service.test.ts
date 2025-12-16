import {
    fetchAllProducts,
    countTotalProductClientPages,
    fetchProductsPaginated,
    getProductById,
    getAllCategory,
    getProductInCart,
    addProductToCart,
    handleDeleteProductInCart,
    updateCartDetailBeforeCheckout,
    handlePlaceOrder,
    listOrdersByUserId,
    cancelOrderByUserId,
} from "services/client/product-service";

import { prisma } from "config/client";

jest.mock("config/client", () => ({
    prisma: {
        product: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
        },
        category: {
            findMany: jest.fn(),
        },
        cart: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        cartItem: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        productVariant: {
            findUnique: jest.fn(),
        },
        order: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        inventory: {
            findFirst: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        inventoryLog: {
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

describe("CLIENT PRODUCT SERVICE - UNIT TEST", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // PRODUCT
    it("should fetch all products", async () => {
        (prisma.product.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
        const result = await fetchAllProducts();
        expect(result.length).toBe(1);
    });

    it("should count total product pages", async () => {
        (prisma.product.count as jest.Mock).mockResolvedValue(100);
        const pages = await countTotalProductClientPages(10);
        expect(pages).toBe(10);
    });

    it("should fetch paginated products", async () => {
        (prisma.product.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
        const result = await fetchProductsPaginated(1, 10);
        expect(result.length).toBe(1);
    });

    it("should get product by id", async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
        const result = await getProductById("1");
        expect(result?.id).toBe(1);
    });

    it("should get all categories", async () => {
        (prisma.category.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
        const result = await getAllCategory();
        expect(result.length).toBe(1);
    });

    // CART
    it("should return empty cart if user has no cart", async () => {
        (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null);
        const result = await getProductInCart(1);
        expect(result).toEqual([]);
    });

    it("should add product to cart (new cart)", async () => {
        (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.productVariant.findUnique as jest.Mock).mockResolvedValue({
            id: 1,
            price: 100,
            Inventory: [{ stock: 10 }],
        });
        (prisma.cart.create as jest.Mock).mockResolvedValue({ id: 1 });

        const result = await addProductToCart(1, 1, { id: 1 } as any);

        expect(result.success).toBe(true);
    });

    it("should delete product in cart", async () => {
        (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
            item_id: 1,
            quantity: 1,
        });
        (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

        await handleDeleteProductInCart("1", 1, 1);

        expect(prisma.cartItem.delete).toHaveBeenCalled();
    });

    it("should update cart before checkout", async () => {
        (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
        (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
            item_id: 1,
            cart_id: 1,
        });

        await updateCartDetailBeforeCheckout("1", [
            { item_id: "1", quantity: "2" },
        ]);

        expect(prisma.cartItem.update).toHaveBeenCalled();
    });

    // ORDER
    it("should place order successfully", async () => {
        (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
            await cb({
                inventory: {
                    findFirst: jest.fn().mockResolvedValue({ stock: 10 }),
                    update: jest.fn(),
                },
                order: { create: jest.fn() },
                inventoryLog: { create: jest.fn() },
                cartItem: { deleteMany: jest.fn() },
            });
        });

        const result = await handlePlaceOrder(
            1,
            "A",
            "B",
            "0123",
            100,
            "COD",
            [{ variantId: 1, quantity: 1, price: 100 }]
        );

        expect(result.success).toBe(true);
    });

    it("should list orders by user id", async () => {
        (prisma.order.findMany as jest.Mock).mockResolvedValue([{ order_id: 1 }]);
        const result = await listOrdersByUserId(1);
        expect(result.length).toBe(1);
    });

    it("should cancel order successfully", async () => {
        const mockOrder = {
            order_id: 1,
            status: "CANCELED",
        };

        (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
            return cb({
                inventory: { updateMany: jest.fn() },
                inventoryLog: { create: jest.fn() },
                order: {
                    update: jest.fn().mockResolvedValue(mockOrder),
                },
            });
        });

        (prisma.order.findFirst as jest.Mock).mockResolvedValue({
            order_id: 1,
            items: [{ variant_id: 1, quantity: 1 }],
        });

        const result = await cancelOrderByUserId(1, 1);

        expect(result).toEqual(mockOrder);
    });

});
