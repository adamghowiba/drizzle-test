import { relations } from 'drizzle-orm';
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const usersTable = pgTable('users', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull().unique(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  notes: many(notes),
}));

export const notes = pgTable('notes', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  user_id: text('user_id').references(() => usersTable.id),
});

export const notesRelations = relations(notes, ({ one }) => ({
  users: one(usersTable, {
    fields: [notes.user_id],
    references: [usersTable.id],
  }),
}));
