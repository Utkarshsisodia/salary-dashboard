import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  pgEnum 
} from 'drizzle-orm/pg-core';

// 1. Enums
export const roleEnum = pgEnum('role', ['admin', 'employee']);

// 2. Tables
export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').default('employee').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const salaries = pgTable('salaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Cascading delete ensures no orphaned salary records if an employee is removed
  employeeId: uuid('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull(),
  // Always store currency in the lowest denominator (cents) to avoid floating-point math errors
  baseAmount: integer('base_amount').notNull(), 
  bonus: integer('bonus').default(0).notNull(),
  effectiveDate: timestamp('effective_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Relations
// This allows Drizzle's query builder to automatically fetch related data
export const employeesRelations = relations(employees, ({ many }) => ({
  salaries: many(salaries),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  employee: one(employees, {
    fields: [salaries.employeeId],
    references: [employees.id],
  }),
}));