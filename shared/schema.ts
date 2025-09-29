import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  currentRole: text("current_role").notNull(),
  targetRole: text("target_role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(),
  duration: integer("duration"), // in seconds
  score: integer("score"), // 0-100
  feedback: jsonb("feedback"), // detailed feedback object
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  currentRole: true,
  targetRole: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).pick({
  userId: true,
  role: true,
  duration: true,
  score: true,
  feedback: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

// Common role options
export const ROLE_OPTIONS = [
  { value: "software-engineer", label: "Software Engineer", icon: "Code" },
  { value: "product-manager", label: "Product Manager", icon: "Layers" },
  { value: "data-scientist", label: "Data Scientist", icon: "BarChart3" },
  { value: "designer", label: "UX/UI Designer", icon: "Palette" },
  { value: "marketing", label: "Marketing Manager", icon: "TrendingUp" },
  { value: "sales", label: "Sales Representative", icon: "Users" },
  { value: "consultant", label: "Management Consultant", icon: "Briefcase" },
  { value: "analyst", label: "Business Analyst", icon: "PieChart" },
] as const;
