import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create user role enum
export const userRoleEnum = pgEnum('user_role', ['tenant', 'landlord', 'admin']);

// User table with extended properties
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default('tenant'),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  clerkId: text("clerk_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  rent: integer("rent").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFeet: integer("square_feet"),
  available: boolean("available").default(true),
  availableDate: timestamp("available_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lease table
export const leases = pgTable("leases", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  tenantId: integer("tenant_id").references(() => users.id),
  landlordId: integer("landlord_id").references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRent: integer("monthly_rent").notNull(),
  securityDeposit: integer("security_deposit"),
  status: text("status").default('pending'), // pending, active, expired, terminated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  leaseId: integer("lease_id").references(() => leases.id),
  tenantId: integer("tenant_id").references(() => users.id),
  landlordId: integer("landlord_id").references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // rent, deposit, fee, etc.
  status: text("status").default('pending'), // pending, complete, failed, refunded
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// TenantScore table
export const tenantScores = pgTable("tenant_scores", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => users.id).notNull(),
  landlordId: integer("landlord_id").references(() => users.id),
  propertyId: integer("property_id").references(() => properties.id),
  applicationId: integer("application_id"),
  overallScore: integer("overall_score").notNull(),
  creditScore: integer("credit_score"),
  incomeToRentRatio: integer("income_to_rent_ratio"),
  rentalHistory: integer("rental_history"),
  employmentStability: integer("employment_stability"),
  identityVerificationScore: integer("identity_verification_score"),
  referenceScore: integer("reference_score"),
  applicationQualityScore: integer("application_quality_score"),
  paymentHistoryScore: integer("payment_history_score"),
  promptnessScore: integer("promptness_score"),
  evictionHistoryScore: integer("eviction_history_score"),
  criminalCheckScore: integer("criminal_check_score"),
  scoreBreakdown: text("score_breakdown"),
  scoringMethod: text("scoring_method"),
  active: boolean("active").default(true),
  scoredAt: timestamp("scored_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create schema for user insert
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  clerkId: true,
});

// Create schema for property insert
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create schema for lease insert
export const insertLeaseSchema = createInsertSchema(leases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create schema for payment insert
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Create schema for tenant score insert
export const insertTenantScoreSchema = createInsertSchema(tenantScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertLease = z.infer<typeof insertLeaseSchema>;
export type Lease = typeof leases.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertTenantScore = z.infer<typeof insertTenantScoreSchema>;
export type TenantScore = typeof tenantScores.$inferSelect;
