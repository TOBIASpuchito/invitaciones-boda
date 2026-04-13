# Invitaciones Boda

MVP en `Nuxt 4 + Tailwind + Supabase` para manejar:

- busqueda inicial por nombre
- invitacion unica por token
- confirmacion RSVP
- persistencia via server routes de Nuxt

## Stack

- `Nuxt 4`
- `Tailwind CSS`
- `Bun`
- `Supabase`

## Flujo actual

1. El invitado entra al enlace general.
2. Escribe su nombre.
3. El sistema busca coincidencias.
4. Selecciona su invitacion unica.
5. Confirma asistencia.

## Modo demo

Si no configuras `Supabase`, la app usa una lista local de ejemplo para que puedas revisar la UX y el flujo completo.

## Variables de entorno

Copia `.env.example` y completa lo necesario.

```bash
cp .env.example .env
```

Variables principales:

- `NUXT_SUPABASE_URL`
- `NUXT_SUPABASE_SERVICE_ROLE_KEY`
- `NUXT_PUBLIC_EVENT_NAME`
- `NUXT_PUBLIC_EVENT_DATE`
- `NUXT_PUBLIC_EVENT_TIME`
- `NUXT_PUBLIC_EVENT_VENUE`
- `NUXT_PUBLIC_EVENT_ADDRESS`
- `NUXT_PUBLIC_EVENT_MAP_URL`
- `NUXT_PUBLIC_RSVP_DEADLINE`

## Base de datos

El esquema inicial esta en `supabase/schema.sql`.

Tablas incluidas:

- `invitations`
- `rsvps`

## Desarrollo

```bash
bun install
bun run dev
```

Servidor local en `http://localhost:3000`.

## Estructura clave

- `app/pages/index.vue`: pantalla de busqueda
- `app/pages/invitacion/[token].vue`: invitacion unica + RSVP
- `server/api/invitations/*`: APIs del MVP
- `server/utils/invitations-repository.ts`: acceso a datos local o Supabase
- `server/data/mock-invitations.ts`: invitados demo

## Siguiente iteracion recomendada

1. Importar tu Excel real a Supabase.
2. Crear panel admin para ver confirmados, pendientes y rechazados.
3. Agregar carga mas precisa por nombre + telefono o alias.
4. Diseñar la invitacion final con branding de la boda.
