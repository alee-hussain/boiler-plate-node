/*
  Warnings:

  - You are about to alter the column `date_of_birth` on the `user_details` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `otp_expiration` on the `user_secrets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[user_id]` on the table `user_details` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `user_secrets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user_details` MODIFY `date_of_birth` DATETIME NULL;

-- AlterTable
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_details_user_id_key` ON `user_details`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_secrets_user_id_key` ON `user_secrets`(`user_id`);
