<template>
  <div
    :class="[
      'bg-white rounded-[24px] border border-apple-border/60 p-6',
      className,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>
