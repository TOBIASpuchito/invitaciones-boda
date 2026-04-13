<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { DropdownMenuItem, type DropdownMenuItemEmits, type DropdownMenuItemProps, useForwardPropsEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const itemVariants = cva(
  'relative flex cursor-default select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition focus:bg-sand focus:text-cocoa data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
)

const props = defineProps<DropdownMenuItemProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DropdownMenuItemEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuItem v-bind="forwarded" :class="cn(itemVariants(), props.class)">
    <slot />
  </DropdownMenuItem>
</template>