<script setup lang="ts">
import { DialogTitle, type DialogTitleProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogTitle v-bind="forwarded" :class="cn('font-display text-2xl text-cocoa', props.class)">
    <slot />
  </DialogTitle>
</template>
