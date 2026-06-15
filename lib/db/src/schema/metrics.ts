import { pgTable, text, serial, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const metricsTable = pgTable("pwn_metrics", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  category: text("category").notNull(),
  challengesSolved: integer("challenges_solved").notNull(),
  difficulty: text("difficulty").notNull(),
  notes: text("notes").notNull().default(""),
});

export const insertMetricSchema = createInsertSchema(metricsTable).omit({ id: true });
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metricsTable.$inferSelect;
