ALTER TABLE `militares` ADD `sequencia` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `militar_sequencia_idx` ON `militares` (`sequencia`);