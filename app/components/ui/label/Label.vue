<script setup lang="ts">
import { Label, type LabelProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <Label v-bind="forwarded" :class="cn('block text-sm font-medium text-cocoa', props.class)">
    <slot />
  </Label>
</template>
