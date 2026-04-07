CREATE TABLE `afastamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`militarId` int NOT NULL,
	`tipoAfastamentoId` int NOT NULL,
	`dataInicio` date NOT NULL,
	`dataFim` date NOT NULL,
	`quantidadeDias` int,
	`status` enum('pendente','aprovado','rejeitado','cancelado') NOT NULL DEFAULT 'pendente',
	`motivo` text,
	`observacoes` text,
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `afastamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`tipo` enum('afastamento_vencendo','conflito_escala','efetivo_insuficiente','escala_nao_preenchida','documento_vencido') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`referencia` varchar(100),
	`lido` boolean NOT NULL DEFAULT false,
	`enviado` boolean NOT NULL DEFAULT false,
	`dataEnvio` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compensacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`militarId` int NOT NULL,
	`horasExtrasId` int NOT NULL,
	`tipo` enum('folga','gratificacao','banco_horas','pagamento') NOT NULL,
	`horasCompensadas` decimal(8,2) NOT NULL,
	`dataCompensacao` date,
	`status` enum('pendente','aprovada','realizada') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`criadoPor` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compensacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conflitos_escala` (
	`id` int AUTO_INCREMENT NOT NULL,
	`escalaId` int NOT NULL,
	`tipo` enum('sobreposicao','afastamento_ativo','excesso_horas','sublotacao_insuficiente') NOT NULL,
	`descricao` text NOT NULL,
	`resolvido` boolean NOT NULL DEFAULT false,
	`resolvidoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conflitos_escala_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`militarId` int NOT NULL,
	`data` date NOT NULL,
	`turno` enum('madrugada','matutino','vespertino','noturno') NOT NULL,
	`regime` enum('08x40','12x36','12x60','24x72','expediente') NOT NULL,
	`sublotacao` varchar(255) NOT NULL,
	`tipoEscala` enum('ordinaria','extraordinaria','especial','svg') NOT NULL DEFAULT 'ordinaria',
	`justificativa` text,
	`necessidadeServico` text,
	`voluntario` boolean NOT NULL DEFAULT false,
	`compensacao` varchar(255),
	`status` enum('programada','confirmada','cancelada') NOT NULL DEFAULT 'programada',
	`observacoes` text,
	`criadoPor` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escalas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_acoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`acao` varchar(100) NOT NULL,
	`entidade` varchar(50) NOT NULL,
	`entidadeId` int NOT NULL,
	`dadosAntes` text,
	`dadosDepois` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_acoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `horas_extras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`militarId` int NOT NULL,
	`mes` int NOT NULL,
	`ano` int NOT NULL,
	`horasExtrasCalculadas` decimal(8,2) NOT NULL DEFAULT '0',
	`horasExtrasCompensadas` decimal(8,2) NOT NULL DEFAULT '0',
	`horasSaldo` decimal(8,2) NOT NULL DEFAULT '0',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `horas_extras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `militares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeGuerra` varchar(100) NOT NULL,
	`postGrad` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`matricula` varchar(20) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`dataNascimento` date NOT NULL,
	`dataInclusao` date NOT NULL,
	`funcao` varchar(255) NOT NULL,
	`regimeEscala` enum('08x40','12x36','12x60','24x72','expediente') NOT NULL,
	`esqd_sec` varchar(100) NOT NULL,
	`mesFeria` int,
	`mesAbono` int,
	`cidadeResidencia` varchar(100),
	`email` varchar(320),
	`telefone` varchar(20),
	`genero` enum('masculino','feminino','outro'),
	`dataAdmissao` date NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`porteArma` enum('ativo','suspenso') NOT NULL DEFAULT 'ativo',
	`validadeBienal` date,
	`validadeIdentidadeMilitar` date,
	`validadeCnh` date,
	`categoria` enum('operacional','apoio_operacional','dhpm','administrativo','inteligencia'),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `militares_id` PRIMARY KEY(`id`),
	CONSTRAINT `militares_matricula_unique` UNIQUE(`matricula`),
	CONSTRAINT `militares_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `relatorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`tipo` enum('afastamentos','escalas','efetivo','conflitos') NOT NULL,
	`dataInicio` date NOT NULL,
	`dataFim` date NOT NULL,
	`filtros` text,
	`dados` text,
	`criadoPor` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relatorios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restricoes_medicas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`militarId` int NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`dataInicio` date NOT NULL,
	`dataFim` date NOT NULL,
	`quantidadeDias` int,
	`motivo` text,
	`observacoes` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`criadoPor` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restricoes_medicas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_afastamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`remunerado` boolean NOT NULL DEFAULT true,
	`diasMaximos` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tipos_afastamento_id` PRIMARY KEY(`id`),
	CONSTRAINT `tipos_afastamento_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','gestor','visualizador') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `afastamento_militar_idx` ON `afastamentos` (`militarId`);--> statement-breakpoint
