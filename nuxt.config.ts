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
      eventName: 'Cindy & Marcelo',
      eventDate: '25 de julio de 2026',
      eventTime: '14h00',
      eventVenue: 'Quinta Boutique Kristal',
      eventAddress: 'Principal de San Francisco de Alpahuma. Valle de los Chillos — Quito',
      eventMapUrl: 'https://www.google.com/maps/place/Quinta+Krystal+Hotel+Boutique/@-0.3423903,-78.4017385,17z/data=!3m1!4b1!4m9!3m8!1s0x91d5bde0cde41817:0xe919a005646f845d!5m2!4m1!1i2!8m2!3d-0.3423903!4d-78.4017385!16s%2Fg%2F11hf8477wj?entry=tts',
      rsvpDeadline: '30 de junio de 2026',
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
