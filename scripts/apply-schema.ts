import process from 'node:process'
import { readFileSync } from 'node:fs'

import { Pool } from 'pg'

function getEnv(name: string) {
  return process.env[name]?.trim() ?? ''
}

function getSupabaseUrl() {
  return getEnv('NUXT_SUPABASE_URL') || getEnv('SUPABASE_URL')
}

function getDatabasePassword() {
  return getEnv('NUXT_SUPABASE_DB_PASSWORD')
}

function buildConnectionString(supabaseUrl: string, databasePassword: string) {
  const hostname = new URL(supabaseUrl).hostname
  const projectRef = hostname.split('.')[0]

  if (!projectRef) {
    throw new Error('No se pudo inferir el project ref de Supabase desde SUPABASE_URL.')
  }

  return `postgresql://postgres:${encodeURIComponent(databasePassword)}@db.${projectRef}.supabase.co:5432/postgres`
}

async function main() {
  const supabaseUrl = getSupabaseUrl()
  const databasePassword = getDatabasePassword()

  if (!supabaseUrl || !databasePassword) {
    throw new Error('Faltan SUPABASE_URL/NUXT_SUPABASE_URL o NUXT_SUPABASE_DB_PASSWORD en el entorno.')
  }

  const pool = new Pool({
    connectionString: buildConnectionString(supabaseUrl, databasePassword),
    max: 1,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    const sql = readFileSync('supabase/schema.sql', 'utf8')
    await pool.query(sql)
    console.log('Schema aplicado correctamente.')
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})