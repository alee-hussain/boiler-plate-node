/*
  Warnings:

  - You are about to alter the column `date_of_birth` on the `user_details` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `otp_expiration` on the `user_secrets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `user_details` MODIFY `date_of_birth` DATETIME NULL;

-- AlterTable
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NOT NULL;
