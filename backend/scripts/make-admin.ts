import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const userCount = await prisma.user.count();
  console.log(`Found ${userCount} users`);

  if (userCount === 0) {
    // No users, create an admin user
    const email = 'admin@example.com';
    const name = 'Admin';
    const password = 'admin123'; // Change this in production!
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin',
        preferences: {
          theme: 'system',
          notifications: true,
        },
        subscription: {
          plan: 'free',
          credits: 5,
        },
      },
    });

    console.log(`Created admin user: ${user.email} with role ${user.role}`);
    console.log(`Please change the password after first login!`);
  } else {
    // There are users, set the first user to admin and set a known password
    const user = await prisma.user.findFirst();
    if (user) {
      const password = 'admin123'; // Change this in production!
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: 'admin',
          password: hashedPassword,
        },
      });
      console.log(`Set user ${user.email} role to admin and password to ${password}`);
      console.log(`Please change the password after first login!`);
    } else {
      console.log('No users found?');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
