<script setup lang="ts">
const copied = ref<'account' | 'email' | null>(null)

async function copy(text: string, key: 'account' | 'email') {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = null }, 2000)
}
</script>

<template>
  <div data-reveal class="gift-section">
    <!-- Encabezado -->
    <div class="gift-header">
      <div class="gift-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 12v10H4V12"/>
          <path d="M22 7H2v5h20V7z"/>
          <line x1="12" y1="22" x2="12" y2="7"/>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
      </div>
      <div class="gift-header-text">
        <p class="gift-eyebrow">Regalo</p>
        <p class="gift-phrase">
          Tu presencia es nuestro mayor regalo. Si deseas sumarte con un obsequio, aquí están los datos:
        </p>
      </div>
    </div>

    <!-- Tarjeta bancaria -->
    <div class="gift-card">

      <!-- Banco -->
      <div class="gift-bank-header">
        <span class="gift-bank-name">Banco Pichincha</span>
      </div>

      <div class="gift-divider" />

      <!-- Datos en grid 2 col -->
      <div class="gift-grid">
        <div class="gift-item">
          <span class="gift-item-label">Titular</span>
          <span class="gift-item-value">Cindy Buenaventura</span>
        </div>
        <div class="gift-item">
          <span class="gift-item-label">Tipo</span>
          <span class="gift-item-value">Ahorro</span>
        </div>
        <div class="gift-item">
          <span class="gift-item-label">Número</span>
          <span class="gift-item-value gift-item-value--mono">2215758251</span>
        </div>
        <div class="gift-item">
          <span class="gift-item-label">Cédula</span>
          <span class="gift-item-value gift-item-value--mono">2300340037</span>
        </div>
        <div class="gift-item gift-item--full">
          <span class="gift-item-label">Correo</span>
          <span class="gift-item-value gift-item-value--mono">cindy.jcr@hotmail.com</span>
        </div>
      </div>

      <!-- Botones -->
      <div class="gift-actions">
        <button
          class="gift-btn gift-btn--primary"
          :class="{ 'gift-btn--done': copied === 'account' }"
          @click="copy('2215758251', 'account')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ copied === 'account' ? '¡Número copiado!' : 'Copiar número de cuenta' }}
        </button>

        <button
          class="gift-btn gift-btn--ghost"
          :class="{ 'gift-btn--done': copied === 'email' }"
          @click="copy('cindy.jcr@hotmail.com', 'email')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ copied === 'email' ? '¡Correo copiado!' : 'Copiar correo' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gift-section {
  margin-top: 2rem;
}

/* ── header ───────────────────────────────────────────── */
.gift-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.1rem;
}

.gift-icon {
  flex-shrink: 0;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.75rem;
  background: rgba(180, 80, 90, 0.08);
  color: rgba(140, 50, 65, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.gift-icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.gift-header-text {
  min-width: 0;
  width: 100%;
}

.gift-eyebrow {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(100, 70, 75, 0.55);
  margin-bottom: 0.25rem;
}

.gift-phrase {
  font-size: 0.83rem;
  line-height: 1.6;
  color: rgba(60, 40, 45, 0.68);
}

/* ── card ─────────────────────────────────────────────── */
.gift-card {
  border-radius: 1.5rem;
  border: 1px solid rgba(222, 195, 193, 0.55);
  background: linear-gradient(150deg, #ffffff 0%, #fdf4f5 100%);
  padding: 1.35rem;
  box-shadow:
    0 2px 14px rgba(120, 60, 70, 0.07),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── bank header ──────────────────────────────────────── */
.gift-bank-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.gift-bank-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: #e8223c;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
}

.gift-bank-name {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(80, 50, 55, 0.65);
}

.gift-divider {
  height: 1px;
  background: rgba(222, 195, 193, 0.45);
  margin: 0.9rem 0;
}

/* ── data grid ────────────────────────────────────────── */
.gift-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem 1rem;
}

.gift-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.gift-item--full {
  grid-column: 1 / -1;
}

.gift-item-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(100, 70, 75, 0.48);
}

.gift-item-value {
  font-family: var(--font-display, Georgia, serif);
  font-size: 0.92rem;
  color: #4a2830;
  word-break: break-word;
}

.gift-item-value--mono {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
}

/* ── buttons ──────────────────────────────────────────── */
.gift-actions {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.gift-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: 9999px;
  border: 1.5px solid transparent;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, border-color 0.2s;
}

.gift-btn svg {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

.gift-btn--primary {
  background: #4a2830;
  color: #fff;
  border-color: #4a2830;
}

.gift-btn--primary:hover {
  background: #7a1f35;
  border-color: #7a1f35;
  transform: translateY(-1px);
}

.gift-btn--ghost {
  background: transparent;
  color: #4a2830;
  border-color: rgba(74, 40, 48, 0.3);
}

.gift-btn--ghost:hover {
  background: rgba(74, 40, 48, 0.05);
  transform: translateY(-1px);
}

.gift-btn--done {
  background: #166534 !important;
  border-color: #166534 !important;
  color: #fff !important;
}
</style>
