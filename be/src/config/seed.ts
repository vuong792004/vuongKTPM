import { prisma } from "config/client"
import { hashPassword } from "services/auth.service";


const initDatabase = async () => {

    const countUser = await prisma.user.count();
    const countCategory = await prisma.category.count();
    const countProduct = await prisma.product.count();
    if (countUser === 0) {
        const pwd = await hashPassword("123456")
        await prisma.user.createMany(
            {
                data: [
                    {
                        name: "admin",
                        password: pwd,
                        email: "admin@gmail.com",
                        role: "admin",
                        address: "123 Âu Cơ phường 14 quận 11",
                        phone: "0897868756",
                        status: "ACTIVE",
                    },
                    {
                        name: "test1",
                        password: pwd,
                        email: "test1@gmail.com",
                        address: "789 Lê Ngã quận Tân Phú",
                        phone: "0807868756",
                        avatar: "2b9bb986-a578-49ef-9462-53fa9bca6559.png",
                        status: "ACTIVE",

                    },
                    {
                        name: "test2",
                        password: pwd,
                        email: "test2@gmail.com",
                        address: "667 Thủ Đức",
                        phone: "0807869756",
                        status: "ACTIVE",

                    },
                    {
                        name: "test3",
                        password: pwd,
                        email: "test3@gmail.com",
                        address: "898 CMT8",
                        phone: "0807828756",
                        avatar: "3904186e-6cb9-41d4-bf28-66309ac23a74.png",
                        status: "DISABLED",

                    }
                ]
            }
        )
    }
    const adminUser = await prisma.user.findFirst({ where: { email: "admin@gmail.com" } });
    if (countCategory === 0) {

        await prisma.category.createMany(
            {
                data: [
                    {
                        name: "MAC",

                    },
                    {
                        name: "IPHONE",

                    },
                    {
                        name: "IPAD",


                    },
                    {
                        name: "AIRPODS",
                    }
                ]
            }
        )
    }
    if (countProduct === 0) {
        const mac = await prisma.category.findFirst({ where: { name: "MAC" } });
        const iphone = await prisma.category.findFirst({ where: { name: "IPHONE" } });
        const ipad = await prisma.category.findFirst({ where: { name: "IPAD" } });
        const airpods = await prisma.category.findFirst({ where: { name: "AIRPODS" } });

        // Mảng sản phẩm
        const productsData = [
            {
                name: "MacBook Air 2020",
                description: "MacBook Air 2020 với thiết kế mỏng nhẹ, hiệu năng mạnh mẽ nhờ chip Intel thế hệ 10, màn hình Retina sắc nét, bàn phím Magic Keyboard cải tiến và thời lượng pin lên đến 12 giờ. Hoàn hảo cho công việc văn phòng, học tập và giải trí di động.",
                basePrice: 999,
                image: "58d24504-d241-4fde-96ec-ca685673f696.jpeg",
                category_id: mac!.category_id,
                variants: [
                    { color: "Silver", storage: "256GB", price: 999, stock: 20 },
                    { color: "Space Gray", storage: "512GB", price: 1199, stock: 15 }
                ],
                subCategory: "MacBookAir"
            },
            {
                name: "Macbook Pro 2023",
                description: "MacBook Pro 2023 với chip Apple M2 Pro/M2 Max mạnh mẽ, màn hình Liquid Retina XDR sáng và sắc nét, thiết kế mỏng nhẹ nhưng bền bỉ, hỗ trợ nhiều cổng kết nối Thunderbolt và HDMI, bàn phím Magic Keyboard cải tiến, thời lượng pin lâu dài. Lý tưởng cho các nhà sáng tạo nội dung, lập trình viên và công việc đòi hỏi hiệu năng cao.",
                basePrice: 1299,
                image: "15918b9f-7a45-4eb4-ba09-07fb5945ee1a.jpeg",
                category_id: mac!.category_id,
                variants: [
                    { color: "Silver", storage: "512GB", price: 1299, stock: 10 },
                    { color: "Space Gray", storage: "1TB", price: 1599, stock: 8 }
                ],
                subCategory: "MacBookPro"
            },
            {
                name: "iMac 24 M1",
                description: "iMac 24 inch M1 với thiết kế siêu mỏng, màu sắc trẻ trung và sống động. Trang bị chip Apple M1 mạnh mẽ, chạy mượt macOS, hiệu năng đồ họa vượt trội, phù hợp cho cả công việc và giải trí đa phương tiện.",
                basePrice: 1299,
                image: "7bfe0fa1-55f7-440a-94fd-a55518845258.jpg",
                category_id: mac!.category_id,
                variants: [
                    { color: "Blue", storage: "256GB", price: 1299, stock: 12 },
                    { color: "Pink", storage: "512GB", price: 1499, stock: 10 }
                ],
                subCategory: "imac"
            },

            {
                name: "Mac Mini M2",
                description: "Mac Mini M2 nhỏ gọn nhưng mạnh mẽ với chip Apple M2, hiệu năng vượt trội cho công việc hàng ngày và các tác vụ chuyên sâu. Hỗ trợ kết nối đa dạng, đồ họa nâng cao, chạy mượt macOS với tốc độ phản hồi nhanh và tiêu thụ điện năng tối ưu.",
                basePrice: 699,
                image: "0b14cc32-1735-4833-b980-2f80ee647b82.jpg",
                category_id: mac!.category_id,
                variants: [
                    { color: "Silver", storage: "256GB", price: 699, stock: 25 },
                    { color: "Silver", storage: "512GB", price: 899, stock: 18 }
                ],
                subCategory: "MacMini"

            },
            {
                name: "iPhone 14",
                description: "iPhone 14 với màn hình Super Retina XDR, camera kép 12MP hỗ trợ chụp ảnh và quay video chất lượng cao, chip A15 Bionic mạnh mẽ, hiệu năng ổn định cho mọi tác vụ. Hỗ trợ Face ID, pin lâu dài, khả năng chống nước IP68 và các tính năng an toàn như SOS khẩn cấp qua vệ tinh.",
                basePrice: 799,
                image: "6b1b2390-01ff-49f4-9b82-dc4b2d21849d.jpg",
                category_id: iphone!.category_id,
                variants: [
                    { color: "Blue", storage: "128GB", price: 799, stock: 30 },
                    { color: "Midnight", storage: "256GB", price: 899, stock: 20 }
                ],
            },
            {
                name: "iPhone 14 Pro",
                description: "iPhone 14 Pro với màn hình Super Retina XDR ProMotion, camera 48MP cải tiến với nhiều chế độ chụp chuyên nghiệp, chip A16 Bionic mạnh mẽ, hiệu năng vượt trội cho mọi tác vụ và chơi game. Hỗ trợ Dynamic Island, Face ID, pin lâu dài và khả năng chống nước IP68.",
                basePrice: 999,
                image: "0b041bcb-d6da-4edf-b455-8c20c1c2c876.jpg",
                category_id: iphone!.category_id,
                variants: [
                    { color: "Gold", storage: "128GB", price: 999, stock: 25 },
                    { color: "Deep Purple", storage: "512GB", price: 1399, stock: 10 }
                ],
                subCategory: "IphonePro"

            },
            {
                name: "iPhone 13",
                description: "iPhone 13 với thiết kế sang trọng, camera kép 12MP chất lượng cao, màn hình Super Retina XDR sáng rõ, chip A15 Bionic mạnh mẽ, hiệu năng mượt mà cho mọi tác vụ và chơi game. Hỗ trợ Face ID, pin lâu dài và khả năng chống nước chuẩn IP68.",
                basePrice: 699,
                image: "d176c4dc-e915-4885-8c3e-93a464281bd2.jpg",
                category_id: iphone!.category_id,
                variants: [
                    { color: "Pink", storage: "128GB", price: 699, stock: 40 },
                    { color: "Blue", storage: "256GB", price: 799, stock: 30 }
                ]
            },
            {
                name: "iPhone SE (2022)",
                description: "iPhone SE (2022) với thiết kế nhỏ gọn, màn hình Retina HD, hiệu năng mạnh mẽ nhờ chip A15 Bionic, hỗ trợ camera đơn chất lượng cao và Touch ID tiện lợi. Lý tưởng cho người dùng thích iPhone nhỏ nhưng vẫn mạnh mẽ.",
                basePrice: 429,
                image: "138839eb-513f-4464-89d2-29039a80b400.jpg",
                category_id: iphone!.category_id,
                variants: [
                    { color: "Black", storage: "64GB", price: 429, stock: 50 },
                    { color: "Red", storage: "128GB", price: 479, stock: 35 }
                ]
            },
            {
                name: "iPad Air 5",
                description: "iPad Air 5 với thiết kế mỏng nhẹ, màn hình Liquid Retina 10.9 inch, hiệu năng mạnh mẽ nhờ chip M1, hỗ trợ Apple Pencil 2 và Magic Keyboard. Lý tưởng cho học tập, làm việc và giải trí di động.",
                basePrice: 599,
                image: "0e8af94d-baf8-4fe1-b4ac-0dc80738aa9d.jpg",
                category_id: ipad!.category_id,
                variants: [
                    { color: "Blue", storage: "64GB", price: 599, stock: 20 },
                    { color: "Pink", storage: "256GB", price: 749, stock: 15 }
                ],
                subCategory: "iPadAir"

            },
            {
                name: "iPad Pro 11 M2",
                description: "iPad Pro 11 inch M2 với màn hình Liquid Retina XDR sắc nét, chip M2 mạnh mẽ, hỗ trợ Apple Pencil 2 và Magic Keyboard, đem lại trải nghiệm làm việc và giải trí chuyên nghiệp, đa nhiệm mượt mà.",
                basePrice: 799,
                image: "49bb184c-8b61-4648-a539-b5902b3010c3.jpg",
                category_id: ipad!.category_id,
                variants: [
                    { color: "Silver", storage: "128GB", price: 799, stock: 18 },
                    { color: "Space Gray", storage: "512GB", price: 1099, stock: 10 }
                ],
                subCategory: "iPadPro"

            },
            {
                name: "iPad Air M3",
                description: "iPad Air M3 với chip Apple M3 mạnh mẽ, thiết kế mỏng nhẹ, màn hình Liquid Retina 10.9 inch sắc nét, hỗ trợ Apple Pencil và Magic Keyboard, lý tưởng cho học tập, sáng tạo và giải trí.",
                basePrice: 449,
                image: "33fbfa64-cb5e-4cc9-9e7f-f2cd593584b8.jpg",
                category_id: ipad!.category_id,
                variants: [
                    { color: "Silver", storage: "128GB", price: 449, stock: 18 },
                    { color: "Gray", storage: "256GB", price: 599, stock: 12 }
                ],
                subCategory: "iPadAir"

            },
            {
                name: "iPad Mini 6",
                description: "iPad Mini 6 nhỏ gọn, trang bị chip A15 Bionic, màn hình Liquid Retina 8.3 inch, hỗ trợ Apple Pencil 2, lý tưởng cho công việc di động, giải trí và sáng tạo mọi lúc mọi nơi.",
                basePrice: 499,
                image: "44f38ef2-83ef-4778-bd28-d33639ac3cad.jpg",
                category_id: ipad!.category_id,
                variants: [
                    { color: "Pink", storage: "64GB", price: 499, stock: 20 },
                    { color: "Gray", storage: "256GB", price: 649, stock: 15 }
                ],
                subCategory: "iPadMini"

            },
            {
                name: "AirPods 2",
                description: "AirPods 2 với thiết kế không dây tiện lợi, chất lượng âm thanh tốt, kết nối nhanh với các thiết bị Apple và thời lượng pin ấn tượng, phù hợp cho nghe nhạc, gọi điện và làm việc di động.",
                basePrice: 129,
                image: "f12b814a-aafd-4491-94c8-e385614fdd85.jpg",
                category_id: airpods!.category_id,
                variants: [
                    { color: "White", storage: "", price: 129, stock: 50 }
                ]
            },
            {
                name: "AirPods Pro 2",
                description: "AirPods Pro 2 với tính năng chống ồn chủ động, chế độ Transparency, chất lượng âm thanh nâng cao và khả năng kết nối mượt mà với các thiết bị Apple, mang đến trải nghiệm nghe nhạc và gọi điện đỉnh cao.",
                basePrice: 249,
                image: "b691048c-8fa9-4531-89e1-aa85962b64e2.jpg",
                category_id: airpods!.category_id,
                variants: [
                    { color: "White", storage: "", price: 249, stock: 35 }
                ],
                subCategory: "AirPodsPro"

            },
            {
                name: "AirPods Max",
                description: "AirPods Max là tai nghe chụp tai cao cấp của Apple với âm thanh không gian (Spatial Audio), chống ồn chủ động, chất liệu sang trọng và trải nghiệm nghe nhạc vượt trội, phù hợp cho audiophile và người dùng chuyên nghiệp.",
                basePrice: 549,
                image: "0a357de9-8724-4882-9ee4-19f36fda6b48.jpg",
                category_id: airpods!.category_id,
                variants: [
                    { color: "Gray", storage: "", price: 549, stock: 20 }
                ],
                subCategory: "AirPodsMax"

            },
            {
                name: "AirPods 3",
                description: "AirPods 3 với thiết kế gọn nhẹ, âm thanh mạnh mẽ, hỗ trợ Spatial Audio và Adaptive EQ, mang đến trải nghiệm nghe nhạc và đàm thoại chất lượng cao, tiện lợi cho mọi hoạt động hàng ngày.",
                basePrice: 179,
                image: "8d0659e9-1e4a-42fe-baa2-01d2bdfe6cac.jpg",
                category_id: airpods!.category_id,
                variants: [
                    { color: "White", storage: "", price: 179, stock: 45 }
                ]
            }
        ];

        // Seed data
        for (const p of productsData) {
            const createdProduct = await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.description,
                    basePrice: p.basePrice,
                    image: p.image,
                    category_id: p.category_id,
                    subCategory: p.subCategory
                },
            });

            for (const v of p.variants) {
                // tạo variant
                const createdVariant = await prisma.productVariant.create({
                    data: {
                        product_id: createdProduct.id,
                        color: v.color,
                        storage: v.storage,
                        price: v.price,
                    },
                });

                // tạo inventory cho variant
                const createdInventory = await prisma.inventory.create({
                    data: {
                        product_variant_id: createdVariant.id,
                        stock: v.stock,
                        sold: 0,
                    },
                });

                // tạo log nhập kho ban đầu
                await prisma.inventoryLog.create({
                    data: {
                        product_variant_id: createdVariant.id,
                        action_type: "IMPORT",
                        quantity: v.stock,
                        note: "Khởi tạo số lượng ban đầu",
                        created_by: adminUser?.id || 1, // <--- Dùng ID thực tế của admin
                    },
                });
            }
        }
    }

    // Review
    const test1 = await prisma.user.findFirst({ where: { email: "test1@gmail.com" } });
    const test2 = await prisma.user.findFirst({ where: { email: "test2@gmail.com" } });
    const test3 = await prisma.user.findFirst({ where: { email: "test3@gmail.com" } });

    const users = [test1, test2, test3].filter(Boolean);

    // --- Seed Wishlist mẫu cho test1 ---
    const macbookAir = await prisma.product.findFirst({ where: { name: "MacBook Air 2020" } });
    if (test1 && macbookAir) {
        const existingWishlist = await prisma.wishlist.findFirst({
            where: { user_id: test1.id, product_id: macbookAir.id },
        });
        if (!existingWishlist) {
            await prisma.wishlist.create({
                data: { user_id: test1.id, product_id: macbookAir.id },
            });
        }
    }

    // --- Seed Reviews: mỗi product có 3 review ---
    const allProducts = await prisma.product.findMany();
    for (const product of allProducts) {
        for (const [i, user] of users.entries()) {
            if (!user) continue;

            const existingReview = await prisma.review.findFirst({
                where: { user_id: user.id, product_id: product.id },
            });

            if (!existingReview) {
                await prisma.review.create({
                    data: {
                        user_id: user.id,
                        product_id: product.id,
                        rating: Math.floor(Math.random() * 5) + 1, // 1 → 5 random
                        comment: `Review #${i + 1} for ${product.name}`,
                    },
                });
            }
        }
    }

    console.log("Database initialized with mock data");
};

export default initDatabase;


// Thêm vào cuối file seed.ts
initDatabase()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed hoàn tất!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });