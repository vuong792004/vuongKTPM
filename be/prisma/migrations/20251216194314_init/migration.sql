-- AddForeignKey
ALTER TABLE `inventory_log` ADD CONSTRAINT `inventory_log_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
