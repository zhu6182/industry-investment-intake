-- ============================================
-- 产业投资进件系统 - 数据库建表脚本
-- ============================================

CREATE TABLE IF NOT EXISTS `regions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '区域名称',
  `level` TINYINT UNSIGNED NOT NULL COMMENT '层级: 1省 2市 3园区',
  `parentId` INT UNSIGNED NULL COMMENT '父级区域ID',
  PRIMARY KEY (`id`),
  INDEX `idx_parent` (`parentId`),
  INDEX `idx_level` (`level`),
  CONSTRAINT `fk_region_parent` FOREIGN KEY (`parentId`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='省市区区域表';

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(100) NOT NULL COMMENT '权限编码',
  `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `module` VARCHAR(100) NOT NULL COMMENT '所属模块',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  INDEX `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
  `name` VARCHAR(50) NOT NULL COMMENT '角色显示名',
  `description` VARCHAR(255) NULL COMMENT '描述',
  `dataScope` ENUM('self','team','region','all') NOT NULL DEFAULT 'self' COMMENT '数据权限范围',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `roleId` INT UNSIGNED NOT NULL,
  `permissionId` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`roleId`, `permissionId`),
  INDEX `idx_permission` (`permissionId`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联表';

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(bcrypt加密)',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `email` VARCHAR(100) NULL COMMENT '邮箱',
  `avatar` VARCHAR(255) NULL COMMENT '头像URL',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `regionId` INT UNSIGNED NULL COMMENT '所属区域ID',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  INDEX `idx_region` (`regionId`),
  INDEX `idx_active` (`isActive`),
  CONSTRAINT `fk_user_region` FOREIGN KEY (`regionId`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `user_roles` (
  `userId` INT UNSIGNED NOT NULL,
  `roleId` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`userId`, `roleId`),
  INDEX `idx_role` (`roleId`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关联表';
