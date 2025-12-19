import { relations } from 'drizzle-orm';
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull().unique(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  notes: many(notes),
}));

export const notes = pgTable('notes', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: integer('user_id').references(() => usersTable.id),
});

export const notesRelations = relations(notes, ({ one }) => ({
  users: one(usersTable, {
    fields: [notes.user_id],
    references: [usersTable.id],
  }),
}));
