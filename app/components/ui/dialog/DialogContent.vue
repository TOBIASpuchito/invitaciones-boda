<script setup lang="ts">
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  type DialogContentEmits,
  type DialogContentProps,
  useForwardPropsEmits,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DialogContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
    <DialogContent
      v-bind="forwarded"
      :class="cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/70 bg-white p-8 shadow-glow focus:outline-none',
        props.class,
      )"
    >
      <slot />
      <DialogClose
        class="absolute right-6 top-6 rounded-full p-1.5 text-stone-400 transition hover:bg-sand hover:text-cocoa focus:outline-none"
        aria-label="Cerrar"
      >
        <X class="h-4 w-4" />
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
