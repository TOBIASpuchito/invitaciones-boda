# Invitaciones Boda

MVP en `Nuxt 4 + Tailwind + Supabase` para manejar:

- búsqueda inicial por nombre
- invitación única por token
- confirmación RSVP
- persistencia vía server routes de Nuxt

## Stack

- `Nuxt 4`
- `Tailwind CSS`
- `Bun`
- `Supabase`

## Flujo actual

1. El invitado entra al enlace general.
2. Escribe su nombre.
3. El sistema busca coincidencias.
4. Selecciona su invitación única.
5. Confirma asistencia.

## Variables de entorno

Copia `.env.example` y completa lo necesario.

```bash
cp .env.example .env
```

Variables principales:

- `NUXT_SUPABASE_URL`
- `NUXT_SUPABASE_SERVICE_ROLE_KEY` o `NUXT_SUPABASE_DB_PASSWORD`
- `NUXT_PUBLIC_EVENT_NAME`
- `NUXT_PUBLIC_EVENT_DATE`
- `NUXT_PUBLIC_EVENT_TIME`
- `NUXT_PUBLIC_EVENT_VENUE`
- `NUXT_PUBLIC_EVENT_ADDRESS`
- `NUXT_PUBLIC_EVENT_MAP_URL`
- `NUXT_PUBLIC_RSVP_DEADLINE`

## Base de datos

El esquema inicial está en `supabase/schema.sql`.

Tablas incluidas:

- `invitations`
- `rsvps`

## Desarrollo

```bash
bun install
bun run dev
```

Si faltan credenciales de `Supabase` o `Postgres`, la app falla de forma explícita y no usa datos falsos.

Servidor local en `http://localhost:3000`.

## Despliegue con Dockploy

El repositorio queda listo para desplegarse desde `Dockerfile`.

Pasos recomendados en Dockploy:

1. Crear un servicio tipo `Dockerfile` apuntando a este repositorio.
2. Usar el puerto interno `3000`.
3. Cargar las variables del archivo `.env.example` y completar al menos:
	- `NUXT_SUPABASE_URL`
	- `NUXT_SUPABASE_KEY`
	- `NUXT_SUPABASE_SERVICE_ROLE_KEY` o `NUXT_SUPABASE_DB_PASSWORD`
	- `NUXT_ADMIN_PASSWORD`
4. Si la instancia de Supabase es nueva, ejecutar antes el esquema de `supabase/schema.sql`.

La imagen compila la app con `bun` y ejecuta Nitro en producción con `node` sobre `0.0.0.0:3000`.

## Estructura clave

- `app/pages/index.vue`: pantalla de búsqueda
- `app/pages/invitacion/[token].vue`: invitación única + RSVP
- `server/api/invitations/*`: APIs del MVP
- `server/utils/invitations-repository.ts`: acceso a datos en Supabase/Postgres

## Eliminar un invitado

El borrado de un invitado también elimina sus RSVP por la relación `on delete cascade` en la tabla `rsvps`.

```bash
npm run delete-guest -- --token "jean-buenaventura"
```

Tambien puedes borrar por `id`:

```bash
npm run delete-guest -- --id "uuid-del-invitado"
```

## Siguiente iteración recomendada

1. Importar tu Excel real a Supabase.
2. Crear panel admin para ver confirmados, pendientes y rechazados.
3. Agregar carga más precisa por nombre + teléfono o alias.
4. Diseñar la invitación final con branding de la boda.
