<script setup lang="ts">
const props = defineProps<{
  guestName: string
  eventName: string
}>()

const rootRef = ref<HTMLElement | null>(null)
const sheetRef = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const eventRef = ref<HTMLElement | null>(null)

function getAnimationElements() {
  return {
    paper: rootRef.value,
    sheet: sheetRef.value,
    eyebrow: eyebrowRef.value,
    name: nameRef.value,
    event: eventRef.value,
  }
}

defineExpose({
  getAnimationElements,
})
</script>

<template>
  <div
    ref="rootRef"
    class="absolute left-[11%] right-[11%] top-[10%] z-[2]"
  >
    <div
      ref="sheetRef"
      class="rounded-[20px] bg-white px-5 py-6 text-center shadow-[0_18px_40px_rgba(123,92,73,0.18)] sm:px-6 sm:py-7"
    >
      <p
        ref="eyebrowRef"
        class="text-[0.56rem] font-semibold uppercase tracking-[0.28em] text-[#705832]/70"
      >
        Invitación para
      </p>

      <p
        ref="nameRef"
        class="mt-3 font-display text-[clamp(1.3rem,3vw,2rem)] leading-[1.06] text-[#4a3820] [overflow-wrap:anywhere] [text-wrap:balance]"
      >
        {{ props.guestName }}
      </p>

      <p
        ref="eventRef"
        class="mt-2 text-[0.62rem] uppercase tracking-[0.16em] text-[#624c2c]/65 [text-wrap:balance]"
      >
        {{ props.eventName }}
      </p>

      <div class="mx-auto mt-4 h-px w-[46%] rounded-full bg-[#806844]/15" />
    </div>
  </div>
</template>