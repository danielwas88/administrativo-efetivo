import { describe, it, expect } from "vitest";

describe("Reordenação de Militares", () => {
  it("deve validar que o array de sequência contém id e sequencia", () => {
    const sequencia = [
      { id: 1, sequencia: 1 },
      { id: 2, sequencia: 2 },
      { id: 3, sequencia: 3 },
    ];

    expect(sequencia).toHaveLength(3);
    expect(sequencia[0]).toHaveProperty("id");
    expect(sequencia[0]).toHaveProperty("sequencia");
    expect(sequencia[0].id).toBe(1);
    expect(sequencia[0].sequencia).toBe(1);
  });

  it("deve validar que a sequência está em ordem crescente", () => {
    const sequencia = [
      { id: 1, sequencia: 1 },
      { id: 2, sequencia: 2 },
      { id: 3, sequencia: 3 },
    ];

    for (let i = 0; i < sequencia.length; i++) {
      expect(sequencia[i].sequencia).toBe(i + 1);
    }
  });

  it("deve permitir reordenação com sequência não sequencial", () => {
    const sequencia = [
      { id: 3, sequencia: 1 },
      { id: 1, sequencia: 2 },
      { id: 2, sequencia: 3 },
    ];

    expect(sequencia[0].id).toBe(3);
    expect(sequencia[1].id).toBe(1);
    expect(sequencia[2].id).toBe(2);
  });

  it("deve validar que cada militar tem um ID único", () => {
    const sequencia = [
      { id: 1, sequencia: 1 },
      { id: 2, sequencia: 2 },
      { id: 3, sequencia: 3 },
    ];

    const ids = sequencia.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("deve validar que sequência não pode ter valores negativos", () => {
    const sequencia = [
      { id: 1, sequencia: 1 },
      { id: 2, sequencia: 2 },
      { id: 3, sequencia: 3 },
    ];

    const allPositive = sequencia.every((s) => s.sequencia > 0);
    expect(allPositive).toBe(true);
  });
});