CREATE INDEX `afastamento_tipo_idx` ON `afastamentos` (`tipoAfastamentoId`);--> statement-breakpoint
CREATE INDEX `afastamento_status_idx` ON `afastamentos` (`status`);--> statement-breakpoint
CREATE INDEX `afastamento_data_inicio_idx` ON `afastamentos` (`dataInicio`);--> statement-breakpoint
CREATE INDEX `alerta_usuario_idx` ON `alertas` (`usuarioId`);--> statement-breakpoint
CREATE INDEX `alerta_tipo_idx` ON `alertas` (`tipo`);--> statement-breakpoint
CREATE INDEX `alerta_lido_idx` ON `alertas` (`lido`);--> statement-breakpoint
CREATE INDEX `compensacao_militar_idx` ON `compensacoes` (`militarId`);--> statement-breakpoint
CREATE INDEX `compensacao_status_idx` ON `compensacoes` (`status`);--> statement-breakpoint
CREATE INDEX `conflito_escala_idx` ON `conflitos_escala` (`escalaId`);--> statement-breakpoint
CREATE INDEX `conflito_resolvido_idx` ON `conflitos_escala` (`resolvido`);--> statement-breakpoint
CREATE INDEX `escala_militar_idx` ON `escalas` (`militarId`);--> statement-breakpoint
CREATE INDEX `escala_data_idx` ON `escalas` (`data`);--> statement-breakpoint
CREATE INDEX `escala_sublotacao_idx` ON `escalas` (`sublotacao`);--> statement-breakpoint
CREATE INDEX `escala_status_idx` ON `escalas` (`status`);--> statement-breakpoint
CREATE INDEX `historico_usuario_idx` ON `historico_acoes` (`usuarioId`);--> statement-breakpoint
CREATE INDEX `historico_entidade_idx` ON `historico_acoes` (`entidade`);--> statement-breakpoint
CREATE INDEX `horas_militar_idx` ON `horas_extras` (`militarId`);--> statement-breakpoint
CREATE INDEX `horas_mes_ano_idx` ON `horas_extras` (`mes`,`ano`);--> statement-breakpoint
CREATE INDEX `militar_matricula_idx` ON `militares` (`matricula`);--> statement-breakpoint
CREATE INDEX `militar_cpf_idx` ON `militares` (`cpf`);--> statement-breakpoint
CREATE INDEX `militar_esqd_sec_idx` ON `militares` (`esqd_sec`);--> statement-breakpoint
CREATE INDEX `militar_postgrad_idx` ON `militares` (`postGrad`);--> statement-breakpoint
CREATE INDEX `militar_categoria_idx` ON `militares` (`categoria`);--> statement-breakpoint
CREATE INDEX `militar_ativo_idx` ON `militares` (`ativo`);--> statement-breakpoint
CREATE INDEX `relatorio_tipo_idx` ON `relatorios` (`tipo`);--> statement-breakpoint
CREATE INDEX `relatorio_criado_idx` ON `relatorios` (`criadoPor`);--> statement-breakpoint
CREATE INDEX `restricao_militar_idx` ON `restricoes_medicas` (`militarId`);--> statement-breakpoint
CREATE INDEX `restricao_data_inicio_idx` ON `restricoes_medicas` (`dataInicio`);--> statement-breakpoint
CREATE INDEX `restricao_data_fim_idx` ON `restricoes_medicas` (`dataFim`);--> statement-breakpoint
CREATE INDEX `tipo_afastamento_nome_idx` ON `tipos_afastamento` (`nome`);