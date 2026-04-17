export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  nitro: {
    experimental: {
      tasks: true,
    },
  },
  runtimeConfig: {
    supabaseUrl: process.env.NUXT_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
    supabaseKey: process.env.NUXT_SUPABASE_KEY ?? process.env.SUPABASE_KEY ?? '',
    supabaseServiceRoleKey: process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY ?? '',
    supabaseDbPassword: process.env.NUXT_SUPABASE_DB_PASSWORD ?? '',
    adminPassword: process.env.NUXT_ADMIN_PASSWORD ?? '',
    public: {
      eventName: process.env.NUXT_PUBLIC_EVENT_NAME ?? 'Boda de Camila & Andres',
      eventDate: process.env.NUXT_PUBLIC_EVENT_DATE ?? 'Sabado 14 de febrero de 2026',
      eventTime: process.env.NUXT_PUBLIC_EVENT_TIME ?? '16:00',
      eventVenue: process.env.NUXT_PUBLIC_EVENT_VENUE ?? 'Hacienda Jardin de Abril',
      eventAddress: process.env.NUXT_PUBLIC_EVENT_ADDRESS ?? 'Quito, Ecuador',
      eventMapUrl: process.env.NUXT_PUBLIC_EVENT_MAP_URL ?? 'https://maps.google.com',
      rsvpDeadline: process.env.NUXT_PUBLIC_RSVP_DEADLINE ?? '31 de enero de 2026',
      usingSupabase: Boolean(
        (process.env.NUXT_SUPABASE_URL ?? process.env.SUPABASE_URL)
        && (
          process.env.NUXT_SUPABASE_DB_PASSWORD
          || process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY
        ),
      ),
    },
  },
  tailwindcss: {
    viewer: false,
  },
})
