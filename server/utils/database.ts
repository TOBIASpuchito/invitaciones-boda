import { Pool } from 'pg'
import { useRuntimeConfig } from '#imports'

let databasePool: Pool | null = null
let cachedConnectionString = ''

function buildDatabaseConnectionString(supabaseUrl: string, databasePassword: string) {
  try {
    const hostname = new URL(supabaseUrl).hostname

    // Solo construir la conexión directa para proyectos alojados en supabase.co
    if (!hostname.endsWith('.supabase.co')) {
      return null
    }

    const projectRef = hostname.split('.')[0]

    if (!projectRef) {
      return null
    }

    return `postgresql://postgres:${encodeURIComponent(databasePassword)}@db.${projectRef}.supabase.co:5432/postgres`
  } catch {
    return null
  }
}

export function getSupabaseDatabasePool() {
  const config = useRuntimeConfig()

  if (!config.supabaseUrl || !config.supabaseDbPassword) {
    return null
  }

  const connectionString = buildDatabaseConnectionString(config.supabaseUrl, config.supabaseDbPassword)

  if (!connectionString) {
    return null
  }

  if (!databasePool || cachedConnectionString !== connectionString) {
    databasePool = new Pool({
      connectionString,
      max: 5,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    cachedConnectionString = connectionString
  }

  return databasePool
}