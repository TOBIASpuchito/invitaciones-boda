<script setup lang="ts">
const WEDDING_DATE = new Date('2026-07-25T14:00:00-05:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(): TimeLeft {
  const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now())
  return {
    days:    Math.floor(diff / 1000 / 60 / 60 / 24),
    hours:   Math.floor(diff / 1000 / 60 / 60) % 24,
    minutes: Math.floor(diff / 1000 / 60) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  }
}

const timeLeft = ref<TimeLeft>(calcTimeLeft())
const past = ref(WEDDING_DATE.getTime() <= Date.now())

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    const next = calcTimeLeft()
    timeLeft.value = next
    if (next.days === 0 && next.hours === 0 && next.minutes === 0 && next.seconds === 0) {
      past.value = true
      if (timer) clearInterval(timer)
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <div class="countdown-wrap">
    <p class="countdown-eyebrow">Faltan</p>

    <div v-if="!past" class="countdown-grid">
      <div class="countdown-unit" style="--i:0">
        <div class="countdown-box">
          <span class="countdown-num">{{ timeLeft.days }}</span>
        </div>
        <p class="countdown-label">días</p>
      </div>

      <div class="countdown-sep">:</div>

      <div class="countdown-unit" style="--i:1">
        <div class="countdown-box">
          <span class="countdown-num">{{ pad(timeLeft.hours) }}</span>
        </div>
        <p class="countdown-label">horas</p>
      </div>

      <div class="countdown-sep">:</div>

      <div class="countdown-unit" style="--i:2">
        <div class="countdown-box">
          <span class="countdown-num">{{ pad(timeLeft.minutes) }}</span>
        </div>
        <p class="countdown-label">min</p>
      </div>

      <div class="countdown-sep">:</div>

      <div class="countdown-unit" style="--i:3">
        <div class="countdown-box countdown-box--seconds">
          <span class="countdown-num">{{ pad(timeLeft.seconds) }}</span>
        </div>
        <p class="countdown-label">seg</p>
      </div>
    </div>

    <p v-else class="countdown-past">
      ¡El gran día ha llegado! 🎉
    </p>
  </div>
</template>

<style scoped>
.countdown-wrap {
  text-align: center;
}

.countdown-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(100, 70, 75, 0.55);
  margin-bottom: 0.85rem;
}

.countdown-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
}

/* ── unit ──────────────────────────────────────────────────── */
.countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  animation: unitIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(0.8s + var(--i) * 120ms);
}

@keyframes unitIn {
  from { opacity: 0; transform: translateY(12px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* ── box ───────────────────────────────────────────────────── */
.countdown-box {
  position: relative;
  width: 100%;
  min-width: 3.6rem;
  padding: 0.7rem 0.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(222, 195, 193, 0.6);
  background: linear-gradient(160deg, #ffffff 0%, #fdf4f5 100%);
  box-shadow:
    0 2px 10px rgba(120, 60, 70, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  text-align: center;
  overflow: hidden;
}

/* subtle shine sweep on seconds box */
.countdown-box--seconds::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
  animation: shine 1s linear infinite;
}

@keyframes shine {
  from { transform: translateX(-100%); }
  to   { transform: translateX(200%); }
}

/* ── number ────────────────────────────────────────────────── */
.countdown-num {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.65rem;
  line-height: 1;
  color: #4a2830;
  display: block;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.countdown-box:hover .countdown-num {
  transform: scale(1.08);
}

/* ── label ─────────────────────────────────────────────────── */
.countdown-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(100, 70, 75, 0.5);
}

/* ── separator ─────────────────────────────────────────────── */
.countdown-sep {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.4rem;
  color: rgba(180, 100, 110, 0.35);
  margin-bottom: 1.2rem;
  user-select: none;
}

/* ── past message ──────────────────────────────────────────── */
.countdown-past {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.2rem;
  color: #4a2830;
}

@media (max-width: 520px) {
  .countdown-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem 0.5rem;
    align-items: start;
  }

  .countdown-sep {
    display: none;
  }

  .countdown-box {
    min-width: 0;
  }

  .countdown-num {
    font-size: clamp(1.25rem, 5vw, 1.55rem);
  }

  .countdown-label {
    letter-spacing: 0.16em;
  }
}

@media (max-width: 380px) {
  .countdown-box {
    min-width: 2.8rem;
    padding: 0.55rem 0.35rem;
  }
  .countdown-num {
    font-size: 1.3rem;
  }
}
</style>
