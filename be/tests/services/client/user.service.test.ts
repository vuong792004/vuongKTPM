import {
    fetchWishList,
    handlePostWishlist,
    handleDeleteWishlist,
    handleDeleteAllWishlist,
    handleGetReview,
} from "services/client/user-service";
import { prisma } from "config/client";

jest.mock("config/client", () => ({
    prisma: {
        wishlist: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
        review: {
            findMany: jest.fn(),
        },
    },
}));

describe("CLIENT USER SERVICE - UNIT TEST", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // FETCH WISHLIST
    it("should fetch wishlist by userId", async () => {
        const mockWishlist = [{ id: 1 }];

        (prisma.wishlist.findMany as jest.Mock).mockResolvedValue(mockWishlist);

        const result = await fetchWishList(1);

        expect(prisma.wishlist.findMany).toHaveBeenCalledWith({
            where: { user_id: 1 },
            include: {
                product: {
                    include: { category: true },
                },
            },
        });

        expect(result).toEqual(mockWishlist);
    });

    // ADD WISHLIST
    it("should add product to wishlist successfully", async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
        (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.wishlist.create as jest.Mock).mockResolvedValue({});

        const result = await handlePostWishlist(1, 1);

        expect(result.status).toBe("success");
    });

    it("should return warning if product does not exist", async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

        const result = await handlePostWishlist(1, 99);

        expect(result.status).toBe("warning");
    });

    it("should return warning if product already in wishlist", async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
        (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue({ id: 1 });

        const result = await handlePostWishlist(1, 1);

        expect(result.status).toBe("warning");
    });

    // DELETE WISHLIST
    it("should delete wishlist item", async () => {
        (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
        (prisma.wishlist.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

        const result = await handleDeleteWishlist(1, 1);

        expect(prisma.wishlist.deleteMany).toHaveBeenCalled();
        expect(result.count).toBe(1);
    });

    it("should throw error if wishlist item not found", async () => {
        (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(handleDeleteWishlist(1, 1))
            .rejects.toThrow("Sản phẩm không tồn tại trong danh sách yêu thích");
    });

    // DELETE ALL WISHLIST
    it("should delete all wishlist of user", async () => {
        (prisma.wishlist.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

        const result = await handleDeleteAllWishlist(1);

        expect(result.count).toBe(2);
    });

    // GET REVIEW
    it("should get reviews of product", async () => {
        const mockReviews = [{ id: 1 }];

        (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

        const result = await handleGetReview(1);

        expect(result).toEqual(mockReviews);
    });

    it("should throw error when prisma fails", async () => {
        (prisma.review.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));

        await expect(handleGetReview(1))
            .rejects.toThrow("Có lỗi xảy ra khi lấy đánh giá sản phẩm");
    });
});
