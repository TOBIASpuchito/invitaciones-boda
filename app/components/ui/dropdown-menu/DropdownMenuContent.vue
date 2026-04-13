<script setup lang="ts">
import { cva } from 'class-variance-authority'
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps,
  useForwardPropsEmits,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const contentVariants = cva(
  'z-50 min-w-[14rem] overflow-hidden rounded-2xl border border-blush/70 bg-white/95 p-1 text-cocoa shadow-glow backdrop-blur',
)

const props = defineProps<DropdownMenuContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DropdownMenuContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent v-bind="forwarded" :side-offset="8" :class="cn(contentVariants(), props.class)">
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>