<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <tr :class="cn('border-b border-blush/50 transition-colors hover:bg-sand/40 data-[state=selected]:bg-sand', props.class)">
    <slot />
  </tr>
</template>
