
import { prisma } from 'config/client'
import { Response, Request } from 'express'
import { getAllUser ,handleDisabledUser,handleUpdateUser} from 'services/admin/user-service'



const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllUser();
        res.status(200).json({
            message: "Lấy danh sách tất cả user thành công",
            data: users,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy tất cả user",
            error: err.message,
        });
    }
}

const disabledUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const users = await handleDisabledUser(+id);
        res.status(200).json({
            message: "Vô hiệu hóa user thành công",
            data: users,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi vô hiệu hóa user",
            error: err.message,
        });
    }
}

const postUpdateUser = async (req: Request, res: Response) => {
   try {
          const userId = req.params.userId
          const { name, email, address, phone, role, status } = req.body;
          const file = req.file;
          const userImg = file?.filename ?? undefined;
  
        
          const updateUser = await handleUpdateUser(
             +userId, name, email, address, phone, role, status,userImg)
  
          return res.status(201).json({
              message: "User updated successfully",
              data: updateUser,
          });
      } catch (error: any) {
          console.error("Error updating user:", error);
          return res.status(500).json({
              message: "Failed to update user",
              error: error.message,
          });
      }
  
  
}

export {
    getUsers,disabledUser,postUpdateUser
}