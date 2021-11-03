INSERT INTO `services` 
(`service_name`, `parent_id`) VALUES
('Barber Services', null),
('Shaving', null),
('Hair Saloon Services', 1);


-- INSERT INTO `sub_services`
-- (`sub_service_name`, `service_id`) VALUES 
-- ('Hair Cut', 1),
-- ('Shave, Beard', 2),
-- ('Hair Styling', 3);


ALTER TABLE services MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE services MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ALTER TABLE `SBPFees` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

-- ALTER TABLE `products` MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE `bids` MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE `biddingTickets` MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE `support` ADD CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- SELECT user, authentication_string, plugin, host FROM mysql.user;