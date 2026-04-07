ALTER TABLE `militares` MODIFY COLUMN `nomeGuerra` varchar(100);--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `postGrad` varchar(50);--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `nome` varchar(255);--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `matricula` varchar(20);--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `dataNascimento` date;--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `funcao` varchar(255);--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `regimeEscala` enum('08x40','12x36','12x60','24x72','expediente');--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `esqd_sec` varchar(100);--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `dataAdmissao` date;--> statement-breakpoint
ALTER TABLE `militares` MODIFY COLUMN `validadeIdentidadeMilitar` varchar(50);