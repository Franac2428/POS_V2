-- AlterTable
ALTER TABLE `categoriasproducto` ADD COLUMN `FechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `FechaModificacion` DATETIME(3) NULL,
    ADD COLUMN `IdUsuarioCreacion` INTEGER NULL,
    ADD COLUMN `IdUsuarioModificacion` INTEGER NULL;

-- AlterTable
ALTER TABLE `infoempresa` MODIFY `logo` LONGBLOB NULL DEFAULT null;

-- AlterTable
ALTER TABLE `proveedores` ADD COLUMN `FechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `FechaModificacion` DATETIME(3) NULL,
    ADD COLUMN `IdUsuarioCreacion` INTEGER NULL,
    ADD COLUMN `IdUsuarioModificacion` INTEGER NULL;
