import { prisma } from "config/client";
import { postReview, postUpdateProfile } from "controllers/client/user-controller";

jest.mock("config/client", () => ({
    prisma: {
        user: { update: jest.fn() },
        review: { create: jest.fn() },
    },
}));

describe("CLIENT USER CONTROLLER - UNIT TEST", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // POST UPDATE PROFILE
    it("should update profile without avatar", async () => {
        const req: any = {
            user: { id: 1 },
            body: { name: "Test", phone: "0123", address: "HCM" },
        };

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        (prisma.user.update as jest.Mock).mockResolvedValue({ id: 1 });

        await postUpdateProfile(req, res);

        expect(prisma.user.update).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Profile updated successfully",
            user: { id: 1 },
        });
    });

    it("should update profile with avatar", async () => {
        const req: any = {
            user: { id: 1 },
            body: { name: "Test" },
            file: { filename: "avatar.png" },
        };

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        (prisma.user.update as jest.Mock).mockResolvedValue({ id: 1 });

        await postUpdateProfile(req, res);

        expect(prisma.user.update).toHaveBeenCalled();
    });

    it("should return 500 when update fails", async () => {
        const req: any = {
            user: { id: 1 },
            body: {},
        };

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB error"));

        await postUpdateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    // POST REVIEW
    it("should return 400 if rating invalid", async () => {
        const req: any = {
            user: { id: 1 },
            body: { productId: 1, rating: 6 },
        };

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await postReview(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should create review successfully", async () => {
        const req: any = {
            user: { id: 1 },
            body: { productId: 1, rating: 5, comment: "Good" },
        };

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        (prisma.review.create as jest.Mock).mockResolvedValue({ id: 1 });

        await postReview(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    it("should return 500 when prisma fails", async () => {
        const req: any = {
            user: { id: 1 },
            body: { productId: 1, rating: 5 },
        };

        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        (prisma.review.create as jest.Mock).mockRejectedValue(new Error("DB error"));

        await postReview(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
