import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

async function backup() {
  const prisma = new PrismaClient()

  try {
    console.log('Starting database backup...\n')

    const data: Record<string, unknown[]> = {}

    const models = [
      { name: 'users', query: () => prisma.user.findMany() },
      { name: 'items', query: () => prisma.item.findMany() },
      { name: 'photos', query: () => prisma.photo.findMany() },
      { name: 'bids', query: () => prisma.bid.findMany() },
      { name: 'payments', query: () => prisma.payment.findMany() },
      { name: 'auctionSettings', query: () => prisma.auctionSettings.findMany() },
      { name: 'watchlists', query: () => prisma.watchlist.findMany() },
      { name: 'passwordResetTokens', query: () => prisma.passwordResetToken.findMany() },
      { name: 'accounts', query: () => prisma.account.findMany() },
      { name: 'sessions', query: () => prisma.session.findMany() },
    ]

    for (const model of models) {
      try {
        const records = await model.query()
        data[model.name] = records
        console.log(`  ${model.name}: ${records.length} records`)
      } catch (e) {
        console.log(`  ${model.name}: skipped (${(e as Error).message})`)
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const filename = path.join(backupDir, `backup-${timestamp}.json`)
    fs.writeFileSync(filename, JSON.stringify(data, null, 2))

    const totalRecords = Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
    console.log(`\nBackup complete: ${totalRecords} total records`)
    console.log(`Saved to: ${filename}`)
  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

backup()
