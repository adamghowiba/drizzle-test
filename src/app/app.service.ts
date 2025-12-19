import { Injectable } from '@nestjs/common';
import { db } from 'src/drizzle-client';

@Injectable()
export class AppService {
  async getHello() {
    const users = await db.query.usersTable.findMany({
      with: {
        notes: true,
      },
    });

    return users;
  }
}
