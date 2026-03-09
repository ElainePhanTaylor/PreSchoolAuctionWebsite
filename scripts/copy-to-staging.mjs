import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROD_URL = process.env.PROD_DATABASE_URL
const STAGING_URL = process.env.STAGING_DATABASE_URL

if (!PROD_URL || !STAGING_URL) {
  console.error('Set PROD_DATABASE_URL and STAGING_DATABASE_URL')
  process.exit(1)
}

async function copy() {
  const prod = new pg.Client({ connectionString: PROD_URL, ssl: { rejectUnauthorized: false } })
  const staging = new pg.Client({ connectionString: STAGING_URL, ssl: { rejectUnauthorized: false } })

  try {
    await prod.connect()
    await staging.connect()
    console.log('Connected to both databases.\n')

    const tables = [
      { name: 'User', quoted: '"User"' },
      { name: 'Item', quoted: '"Item"' },
      { name: 'Photo', quoted: '"Photo"' },
      { name: 'Bid', quoted: '"Bid"' },
      { name: 'Payment', quoted: '"Payment"' },
      { name: 'AuctionSettings', quoted: '"AuctionSettings"' },
      { name: 'Watchlist', quoted: '"Watchlist"' },
      { name: 'PasswordResetToken', quoted: '"PasswordResetToken"' },
    ]

    for (const table of tables) {
      try {
        const result = await prod.query(`SELECT * FROM ${table.quoted}`)
        if (result.rows.length === 0) {
          console.log(`  ${table.name}: 0 records (skipped)`)
          continue
        }

        await staging.query(`DELETE FROM ${table.quoted}`)

        const columns = Object.keys(result.rows[0])
        const quotedCols = columns.map(c => `"${c}"`).join(', ')

        for (const row of result.rows) {
          const values = columns.map((_, i) => `$${i + 1}`)
          const params = columns.map(c => row[c])
          await staging.query(
            `INSERT INTO ${table.quoted} (${quotedCols}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING`,
            params
          )
        }

        console.log(`  ${table.name}: ${result.rows.length} records copied`)
      } catch (e) {
        console.log(`  ${table.name}: error - ${e.message.split('\n')[0]}`)
      }
    }

    console.log('\nData copy complete!')
  } catch (error) {
    console.error('Copy failed:', error.message)
    process.exit(1)
  } finally {
    await prod.end()
    await staging.end()
  }
}

copy()
