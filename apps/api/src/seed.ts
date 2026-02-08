import { hash } from 'bcrypt';
import { db } from './db';

const USERS = ['oliver', 'greg', 'alice', 'oscar'] as const;

async function main() {
  const password = await hash('password', 8);
  for (const username of USERS) {
    await db.user.upsert({
      where: { username },
      update: { password },
      create: { username, password },
    });
  }
  console.log('Seeded users:', USERS.join(', '), '(password: password)');

  const oscar = await db.user.findUnique({ where: { username: 'oscar' } });
  const alice = await db.user.findUnique({ where: { username: 'alice' } });
  if (oscar && alice) {
    let thread = await db.thread.findFirst({
      where: {
        participants: { some: { userId: oscar.id } },
        AND: [{ participants: { some: { userId: alice.id } } }],
      },
      include: { participants: true },
    });
    if (!thread || thread.participants.length !== 2) {
      thread = await db.thread.create({
        data: {
          participants: {
            createMany: {
              data: [{ userId: oscar.id }, { userId: alice.id }],
            },
          },
        },
        include: { participants: true },
      });
    }
    const existing = await db.message.count({ where: { threadId: thread.id } });
    if (existing === 0) {
      await db.message.createMany({
        data: [
          { threadId: thread.id, senderId: oscar.id, content: 'Hey Alice!' },
          { threadId: thread.id, senderId: alice.id, content: 'Hi Oscar 👋' },
          { threadId: thread.id, senderId: oscar.id, content: 'How are you?' },
          { threadId: thread.id, senderId: alice.id, content: 'Good, you?' },
        ],
      });
      console.log('Seeded thread: Oscar <-> Alice with 4 messages');
    }
  }
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect().finally(() => process.exit(1));
  });
