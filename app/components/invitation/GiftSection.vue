<script setup lang="ts">
const copied = ref<'account' | 'email' | null>(null)

async function copy(text: string, key: 'account' | 'email') {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = null }, 2000)
}
</script>

<template>
  <div class="gift-section">
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
      <div>
        <p class="gift-eyebrow">Regalo</p>
        <p class="gift-phrase">
          Agradecemos tu regalo. Tu presencia es lo que más nos importa, pero si deseas compartir este momento con un obsequio, te dejamos los datos:
        </p>
      </div>
    </div>

    <div class="gift-card">
      <p class="gift-bank">
        <span class="gift-bank-logo">B</span> Banco Pichincha
      </p>

      <div class="gift-rows">
        <div class="gift-row">
          <span class="gift-row-label">Titular</span>
          <span class="gift-row-value">Cindy Buenaventura</span>
        </div>
        <div class="gift-row">
          <span class="gift-row-label">Tipo</span>
          <span class="gift-row-value">Cuenta de ahorro</span>
        </div>
        <div class="gift-row">
          <span class="gift-row-label">Número</span>
          <span class="gift-row-value">2215758251</span>
        </div>
        <div class="gift-row">
          <span class="gift-row-label">Cédula</span>
          <span class="gift-row-value">2300340037</span>
        </div>
        <div class="gift-row">
          <span class="gift-row-label">Correo</span>
          <span class="gift-row-value gift-row-value--small">cindy.jcr@hotmail.com</span>
        </div>
      </div>

      <div class="gift-actions">
        <button class="gift-copy-btn" @click="copy('2215758251', 'account')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ copied === 'account' ? '¡Copiado!' : 'Copiar número de cuenta' }}
        </button>

        <button class="gift-copy-btn gift-copy-btn--secondary" @click="copy('cindy.jcr@hotmail.com', 'email')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ copied === 'email' ? '¡Copiado!' : 'Copiar correo' }}
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
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.gift-icon {
  flex-shrink: 0;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.85rem;
  background: rgba(180, 80, 90, 0.08);
  color: rgba(140, 50, 65, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gift-icon svg {
  width: 1.2rem;
  height: 1.2rem;
}

.gift-eyebrow {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(100, 70, 75, 0.55);
  margin-bottom: 0.3rem;
}

.gift-phrase {
  font-size: 0.85rem;
  line-height: 1.65;
  color: rgba(60, 40, 45, 0.7);
}

/* ── card ─────────────────────────────────────────────── */
.gift-card {
  border-radius: 1.5rem;
  border: 1px solid rgba(222, 195, 193, 0.6);
  background: linear-gradient(150deg, #ffffff 0%, #fdf4f5 100%);
  padding: 1.5rem;
  box-shadow:
    0 2px 14px rgba(120, 60, 70, 0.07),
    0 1px 3px rgba(0, 0, 0, 0.04);
  animation: giftIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

@keyframes giftIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── bank name ────────────────────────────────────────── */
.gift-bank {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(80, 50, 55, 0.6);
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(222, 195, 193, 0.4);
}

.gift-bank-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: #e8223c;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
}

/* ── rows ─────────────────────────────────────────────── */
.gift-rows {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.gift-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.gift-row-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(100, 70, 75, 0.5);
  flex-shrink: 0;
}

.gift-row-value {
  font-family: var(--font-display, Georgia, serif);
  font-size: 0.95rem;
  color: #4a2830;
  text-align: right;
}

.gift-row-value--small {
  font-size: 0.82rem;
  font-family: inherit;
  word-break: break-all;
}

/* ── copy buttons ─────────────────────────────────────── */
.gift-actions {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.gift-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border-radius: 9999px;
  border: 1.5px solid rgba(100, 40, 60, 0.22);
  background: #4a2830;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.gift-copy-btn:hover {
  background: #7a1f35;
  transform: translateY(-1px);
}

.gift-copy-btn--secondary {
  background: transparent;
  color: #4a2830;
}

.gift-copy-btn--secondary:hover {
  background: rgba(74, 40, 48, 0.06);
  transform: translateY(-1px);
}

.gift-copy-btn svg {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}
</style>
