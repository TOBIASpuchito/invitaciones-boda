<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { Check } from 'lucide-vue-next'
import {
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  type SelectItemEmits,
  type SelectItemProps,
  useForwardPropsEmits,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const itemVariants = cva(
  'relative flex w-full cursor-default select-none items-center rounded-xl py-3 pl-10 pr-4 text-sm text-cocoa outline-none transition focus:bg-sand focus:text-cocoa data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
)

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<SelectItemEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectItem v-bind="forwarded" :class="cn(itemVariants(), props.class)">
    <span class="absolute left-3 flex h-4 w-4 items-center justify-center">
      <SelectItemIndicator>
        <Check class="h-4 w-4 text-wine" />
      </SelectItemIndicator>
    </span>

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>