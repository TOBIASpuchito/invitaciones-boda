<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const model = defineModel<string | number>()
</script>

<template>
  <input
    v-bind="$attrs"
    :value="model"
    :class="cn(
      'w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20 disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
    @input="model = ($attrs.type === 'number') ? ($event.target as HTMLInputElement).valueAsNumber : ($event.target as HTMLInputElement).value"
  >
</template>
