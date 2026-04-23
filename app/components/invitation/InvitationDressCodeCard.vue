<script setup lang="ts">
const dressCodeColors = [
  { name: 'Azul marino',   hex: '#1e3a5f' },
  { name: 'Negro',         hex: '#1c1c1e' },
  { name: 'Gris',          hex: '#7a7a82' },
  { name: 'Vino',          hex: '#6d2b3d' },
  { name: 'Verde oliva',   hex: '#708238' },
  { name: 'Verde botella', hex: '#1b4332' },
  { name: 'Terracota',     hex: '#c1715a' },
  { name: 'Caf\u00e9',         hex: '#6f4e37' },
  { name: 'Camel oscuro',  hex: '#7d5a3c' },
  { name: 'Lavanda',       hex: '#8b80a0' },
  { name: 'Rosa palo',     hex: '#c8a5a5' },
]

const restrictedColors = [
  { name: 'Blanco',  hex: '#f0ece6' },
  { name: 'Beige',   hex: '#d4c5a9' },
  { name: 'Marfil',  hex: '#e8e0d2' },
]
</script>

<template>
  <section
    data-reveal
    data-reveal-delay="0.22"
    class="dress-code mt-8 overflow-hidden rounded-[2rem] border border-white/60 shadow-glow"
  >
    <!-- ── Header ─────────────────────────────── -->
    <div class="dress-code__header">
      <div class="dress-code__ornament" aria-hidden="true">
        <span class="dress-code__ornament-line" />
        <!-- hanger icon -->
        <svg class="dress-code__ornament-icon" viewBox="0 0 32 32" fill="none">
          <path d="M16 4c0 0-4 2.6-4 5.5 0 2.1 1.8 3.8 4 3.8s4-1.7 4-3.8C20 6.6 16 4 16 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M16 13.3L5.5 22A2 2 0 0 0 7 25.5h18A2 2 0 0 0 26.5 22L16 13.3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="dress-code__ornament-line" />
      </div>
      <p class="dress-code__eyebrow">código de vestimenta</p>
      <h2 class="dress-code__title">Elegante &amp; Sobrio</h2>
      <p class="dress-code__subtitle">
        Tonos refinados que funcionan para hombres y mujeres.
        Ven cómodo y con estilo.
      </p>
    </div>

    <!-- ── Body ───────────────────────────────── -->
    <div class="dress-code__body">
      <!-- Allowed swatches -->
      <p class="dress-code__section-label">
        <span class="dress-code__label-line" />
        <span>Paleta sugerida</span>
        <span class="dress-code__label-line" />
      </p>

      <div class="dress-code__swatches">
        <div
          v-for="color in dressCodeColors"
          :key="color.name"
          class="swatch"
        >
          <div
            class="swatch__circle"
            :style="{ background: color.hex }"
            role="img"
            :aria-label="color.name"
          />
          <p class="swatch__name">{{ color.name }}</p>
        </div>
      </div>

      <!-- Restricted -->
      <div class="dress-code__restricted-header">
        <span class="dress-code__restricted-line" />
        <div class="dress-code__restricted-badge">
          <svg viewBox="0 0 20 20" fill="none" class="dress-code__no-icon" aria-hidden="true">
            <circle cx="10" cy="10" r="8.3" stroke="currentColor" stroke-width="1.6" />
            <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <span>Por favor evitar</span>
        </div>
        <span class="dress-code__restricted-line" />
      </div>

      <div class="dress-code__swatches dress-code__swatches--restricted">
        <div
          v-for="color in restrictedColors"
          :key="color.name"
          class="swatch swatch--restricted"
        >
          <div
            class="swatch__circle swatch__circle--restricted"
            :style="{ background: color.hex }"
          >
            <svg class="swatch__x" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <line x1="8" y1="8" x2="32" y2="32" stroke="rgba(90,40,40,0.4)" stroke-width="3" stroke-linecap="round" />
              <line x1="32" y1="8" x2="8" y2="32" stroke="rgba(90,40,40,0.4)" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
          <p class="swatch__name swatch__name--restricted">{{ color.name }}</p>
        </div>
      </div>

      <p class="dress-code__note">
        El protagonismo del blanco es de la novia. Gracias por ayudarnos a
        cuidar la armonía visual de nuestra celebración.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* ── Card shell ───────────────────────────────────────────── */
