<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<DropdownMenuLabelProps & { class?: HTMLAttributes['class'] }>()

const forwarded = useForwardProps(props)
</script>

<template>
  <DropdownMenuLabel v-bind="forwarded" :class="cn('px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500', props.class)">
    <slot />
  </DropdownMenuLabel>
</template>