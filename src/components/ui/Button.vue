<template>
  <button
    :class="[baseStyles, variants[variant], className]"
    :disabled="disabled || isLoading"
    v-bind="$attrs"
  >
    <span v-if="isLoading" class="flex items-center gap-2">
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      处理中...
    </span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "primary",
  isLoading: false,
  className: "",
  disabled: false,
});

const baseStyles =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-apple-text text-white hover:bg-black/90 shadow-sm",
  secondary: "bg-apple-gray text-apple-text hover:bg-[#E8E8ED]",
  outline: "border border-apple-border text-apple-text hover:bg-apple-gray",
  ghost: "text-apple-blue hover:bg-apple-blue/10",
};
</script>