.dress-code {
  background: linear-gradient(160deg, #fdfaf7 0%, #f8f1ea 100%);
}

/* ── Header ───────────────────────────────────────────────── */
.dress-code__header {
  padding: 2.75rem 2rem 2.25rem;
  text-align: center;
  background:
    radial-gradient(ellipse at 50% -20%, rgba(109, 70, 84, 0.11) 0%, transparent 62%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.55), transparent);
  border-bottom: 1px solid rgba(222, 195, 193, 0.35);
}

.dress-code__ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
  color: rgba(109, 70, 84, 0.45);
}

.dress-code__ornament-line {
  display: block;
  width: 4rem;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(109, 70, 84, 0.28), transparent);
}

.dress-code__ornament-icon {
  width: 1.65rem;
  height: 1.65rem;
  flex-shrink: 0;
}

.dress-code__eyebrow {
  font-size: 0.6rem;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: rgba(109, 70, 84, 0.6);
}

.dress-code__title {
  margin-top: 0.6rem;
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(2rem, 6vw, 2.8rem);
  line-height: 1.04;
  color: #3d2328;
  letter-spacing: 0.01em;
}

.dress-code__subtitle {
  margin: 0.85rem auto 0;
  max-width: 26rem;
  font-size: 0.9rem;
  line-height: 1.75;
  color: rgba(100, 72, 68, 0.72);
}

/* ── Body ─────────────────────────────────────────────────── */
.dress-code__body {
  padding: 2.25rem 2rem 2.75rem;
}

/* section label with side lines */
.dress-code__section-label {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(74, 52, 47, 0.4);
  margin-bottom: 1.75rem;
}

.dress-code__label-line {
  flex: 1;
  display: block;
  height: 1px;
  background: rgba(109, 70, 84, 0.12);
}

/* ── Swatch grid ──────────────────────────────────────────── */
.dress-code__swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: 1.6rem 0.5rem;
}

.swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  cursor: default;
}

.swatch__circle {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  border: 2.5px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 16px rgba(20, 12, 16, 0.16),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.28);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease;
}

.swatch:hover .swatch__circle {
  transform: scale(1.14) translateY(-3px);
  box-shadow:
    0 12px 28px rgba(20, 12, 16, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.28);
}

.swatch__name {
  font-size: 0.67rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: #4a342f;
  text-align: center;
  line-height: 1.35;
}

/* ── Restricted section header ────────────────────────────── */
.dress-code__restricted-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin: 2.25rem 0 1.6rem;
}

.dress-code__restricted-line {
  flex: 1;
  display: block;
  height: 1px;
  background: rgba(180, 80, 90, 0.14);
}

.dress-code__restricted-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(180, 80, 90, 0.2);
  background: rgba(180, 80, 90, 0.05);
  color: rgba(140, 50, 60, 0.65);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  white-space: nowrap;
}

.dress-code__no-icon {
  width: 0.88rem;
  height: 0.88rem;
  flex-shrink: 0;
}

/* ── Restricted swatches ──────────────────────────────────── */
.dress-code__swatches--restricted {
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem 0.5rem;
  max-width: 16rem;
  margin-inline: auto;
}

.swatch--restricted {
  opacity: 0.72;
}

.swatch__circle--restricted {
  border-color: rgba(180, 80, 90, 0.18);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swatch__x {
  width: 58%;
  height: 58%;
  flex-shrink: 0;
}

.swatch__name--restricted {
  color: rgba(100, 60, 65, 0.6);
}

/* ── Closing note ─────────────────────────────────────────── */
.dress-code__note {
  margin: 2.25rem auto 0;
  max-width: 28rem;
  text-align: center;
  font-size: 0.84rem;
  font-style: italic;
  line-height: 1.8;
  color: rgba(100, 74, 70, 0.65);
}
</style>