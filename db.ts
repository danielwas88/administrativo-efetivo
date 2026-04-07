import {
  eq,
  like,
  count,
  sql,
  isNotNull,
  or,
  and,
  lt,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  militares,
  InsertMilitar,
  historicoAcoes,
  InsertHistoricoAcoes,
  tiposAfastamento,
  InsertTipoAfastamento,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Militares - Queries
 */
export async function getMilitares(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    nome?: string;
    matricula?: string;
    postGrad?: string;
    esqd_sec?: string;
    categoria?: string;
    ativo?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };

  try {
    const conditions: any[] = [];

    if (filters?.nome) {
      conditions.push(like(militares.nome, `%${filters.nome}%`));
    }
    if (filters?.matricula) {
      conditions.push(eq(militares.matricula, filters.matricula));
    }
    if (filters?.postGrad) {
      conditions.push(eq(militares.postGrad, filters.postGrad));
    }
    if (filters?.esqd_sec) {
      conditions.push(eq(militares.esqd_sec, filters.esqd_sec));
    }
    if (filters?.categoria) {
      conditions.push(eq(militares.categoria, filters.categoria as any));
    }
    if (filters?.ativo !== undefined) {
      conditions.push(eq(militares.ativo, filters.ativo));
    }

    let query: any = db.select().from(militares);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query.orderBy(militares.sequencia).limit(limit).offset(offset);
    const countResult: any = await db
      .select({ count: count() })
      .from(militares);
    const total = countResult[0]?.count || 0;

    return { data, total };
  } catch (error) {
    console.error("[Database] Failed to get militares:", error);
    return { data: [], total: 0 };
  }
}

export async function getMilitarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(militares)
      .where(eq(militares.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get militar by id:", error);
    return undefined;
  }
}

export async function createMilitar(data: InsertMilitar) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const processedData = {
      ...data,
      validadeIdentidadeMilitar: (data.validadeIdentidadeMilitar as any) instanceof Date 
        ? (data.validadeIdentidadeMilitar as any).toISOString().split('T')[0]
        : data.validadeIdentidadeMilitar,
    } as any;
    const result = await db.insert(militares).values(processedData);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create militar:", error);
    throw error;
  }
}

export async function updateMilitar(id: number, data: Partial<InsertMilitar>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const processedData = {
      ...data,
      validadeIdentidadeMilitar: (data.validadeIdentidadeMilitar as any) instanceof Date 
        ? (data.validadeIdentidadeMilitar as any).toISOString().split('T')[0]
        : data.validadeIdentidadeMilitar,
    } as any;
    const result = await db
      .update(militares)
      .set(processedData)
      .where(eq(militares.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update militar:", error);
    throw error;
  }
}

export async function deleteMilitar(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .delete(militares)
      .where(eq(militares.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete militar:", error);
    throw error;
  }
}

/**
 * Dashboard Statistics
 */
export async function getEfetivoCounts() {
  const db = await getDb();
  if (!db) return { total: 0, ativos: 0, inativos: 0 };

  try {
    const result = await db
      .select({
        total: count(),
        ativos: count(sql`CASE WHEN ${militares.ativo} = true THEN 1 END`),
        inativos: count(sql`CASE WHEN ${militares.ativo} = false THEN 1 END`),
      })
      .from(militares);
    return result[0] || { total: 0, ativos: 0, inativos: 0 };
  } catch (error) {
    console.error("[Database] Failed to get efetivo counts:", error);
    return { total: 0, ativos: 0, inativos: 0 };
  }
}

export async function getDistribuicaoPostGrad() {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        postGrad: militares.postGrad,
        total: count(),
      })
      .from(militares)
      .groupBy(militares.postGrad);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get distribuicao post grad:", error);
    return [];
  }
}

export async function getDistribuicaoEsqdSec() {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        esqd_sec: militares.esqd_sec,
        total: count(),
      })
      .from(militares)
      .groupBy(militares.esqd_sec);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get distribuicao esqd sec:", error);
    return [];
  }
}

export async function getDistribuicaoCategoria() {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        categoria: militares.categoria,
        total: count(),
      })
      .from(militares)
      .where(isNotNull(militares.categoria))
      .groupBy(militares.categoria);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get distribuicao categoria:", error);
    return [];
  }
}

