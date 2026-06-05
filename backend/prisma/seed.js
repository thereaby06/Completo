const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with all roles...');
  
  const saltRounds = 10;
  
  // 1. Admin / Dueño
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'admin@workshop.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@workshop.com',
      password: adminPassword,
      name: 'Dueño del Taller',
      role: 'ADMIN',
    },
  });

  // 2. Recepcionista
  const recepPassword = await bcrypt.hash('recep123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'recepcion@workshop.com' },
    update: { password: recepPassword },
    create: {
      email: 'recepcion@workshop.com',
      password: recepPassword,
      name: 'Recepcionista Principal',
      role: 'RECEPCIONIST',
    },
  });

  // 3. Mecánico
  const mecaPassword = await bcrypt.hash('meca123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'mecanico@workshop.com' },
    update: { password: mecaPassword },
    create: {
      email: 'mecanico@workshop.com',
      password: mecaPassword,
      name: 'Mecánico Senior',
      role: 'MECHANIC',
    },
  });

  // 4. Cliente (para pruebas de seguimiento)
  const clientPassword = await bcrypt.hash('cliente123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: { password: clientPassword },
    create: {
      email: 'cliente@ejemplo.com',
      password: clientPassword,
      name: 'Juan Pérez',
      role: 'CLIENT',
    },
  });

  console.log('Seed completed: All roles created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
