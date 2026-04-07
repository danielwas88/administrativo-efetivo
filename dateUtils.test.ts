import { describe, it, expect } from "vitest";
import { formatDateBR, parseDateBR, toInputFormat, fromInputFormat } from "./dateUtils";

describe("dateUtils", () => {
  describe("formatDateBR", () => {
    it("should format date to DD-MM-YYYY", () => {
      const date = new Date(2026, 3, 7); // April 7, 2026
      expect(formatDateBR(date)).toBe("07-04-2026");
    });

    it("should handle string dates", () => {
      const dateStr = "2026-04-07";
      expect(formatDateBR(dateStr)).toBe("07-04-2026");
    });

    it("should return empty string for null/undefined", () => {
      expect(formatDateBR(null)).toBe("");
      expect(formatDateBR(undefined)).toBe("");
    });

    it("should pad single digit day and month", () => {
      const date = new Date(2026, 0, 1); // January 1, 2026
      expect(formatDateBR(date)).toBe("01-01-2026");
    });
  });

  describe("parseDateBR", () => {
    it("should parse DD-MM-YYYY format", () => {
      const result = parseDateBR("07-04-2026");
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(7);
      expect(result?.getMonth()).toBe(3); // 0-indexed
      expect(result?.getFullYear()).toBe(2026);
    });

    it("should return null for invalid format", () => {
      expect(parseDateBR("invalid")).toBeNull();
      expect(parseDateBR("07/04/2026")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(parseDateBR("")).toBeNull();
    });
  });

  describe("toInputFormat", () => {
    it("should convert to YYYY-MM-DD format", () => {
      const date = new Date(2026, 3, 7); // April 7, 2026
      expect(toInputFormat(date)).toBe("2026-04-07");
    });

    it("should handle string dates", () => {
      const dateStr = "2026-04-07";
      expect(toInputFormat(dateStr)).toBe("2026-04-07");
    });

    it("should return empty string for null/undefined", () => {
      expect(toInputFormat(null)).toBe("");
      expect(toInputFormat(undefined)).toBe("");
    });
  });

  describe("fromInputFormat", () => {
    it("should parse YYYY-MM-DD format", () => {
      const result = fromInputFormat("2026-04-07");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
    });

    it("should return null for empty string", () => {
      expect(fromInputFormat("")).toBeNull();
    });
  });

  describe("integration", () => {
    it("should convert DD-MM-YYYY to YYYY-MM-DD and back", () => {
      const original = "07-04-2026";
      const parsed = parseDateBR(original);
      const formatted = formatDateBR(parsed);
      expect(formatted).toBe(original);
    });

    it("should convert YYYY-MM-DD to DD-MM-YYYY and back", () => {
      const original = "2026-04-07";
      const parsed = fromInputFormat(original);
      const formatted = toInputFormat(parsed);
      expect(formatted).toBe(original);
    });
  });
});
