/*
  Warnings:

  - You are about to drop the column `Tipo` on the `proveedores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `categoriasproducto` ADD COLUMN `Eliminado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `infoempresa` MODIFY `logo` LONGBLOB NULL DEFAULT null;

-- AlterTable
ALTER TABLE `proveedores` DROP COLUMN `Tipo`,
    ADD COLUMN `Eliminado` BOOLEAN NOT NULL DEFAULT false;
