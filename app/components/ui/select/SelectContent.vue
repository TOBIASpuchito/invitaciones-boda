<script setup lang="ts">
import { cva } from 'class-variance-authority'
import {
  SelectContent,
  SelectPortal,
  SelectViewport,
  type SelectContentEmits,
  type SelectContentProps,
  useForwardPropsEmits,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const contentVariants = cva(
  'relative z-50 min-w-[--reka-select-trigger-width] overflow-hidden rounded-2xl border border-blush/70 bg-white/95 p-1 text-cocoa shadow-glow backdrop-blur',
)

const props = withDefaults(defineProps<SelectContentProps & { class?: HTMLAttributes['class'] }>(), {
  position: 'popper',
})

const emits = defineEmits<SelectContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectPortal>
    <SelectContent v-bind="forwarded" :side-offset="8" :class="cn(contentVariants(), props.class)">
      <SelectViewport class="p-1">
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>