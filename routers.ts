import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getMilitares,
  getMilitarById,
  createMilitar,
  updateMilitar,
  deleteMilitar,
  getEfetivoCounts,
  getDistribuicaoPostGrad,
  getDistribuicaoEsqdSec,
  getDistribuicaoCategoria,
  getDocumentosVencidos,
  registrarAcao,
  getTiposAfastamento,
  createTipoAfastamento,
  getAfastamentos,
  getAfastamentoById,
  createAfastamento,
  updateAfastamento,
  deleteAfastamento,
  reordenarMilitares,
  getMilitaresPorSequencia,
} from "./db";

// Procedure para admin apenas
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

// Procedure para gestor e admin
const gestorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestor") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Militares CRUD
  militares: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          nome: z.string().optional(),
          matricula: z.string().optional(),
          postGrad: z.string().optional(),
          esqd_sec: z.string().optional(),
          categoria: z.string().optional(),
          ativo: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        const result = await getMilitares(input.limit, input.offset, {
          nome: input.nome,
          matricula: input.matricula,
          postGrad: input.postGrad,
          esqd_sec: input.esqd_sec,
          categoria: input.categoria,
          ativo: input.ativo,
        });
        return result;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getMilitarById(input.id);
      }),

    create: gestorProcedure
      .input(
        z.object({
          nomeGuerra: z.string(),
          postGrad: z.string(),
          nome: z.string(),
          matricula: z.string(),
          cpf: z.string(),
          dataNascimento: z.date(),
          dataInclusao: z.date(),
          funcao: z.string(),
          regimeEscala: z.enum(["08x40", "12x36", "12x60", "24x72", "expediente"]),
          esqd_sec: z.string(),
          mesFeria: z.number().optional(),
          mesAbono: z.number().optional(),
          cidadeResidencia: z.string().optional(),
          email: z.string().optional(),
          telefone: z.string().optional(),
          genero: z.enum(["masculino", "feminino", "outro"]).optional(),
          dataAdmissao: z.date(),
          ativo: z.boolean().default(true),
          porteArma: z.enum(["ativo", "suspenso"]).default("ativo"),
          validadeBienal: z.date().optional(),
          validadeIdentidadeMilitar: z.union([z.literal("indeterminada"), z.string(), z.date()]).optional(),
          validadeCnh: z.date().optional(),
          categoria: z.enum([
            "operacional",
            "apoio_operacional",
            "dhpm",
            "administrativo",
            "inteligencia",
          ]).optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createMilitar(input as any);
        // Get the ID from the result - will be available after insert
        const militarId = (result as any)?.insertId || 1;
        await registrarAcao(
          ctx.user.id,
          "criar",
          "militar",
          militarId,
          null,
          input
        );
        return result;
      }),

    update: gestorProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            nomeGuerra: z.string().optional(),
            postGrad: z.string().optional(),
            nome: z.string().optional(),
            cpf: z.string().optional(),
            dataNascimento: z.date().optional(),
            dataInclusao: z.date().optional(),
            funcao: z.string().optional(),
            regimeEscala: z.enum(["08x40", "12x36", "12x60", "24x72", "expediente"]).optional(),
            esqd_sec: z.string().optional(),
            mesFeria: z.number().optional(),
            mesAbono: z.number().optional(),
            cidadeResidencia: z.string().optional(),
            email: z.string().optional(),
            telefone: z.string().optional(),
            genero: z.enum(["masculino", "feminino", "outro"]).optional(),
            dataAdmissao: z.date().optional(),
            ativo: z.boolean().optional(),
            porteArma: z.enum(["ativo", "suspenso"]).optional(),
            validadeBienal: z.date().optional(),
            validadeIdentidadeMilitar: z.union([z.literal("indeterminada"), z.string(), z.date()]).optional(),
            validadeCnh: z.date().optional(),
            categoria: z.enum([
              "operacional",
              "apoio_operacional",
              "dhpm",
              "administrativo",
              "inteligencia",
            ]).optional(),
            observacoes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const militar = await getMilitarById(input.id);
        const result = await updateMilitar(input.id, input.data as any);
        await registrarAcao(
          ctx.user.id,
          "atualizar",
          "militar",
          input.id,
          militar,
          input.data
        );
        return result;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const militar = await getMilitarById(input.id);
        const result = await deleteMilitar(input.id);
        await registrarAcao(
          ctx.user.id,
          "deletar",
          "militar",
          input.id,
          militar,
          null
        );
        return result;
      }),

    reordenar: gestorProcedure
      .input(
        z.object({
          sequencia: z.array(
            z.object({
              id: z.number(),
              sequencia: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await reordenarMilitares(input.sequencia);
        await registrarAcao(
          ctx.user.id,
          "reordenar",
          "militares",
          0,
          null,
          { sequencia: input.sequencia }
        );
        return { success: true };
      }),

    porSequencia: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getMilitaresPorSequencia(input.limit, input.offset);
      }),
    importarEmMassa: adminProcedure
      .input(
        z.array(
          z.object({
            nomeGuerra: z.string().optional(),
            postGrad: z.string().optional(),
            nome: z.string().optional(),
            cpf: z.string().optional(),
            dataNascimento: z.date().optional(),
            dataInclusao: z.date().optional(),
            funcao: z.string().optional(),
            regimeEscala: z.enum(["08x40", "12x36", "12x60", "24x72", "expediente"]).optional(),
            esqd_sec: z.string().optional(),
            mesFeria: z.number().optional(),
            mesAbono: z.number().optional(),
            cidadeResidencia: z.string().optional(),
            email: z.string().optional(),
            telefone: z.string().optional(),
            genero: z.enum(["masculino", "feminino", "outro"]).optional(),
            dataAdmissao: z.date().optional(),
            ativo: z.boolean().optional(),
            porteArma: z.enum(["ativo", "suspenso"]).optional(),
            validadeBienal: z.date().optional(),
            validadeIdentidadeMilitar: z.union([z.literal("indeterminada"), z.string(), z.date()]).optional(),
            validadeCnh: z.date().optional(),
            categoria: z.enum(["operacional", "apoio_operacional", "dhpm", "administrativo", "inteligencia"]).optional(),
            observacoes: z.string().optional(),
          })
        )
      )
      .mutation(async ({ input, ctx }) => {
        const erros: { linha: number; mensagem: string }[] = [];
        let sucesso = 0;

        for (let i = 0; i < input.length; i++) {
          try {
            const data = input[i];
            await createMilitar(data as any);
            sucesso++;
          } catch (error: any) {
            erros.push({
              linha: i + 2,
              mensagem: error.message || "Erro desconhecido",
            });
          }
        }

        return {
          total: input.length,
          sucesso,
          erro: erros.length,
          erros,
        };
      }),
  }),

  // Dashboard
  dashboard: router({
    efetivoCounts: protectedProcedure.query(async () => {
      return await getEfetivoCounts();
    }),

    distribuicaoPostGrad: protectedProcedure.query(async () => {
      return await getDistribuicaoPostGrad();
    }),

    distribuicaoEsqdSec: protectedProcedure.query(async () => {
      return await getDistribuicaoEsqdSec();
    }),

    distribuicaoCategoria: protectedProcedure.query(async () => {
      return await getDistribuicaoCategoria();
    }),

    documentosVencidos: protectedProcedure.query(async () => {
      return await getDocumentosVencidos();
    }),
  }),

  // Tipos de Afastamento
  tiposAfastamento: router({
    list: protectedProcedure.query(async () => {
      return await getTiposAfastamento();
    }),

    create: gestorProcedure
      .input(
        z.object({
          nome: z.string(),
          descricao: z.string().optional(),
          remunerado: z.boolean().default(true),
          diasMaximos: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createTipoAfastamento(input);
        const tipoId = (result as any)?.insertId || 1;
        await registrarAcao(
          ctx.user.id,
          "criar",
          "tipo_afastamento",
          tipoId,
          null,
          input
        );
        return result;
      }),
  }),

  afastamentos: router({
    list: gestorProcedure
      .input(
        z.object({
          militarId: z.number().optional(),
          tipoAfastamentoId: z.number().optional(),
          status: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getAfastamentos(input);
      }),

    getById: gestorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getAfastamentoById(input.id);
      }),

    create: gestorProcedure
      .input(
        z.object({
          militarId: z.number(),
          tipoAfastamentoId: z.number(),
          dataInicio: z.date(),
          dataFim: z.date(),
          quantidadeDias: z.number().optional(),
          status: z.enum(["pendente", "aprovado", "rejeitado", "cancelado"]).default("pendente"),
          motivo: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createAfastamento(input as any);
        const afastamentoId = (result as any)?.insertId || 1;
        await registrarAcao(
          ctx.user.id,
          "criar",
          "afastamento",
          afastamentoId,
          null,
          input
        );
        return result;
      }),

    update: gestorProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            status: z.enum(["pendente", "aprovado", "rejeitado", "cancelado"]).optional(),
            dataInicio: z.date().optional(),
            dataFim: z.date().optional(),
            motivo: z.string().optional(),
            observacoes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const afastamento = await getAfastamentoById(input.id);
        const result = await updateAfastamento(input.id, input.data as any);
        await registrarAcao(
          ctx.user.id,
          "atualizar",
          "afastamento",
          input.id,
          afastamento,
          input.data
        );
        return result;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const afastamento = await getAfastamentoById(input.id);
        const result = await deleteAfastamento(input.id);
        await registrarAcao(
          ctx.user.id,
          "deletar",
          "afastamento",
          input.id,
          afastamento,
          null
        );
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
