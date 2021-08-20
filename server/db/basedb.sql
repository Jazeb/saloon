SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `iBTekar`;
USE `iBTekar`;

CREATE TABLE IF NOT EXISTS `biddingTicketFees` (
    `id` int NOT NULL,
    `start_price` int NOT NULL,
    `end_price` int DEFAULT NULL,
    `fees` int NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL DEFAULT '2021-02-10 12:22:11',
    `updated_at` datetime NOT NULL DEFAULT '2021-02-10 12:22:11'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `biddingTicketFees` 
(`start_price`, `end_price`, `fees`, `created_at`, `updated_at`) VALUES
(0, 199, 2, '2021-02-10 12:22:11', '2021-02-10 12:22:11'),
(200, 499, 3, '2021-02-10 12:22:11', '2021-02-10 12:22:11'),
(500, 1999, 4, '2021-02-10 12:22:11', '2021-02-10 12:22:11'),
(2000, NULL, 5, '2021-02-10 12:22:11', '2021-02-10 12:22:11');


ALTER TABLE `biddingTicketFees` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `productCategories` (
    `id` int NOT NULL,
    `name_ar` varchar(255) NOT NULL,
    `name_en` varchar(255) NOT NULL,
    `status` BOOL NOT NULL DEFAULT TRUE,
    `description` varchar(255) DEFAULT NULL,
    `icon` text,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `productCategories` (`name_ar`, `name_en`, `icon`) VALUES
('Women\'s Fashion', 'Women\'s Fashion.....', '/womens_fashion.png'),
('Men\'s Fashion', 'Men\'s Fashion.....', '/mens_fashion.png');

ALTER TABLE `productCategories` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `SBPFees` (
    `id` int NOT NULL,
    `start_price` int NOT NULL,
    `end_price` int DEFAULT NULL,
    `fees_per` float NOT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `SBPFees` (`start_price`, `end_price`, `fees_per`) VALUES
(0, 199, 0),
(200, 499, 1),
(500, 1999, 2),
(2000, NULL, 2.5);

ALTER TABLE `SBPFees` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `products` MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `bids` MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `biddingTickets` MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE `support` ADD CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- SELECT user, authentication_string, plugin, host FROM mysql.user;