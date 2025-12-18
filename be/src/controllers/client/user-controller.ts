import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from 'config/client'
import { fetchWishList, handleDeleteAllWishlist, handleDeleteWishlist, handleGetReview, handlePostWishlist } from "services/client/user-service";

const postUpdateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    const updateData: any = { name, phone, address };

    if (req.file) {
      updateData.avatar = req.file.filename; // lưu filename vào DB
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: err.message,
    });
  }
};

//wishlist
const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id
    const data = await fetchWishList(+userId);
    res.status(200).json({
      message: "Lấy danh sách sản phẩm yêu thích thành công",
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy sản phẩm yêu thích ",
      error: err.message,
    });
  }
}

const postWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const productId = +req.params.productId;
    const result = await handlePostWishlist(userId, productId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }
};

const deleteWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id
    const productId = req.params.productId
    const products = await handleDeleteWishlist(+userId, +productId);
    res.status(200).json({
      message: "Xóa sản phẩm khỏi danh sách yêu thích thành công",
      data: products,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi xóa sản phẩm khỏi danh sách yêu thích",
      error: err.message,
    });
  }
}

const deleteAllWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id
    const products = await handleDeleteAllWishlist(+userId);
    res.status(200).json({
      message: "Xóa tất cả sản phẩm khỏi danh sách yêu thích thành công",
      data: products,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi xóa tất cả sản phẩm khỏi danh sách yêu thích",
      error: err.message,
    });
  }
}

//------------------------------------REVIEW----------------------------------------------

const postReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1 to 5" });
    }

    const reviewData = await prisma.review.create({
      data: {
        user_id: userId,
        product_id: +productId,
        rating: +rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      reviewData
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = await handleGetReview(+id)
    return res.status(200).json({
      success: true,
      message: "Lấy đánh giá của sản phẩm thành công",
      data
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export {
  postUpdateProfile, getWishlist, postWishlist, deleteWishlist, deleteAllWishlist, postReview, getReview
}