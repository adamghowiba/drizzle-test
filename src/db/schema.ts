import { relations, sql } from 'drizzle-orm';
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { vector } from 'drizzle-orm/pg-core';
import { index } from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const usersTable = pgTable('users', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull().unique()
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  notes: many(notesTable),
}));

export const notesTable = pgTable(
  'notes',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text(),
    content: text().notNull(),
    search: tsvector('search')
      .notNull()
      .generatedAlwaysAs(
        () => sql`
          setweight(to_tsvector('english', ${notesTable.title}), 'A')
          ||
          setweight(to_tsvector('english', ${notesTable.content}), 'B')
        `,
      ),
    user_id: text().references(() => usersTable.id),
  },
  (t) => [index('notes_search_gin_idx').using('gin', t.search)],
);

export const notesRelations = relations(notesTable, ({ one }) => ({
  users: one(usersTable, {
    fields: [notesTable.user_id],
    references: [usersTable.id],
  }),
}));
