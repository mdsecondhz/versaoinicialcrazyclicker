import { pgTable, serial, text, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gameSavesTable = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  energy: numeric("energy", { precision: 20, scale: 4 }).notNull().default("0"),
  energyPerClick: numeric("energy_per_click", { precision: 20, scale: 4 }).notNull().default("1"),
  energyPerSecond: numeric("energy_per_second", { precision: 20, scale: 4 }).notNull().default("0"),
  upgradeCounts: jsonb("upgrade_counts").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGameSaveSchema = createInsertSchema(gameSavesTable).omit({ id: true, updatedAt: true });
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type GameSave = typeof gameSavesTable.$inferSelect;
