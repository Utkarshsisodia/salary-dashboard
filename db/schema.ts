import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  bigint,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "employee"]);

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: roleEnum("role").default("employee").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salaries = pgTable("salaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .references(() => employees.id, { onDelete: "cascade" })
    .notNull(),
  baseAmount: bigint("base_amount", { mode: "number" }).notNull(),
  bonus: bigint("bonus", { mode: "number" }).default(0).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .references(() => employees.id, { onDelete: "cascade" })
    .notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  salaries: many(salaries),
  attendance: many(attendance),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  employee: one(employees, {
    fields: [salaries.employeeId],
    references: [employees.id],
  }),
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(employees, {
    fields: [auditLogs.actorId],
    references: [employees.id],
  }),
}));
