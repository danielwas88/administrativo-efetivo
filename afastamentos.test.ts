import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "gestor" | "visualizador" = "gestor"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: role,
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

  return { ctx };
}

describe("afastamentos", () => {
  it("should list afastamentos with gestor role", async () => {
    const { ctx } = createAuthContext("gestor");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.afastamentos.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny access to visualizador for list", async () => {
    const { ctx } = createAuthContext("visualizador");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.afastamentos.list({});
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to delete afastamento", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    // This will fail because the afastamento doesn't exist, but it tests permission
    try {
      await caller.afastamentos.delete({ id: 999 });
      // If it reaches here, the permission check passed
    } catch (error: any) {
      // Expected to fail due to non-existent ID, not permission
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });

  it("should deny gestor from deleting afastamento", async () => {
    const { ctx } = createAuthContext("gestor");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.afastamentos.delete({ id: 1 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should list tipos de afastamento", async () => {
    const { ctx } = createAuthContext("gestor");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tiposAfastamento.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