export async function getDocumentosVencidos() {
  const db = await getDb();
  if (!db) return [];

  try {
    const hoje = new Date();
    const result = await db
      .select({
        id: militares.id,
        nome: militares.nome,
        nomeGuerra: militares.nomeGuerra,
        validadeBienal: militares.validadeBienal,
        validadeIdentidadeMilitar: militares.validadeIdentidadeMilitar,
        validadeCnh: militares.validadeCnh,
      })
      .from(militares)
      .where(
        or(
          and(
            isNotNull(militares.validadeBienal),
            lt(militares.validadeBienal, hoje)
          ),

          and(
            isNotNull(militares.validadeCnh),
            lt(militares.validadeCnh, hoje)
          )
        )
      );
    return result;
  } catch (error) {
    console.error("[Database] Failed to get documentos vencidos:", error);
    return [];
  }
}

/**
 * Histórico de Ações
 */
export async function registrarAcao(
  usuarioId: number,
  acao: string,
  entidade: string,
  entidadeId: number,
  dadosAntes?: any,
  dadosDepois?: any
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(historicoAcoes).values({
      usuarioId,
      acao,
      entidade,
      entidadeId,
      dadosAntes: dadosAntes ? JSON.stringify(dadosAntes) : null,
      dadosDepois: dadosDepois ? JSON.stringify(dadosDepois) : null,
    });
  } catch (error) {
    console.error("[Database] Failed to register action:", error);
  }
}

/**
 * Tipos de Afastamento
 */
export async function getTiposAfastamento() {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(tiposAfastamento);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get tipos afastamento:", error);
    return [];
  }
}

export async function createTipoAfastamento(data: InsertTipoAfastamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(tiposAfastamento).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create tipo afastamento:", error);
    throw error;
  }
}


/**
 * Afastamentos
 */
import { afastamentos, InsertAfastamento } from "../drizzle/schema";

export async function getAfastamentos(
  filtros?: {
    militarId?: number;
    tipoAfastamentoId?: number;
    status?: string;
    dataInicio?: Date;
    dataFim?: Date;
  }
) {
  const db = await getDb();
  if (!db) return [];

  try {
    let conditions: any[] = [];
    
    if (filtros?.militarId) {
      conditions.push(eq(afastamentos.militarId, filtros.militarId));
    }
    if (filtros?.tipoAfastamentoId) {
      conditions.push(eq(afastamentos.tipoAfastamentoId, filtros.tipoAfastamentoId));
    }
    if (filtros?.status) {
      conditions.push(eq(afastamentos.status, filtros.status as any));
    }

    let query: any = db.select().from(afastamentos);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result;
  } catch (error) {
    console.error("[Database] Failed to get afastamentos:", error);
    return [];
  }
}

export async function getAfastamentoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await (db
      .select()
      .from(afastamentos)
      .where(eq(afastamentos.id, id))
      .limit(1) as any);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get afastamento:", error);
    return undefined;
  }
}

export async function createAfastamento(data: InsertAfastamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(afastamentos).values(data as any);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create afastamento:", error);
    throw error;
  }
}

export async function updateAfastamento(id: number, data: Partial<InsertAfastamento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .update(afastamentos)
      .set(data as any)
      .where(eq(afastamentos.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update afastamento:", error);
    throw error;
  }
}

export async function deleteAfastamento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .delete(afastamentos)
      .where(eq(afastamentos.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete afastamento:", error);
    throw error;
  }
}


export async function reordenarMilitares(novaSequencia: Array<{ id: number; sequencia: number }>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reorder militares: database not available");
    return;
  }

  try {
    for (const item of novaSequencia) {
      await db
        .update(militares)
        .set({ sequencia: item.sequencia })
        .where(eq(militares.id, item.id));
    }
  } catch (error) {
    console.error("[Database] Failed to reorder militares:", error);
    throw error;
  }
}

export async function getMilitaresPorSequencia(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(militares)
      .orderBy(militares.sequencia)
      .limit(limit)
      .offset(offset);
    return result as any[];
  } catch (error) {
    console.error("[Database] Failed to get militares por sequencia:", error);
    return [];
  }
}
