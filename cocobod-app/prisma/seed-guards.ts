import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const guards = [
  { fullName: 'Ayitey Prince', staffId: 'GD001' },
  { fullName: 'Martin Korang', staffId: 'GD002' },
  { fullName: 'Fortunate Erzuah', staffId: 'GD003' },
  { fullName: 'Emmanuel Cudjoe', staffId: 'GD004' },
  { fullName: 'Belinda Semefa', staffId: 'GD005' },
  { fullName: 'Prah Joshua Kwame', staffId: 'GD006' },
  { fullName: 'Stephen Benianah', staffId: 'GD007' },
  { fullName: 'Richmond Fosu', staffId: 'GD008' },
  { fullName: 'Abigail Aidoo', staffId: 'GD009' },
  { fullName: 'Vida Daboro', staffId: 'GD010' },
  { fullName: 'Samuel Nii', staffId: 'GD011' },
  { fullName: 'Patience Essuman', staffId: 'GD012' },
  { fullName: 'Justine Dotse', staffId: 'GD013' },
  { fullName: 'Derrick Mills', staffId: 'GD014' },
  { fullName: 'Francis Bintel Bichutab', staffId: 'GD015' },
  { fullName: 'Genevieve Akwensivie', staffId: 'GD016' },
  { fullName: 'Divine Amevialor', staffId: 'GD017' },
  { fullName: 'Justice Mensah', staffId: 'GD018' },
  { fullName: 'Simon Peter', staffId: 'GD019' },
  { fullName: 'Harrison Benard', staffId: 'GD020' },
  { fullName: 'Oti Anthony', staffId: 'GD021' },
  { fullName: 'Dorcas Amobeah Attoh', staffId: 'GD022' },
  { fullName: 'Mawunyo Azumah', staffId: 'GD023' },
  { fullName: 'Wilma Amuzu', staffId: 'GD024' },
  { fullName: 'Godfred Adom', staffId: 'GD025' },
  { fullName: 'Faustina Donkor', staffId: 'GD026' },
  { fullName: 'Mariam Obeng', staffId: 'GD027' },
  { fullName: 'Augustine Asiedu Yeboah', staffId: 'GD028' },
  { fullName: 'Nathaniel Kumah', staffId: 'GD029' },
  { fullName: 'Fredrick Akuffo', staffId: 'GD030' },
  { fullName: 'Francisca Tetteh', staffId: 'GD031' },
  { fullName: 'Kingsford Aggrey', staffId: 'GD032' },
  { fullName: 'Justice Akromah', staffId: 'GD033' },
  { fullName: 'Akosua Asante Asare', staffId: 'GD034' },
  { fullName: 'Emmanuel Amankwah', staffId: 'GD035' },
  { fullName: 'Anita Sefakor Owusu', staffId: 'GD036' },
  { fullName: 'Michael Ahiavor', staffId: 'GD037' },
  { fullName: 'Ebenezer K. Arthur', staffId: 'GD038' },
  { fullName: 'Kingsley Nartey', staffId: 'GD039' },
  { fullName: 'Ujakpo Ebenezer', staffId: 'GD040' },
  { fullName: 'Fortunate Erzuah', staffId: 'GD041' },
]

async function main() {
  console.log('Starting to seed guards...')
  const defaultPassword = await bcrypt.hash('guard123', 10)

  for (const guard of guards) {
    try {
      await prisma.guard.upsert({
        where: { staffId: guard.staffId },
        update: { fullName: guard.fullName },
        create: {
          staffId: guard.staffId,
          fullName: guard.fullName,
          username: guard.staffId.toLowerCase(),
          passwordHash: defaultPassword,
          status: 'ACTIVE',
        },
      })
      console.log(`✓ Added/Updated guard: ${guard.fullName} (${guard.staffId})`)
    } catch (error) {
      console.error(`✗ Failed to add guard: ${guard.fullName}`, error)
    }
  }

  console.log('Seeding guards completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
