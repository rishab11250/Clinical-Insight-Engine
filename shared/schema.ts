import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type AssessmentFactor = {
  name: string;
  impact: "positive" | "negative";
  description: string;
};

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  gender: text("gender").notNull(), // 'Male', 'Female', 'Other'
  age: integer("age").notNull(),
  hypertension: boolean("hypertension").notNull(),
  heartDisease: boolean("heart_disease").notNull(),
  smokingHistory: text("smoking_history").notNull(), // 'never', 'current', 'former', etc.
  bmi: text("bmi").notNull(),
  hba1cLevel: text("hba1c_level").notNull(),
  bloodGlucoseLevel: text("blood_glucose_level").notNull(),
  
  // Model Outputs
  riskScore: text("risk_score").notNull(), // 0-100 percentage
  riskCategory: text("risk_category").notNull(), // 'LOW', 'MODERATE', 'HIGH'
  factors: jsonb("factors").$type<AssessmentFactor[]>().notNull(),
  confidenceInterval: jsonb("confidence_interval").$type<string | null>(),
  modelConfidence: text("model_confidence"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentSchema = createInsertSchema(assessments, {
  age: z.coerce.number().min(1).max(120),
  bmi: z.coerce.number().min(10).max(60),
  hba1cLevel: z.coerce.number().min(3).max(15),
  bloodGlucoseLevel: z.coerce.number().min(50).max(400),
  hypertension: z.boolean(),
  heartDisease: z.boolean(),
}).omit({
  id: true,
  riskScore: true,
  riskCategory: true,
  factors: true,
  confidenceInterval: true,
  modelConfidence: true,
  createdAt: true
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
