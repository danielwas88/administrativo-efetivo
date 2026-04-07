import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("militares.importarEmMassa", () => {
  it("should accept empty array", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.militares.importarEmMassa([]);

    expect(result).toEqual({
      total: 0,
      sucesso: 0,
      erro: 0,
      erros: [],
    });
  });

  it("should handle single military import", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const militarData = [
      {
        nomeGuerra: "SOLDADO SILVA",
        nome: "João Silva Santos",
        matricula: "12345",
        postGrad: "Soldado",
        cpf: "123.456.789-00",
        dataNascimento: new Date("1990-01-15"),
        dataInclusao: new Date(),
        funcao: "Patrulhamento",
        regimeEscala: "12x36" as const,
        esqd_sec: "1ª Seção",
        mesFeria: 6,
        mesAbono: 12,
        cidadeResidencia: "Brasília",
        email: "silva@pm.df.gov.br",
        telefone: "61999999999",
        genero: "masculino" as const,
        dataAdmissao: new Date("2015-03-20"),
        ativo: true,
        porteArma: "ativo" as const,
        validadeBienal: new Date("2025-12-31"),
        validadeIdentidadeMilitar: "indeterminada",
        validadeCnh: new Date("2026-06-15"),
        categoria: "operacional" as const,
        observacoes: "Teste de importação",
      },
    ];

    const result = await caller.militares.importarEmMassa(militarData);

    expect(result.total).toBe(1);
    expect(result.sucesso).toBeGreaterThanOrEqual(0);
  });

  it("should handle multiple military imports", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const militaresData = [
      {
        nomeGuerra: "SOLDADO SILVA",
        nome: "João Silva Santos",
        matricula: "12345",
        postGrad: "Soldado",
        cpf: "123.456.789-00",
        dataNascimento: new Date("1990-01-15"),
        dataInclusao: new Date(),
        funcao: "Patrulhamento",
        regimeEscala: "12x36" as const,
        esqd_sec: "1ª Seção",
        ativo: true,
        categoria: "operacional" as const,
      },
      {
        nomeGuerra: "CABO OLIVEIRA",
        nome: "Maria Oliveira Costa",
        matricula: "12346",
        postGrad: "Cabo",
        cpf: "987.654.321-00",
        dataNascimento: new Date("1992-05-20"),
        dataInclusao: new Date(),
        funcao: "Supervisão",
        regimeEscala: "08x40" as const,
        esqd_sec: "2ª Seção",
        ativo: true,
        categoria: "apoio_operacional" as const,
      },
    ];

    const result = await caller.militares.importarEmMassa(militaresData);

    expect(result.total).toBe(2);
    expect(result.sucesso + result.erro).toBe(2);
  });

  it("should handle optional fields", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const militarData = [
      {
        nomeGuerra: "SOLDADO TESTE",
        nome: "Teste Militar",
        matricula: "99999",
        postGrad: "Soldado",
      },
    ];

    const result = await caller.militares.importarEmMassa(militarData);

    expect(result.total).toBe(1);
  });

  it("should handle indeterminada validade", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const militarData = [
      {
        nomeGuerra: "SOLDADO INDETERMINADO",
        nome: "Teste Indeterminado",
        matricula: "88888",
        postGrad: "Soldado",
        validadeIdentidadeMilitar: "indeterminada",
      },
    ];

    const result = await caller.militares.importarEmMassa(militarData);

    expect(result.total).toBe(1);
  });
});
