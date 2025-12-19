import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { db } from 'src/drizzle-client';
import { notesTable, notesRelations, usersTable } from 'src/db/schema';
import { and, eq, exists, ilike } from 'drizzle-orm';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async listUsers() {
    const users = await db.query.usersTable.findMany({
      
      with: {
        notes: true,
      },
    });

    return users;
  }

  @Get('create')
  async createUser() {
    const user = await db.transaction(async (tx) => {
      const [user] = await db
        .insert(usersTable)
        .values({
          first_name: 'John',
          last_name: 'Doe',
          email: `john@webrevived.com`,
        })
        .returning();

      const notes = await tx.insert(notesTable).values({
        content: 'This is a note for John Doe',
        user_id: user.id,
      });

      return user;
    });

    return user;
  }

  @Get('update-user')
  async updateUser(): Promise<typeof usersTable.$inferInsert> {
    const [user] = await db
      .update(usersTable)
      .set({
        first_name: 'Found a target',
      })
      .where(
        exists(
          db
            .select()
            .from(notesTable)
            .where(
              and(
                eq(notesTable.user_id, usersTable.id),
                ilike(notesTable.content, '%adawdadw%'),
              ),
            ),
        ),
      )
      .returning();

    return user || [];
  }
}
