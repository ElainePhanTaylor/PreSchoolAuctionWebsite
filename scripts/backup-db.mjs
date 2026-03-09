import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function backup() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL not found in .env')
    process.exit(1)
  }
  console.log('Connecting to:', dbUrl.replace(/:[^:@]+@/, ':***@'))

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to database.\n')

    const tables = [
      'User', 'Item', 'Photo', 'Bid', 'Payment',
      'AuctionSettings', 'Watchlist', 'PasswordResetToken',
      'Account', 'Session', 'VerificationToken'
    ]

    const data = {}

    for (const table of tables) {
      try {
        const quoted = `"${table}"`
        const result = await client.query(`SELECT * FROM ${quoted}`)
        data[table] = result.rows
        console.log(`  ${table}: ${result.rows.length} records`)
      } catch (e) {
        console.log(`  ${table}: skipped (${e.message.split('\n')[0]})`)
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupDir = path.join(__dirname, '..', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const filename = path.join(backupDir, `backup-${timestamp}.json`)
    fs.writeFileSync(filename, JSON.stringify(data, null, 2))

    const totalRecords = Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
    console.log(`\nBackup complete: ${totalRecords} total records`)
    console.log(`Saved to: ${filename}`)
  } catch (error) {
    console.error('Backup failed:', error.message || error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

backup()
