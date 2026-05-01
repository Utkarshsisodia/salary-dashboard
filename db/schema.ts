import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  bigint,
  boolean
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "employee"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(), // Better Auth prefers text IDs by default
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  role: roleEnum("role").default("employee").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const salaries = pgTable("salaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: text("employee_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  baseAmount: bigint("base_amount", { mode: "number" }).notNull(),
  bonus: bigint("bonus", { mode: "number" }).default(0).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: text("employee_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id").references(() => user.id, {
    onDelete: "set null",
  }),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  salaries: many(salaries),
  attendance: many(attendance),
  auditLogs: many(auditLogs),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  employee: one(user, {
    fields: [salaries.employeeId],
    references: [user.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(user, {
    fields: [attendance.employeeId],
    references: [user.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(user, {
    fields: [auditLogs.actorId],
    references: [user.id],
  }),
}));