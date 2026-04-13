<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { ChevronDown } from 'lucide-vue-next'
import { SelectIcon, SelectTrigger, type SelectTriggerProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const triggerVariants = cva(
  'flex h-14 w-full items-center justify-between rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-left text-base text-cocoa outline-none transition data-[placeholder]:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20 disabled:cursor-not-allowed disabled:opacity-50',
)

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>()

const forwarded = useForwardProps(props)
</script>

<template>
  <SelectTrigger v-bind="forwarded" :class="cn(triggerVariants(), props.class)">
    <slot />

    <SelectIcon as-child>
      <ChevronDown class="h-4 w-4 shrink-0 text-cocoa/60" />
    </SelectIcon>
  </SelectTrigger>
</template>