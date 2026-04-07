    enviado: boolean("enviado").default(false).notNull(),
    dataEnvio: timestamp("dataEnvio"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    usuarioIdx: index("alerta_usuario_idx").on(table.usuarioId),
    tipoIdx: index("alerta_tipo_idx").on(table.tipo),
    leidoIdx: index("alerta_lido_idx").on(table.lido),
  })
);

export type Alerta = typeof alertas.$inferSelect;
export type InsertAlerta = typeof alertas.$inferInsert;

/**
 * Relatórios - Histórico de relatórios gerados
 */
export const relatorios = mysqlTable(
  "relatorios",
  {
    id: int("id").autoincrement().primaryKey(),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    tipo: mysqlEnum("tipo", ["afastamentos", "escalas", "efetivo", "conflitos"]).notNull(),
    dataInicio: date("dataInicio").notNull(),
    dataFim: date("dataFim").notNull(),
    filtros: text("filtros"), // JSON string com filtros aplicados
    dados: text("dados"), // JSON string com dados do relatório
    criadoPor: int("criadoPor").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tipoIdx: index("relatorio_tipo_idx").on(table.tipo),
    criadoIdx: index("relatorio_criado_idx").on(table.criadoPor),
  })
);

export type Relatorio = typeof relatorios.$inferSelect;
export type InsertRelatorio = typeof relatorios.$inferInsert;

/**
 * Histórico de Ações - Auditoria de todas as operações
 */
export const historicoAcoes = mysqlTable(
  "historico_acoes",
  {
    id: int("id").autoincrement().primaryKey(),
    usuarioId: int("usuarioId").notNull(),
    acao: varchar("acao", { length: 100 }).notNull(),
    entidade: varchar("entidade", { length: 50 }).notNull(), // militar, afastamento, escala, etc
    entidadeId: int("entidadeId").notNull(),
    dadosAntes: text("dadosAntes"), // JSON
    dadosDepois: text("dadosDepois"), // JSON
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    usuarioIdx: index("historico_usuario_idx").on(table.usuarioId),
    entidadeIdx: index("historico_entidade_idx").on(table.entidade),
  })
);

export type HistoricoAcoes = typeof historicoAcoes.$inferSelect;
export type InsertHistoricoAcoes = typeof historicoAcoes.$inferInsert;

/**
 * Configuração de Horas por Regime
 */
export const configHorasRegime = mysqlTable(
  "config_horas_regime",
  {
    id: int("id").autoincrement().primaryKey(),
    regime: mysqlEnum("regime", ["08x40", "12x36", "12x60", "24x72", "expediente"]).notNull().unique(),
    horasNormaisPorDia: decimal("horasNormaisPorDia", { precision: 5, scale: 2 }).notNull(),
    horasNormaisPorSemana: decimal("horasNormaisPorSemana", { precision: 5, scale: 2 }).notNull(),
    descricao: text("descricao"),
    ativo: boolean("ativo").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type ConfigHorasRegime = typeof configHorasRegime.$inferSelect;
export type InsertConfigHorasRegime = typeof configHorasRegime.$inferInsert;

/**
 * Horas Extras Acumuladas
 */
export const horasExtras = mysqlTable(
  "horas_extras",
  {
    id: int("id").autoincrement().primaryKey(),
    militarId: int("militarId").notNull(),
    mes: int("mes").notNull(), // 1-12
    ano: int("ano").notNull(),
    horasExtrasCalculadas: decimal("horasExtrasCalculadas", { precision: 8, scale: 2 }).notNull().default("0"),
    horasExtrasCompensadas: decimal("horasExtrasCompensadas", { precision: 8, scale: 2 }).notNull().default("0"),
    horasSaldo: decimal("horasSaldo", { precision: 8, scale: 2 }).notNull().default("0"),
    observacoes: text("observacoes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    militarIdx: index("horas_militar_idx").on(table.militarId),
    mesAnoIdx: index("horas_mes_ano_idx").on(table.mes, table.ano),
  })
);

export type HorasExtras = typeof horasExtras.$inferSelect;
export type InsertHorasExtras = typeof horasExtras.$inferInsert;

/**
 * Compensações de Horas Extras
 */
export const compensacoes = mysqlTable(
  "compensacoes",
  {
    id: int("id").autoincrement().primaryKey(),
    militarId: int("militarId").notNull(),
    horasExtrasId: int("horasExtrasId").notNull(),
    tipo: mysqlEnum("tipo", ["folga", "gratificacao", "banco_horas", "pagamento"]).notNull(),
    horasCompensadas: decimal("horasCompensadas", { precision: 8, scale: 2 }).notNull(),
    dataCompensacao: date("dataCompensacao"),
    status: mysqlEnum("status", ["pendente", "aprovada", "realizada"]).default("pendente").notNull(),
    observacoes: text("observacoes"),
    criadoPor: int("criadoPor").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    militarIdx: index("compensacao_militar_idx").on(table.militarId),
    statusIdx: index("compensacao_status_idx").on(table.status),
  })
);

export type Compensacao = typeof compensacoes.$inferSelect;
export type InsertCompensacao = typeof compensacoes.$inferInsert;
