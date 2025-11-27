<template>
  <!-- Mobile Navbar -->
  <template v-if="mobile">
    <nav
      class="fixed top-4 left-4 right-4 z-40 bg-white/80 backdrop-blur-md border border-apple-border/60 rounded-2xl shadow-lg"
    >
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg overflow-hidden bg-apple-gray/50 flex items-center justify-center"
          >
            <img
              src="/images/logo-icon.png"
              alt="BlockSlice Logo"
              class="w-5 h-5 object-contain rounded"
            />
          </div>
          <span class="text-base font-semibold text-apple-text">
            BlockSlice
          </span>
        </div>

        <!-- Icons -->
        <div class="flex items-center gap-2">
          <button
            @click="showTutorial = true"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-apple-gray text-apple-subtext hover:text-apple-text transition-all duration-200"
            aria-label="AI Tutorial"
          >
            <Sparkles :size="18" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
          @click="openGithub"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-apple-gray text-apple-subtext hover:text-apple-text transition-all duration-200"
            aria-label="AI Tutorial"
          >
            <Github :size="18" />
          </button>
        </div>
      </div>
    </nav>
    <TutorialModal :isOpen="showTutorial" @close="showTutorial = false" />
  </template>

  <!-- Desktop Navbar -->
  <template v-else>
    <nav
      class="flex flex-col gap-4 bg-white rounded-[24px] md:rounded-[32px] border border-apple-border/60 p-3 items-center w-16 flex-shrink-0"
    >
      <!-- Logo -->
      <div class="flex flex-col items-center gap-1">
        <div
          class="w-9 h-9 rounded-xl overflow-hidden bg-apple-gray/50 flex items-center justify-center"
        >
          <img
            src="/images/logo-icon.png"
            alt="BlockSlice Logo"
            class="w-6 h-6 object-contain rounded-lg"
          />
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full h-px bg-apple-border/40" />

      <div class="flex flex-col items-center gap-3">
        <button
          @click="showTutorial = true"
          class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-apple-gray text-apple-subtext hover:text-apple-text transition-all duration-200"
          aria-label="AI Tutorial"
        >
          <Sparkles :size="20" />
        </button>
      </div>

      <div class="w-full h-px bg-apple-border/40" />

      <!-- Icons -->
      <div class="flex flex-col items-center gap-3">
        <button
          @click="openGithub"
          class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-apple-gray text-apple-subtext text-apple-text transition-all duration-200"
          aria-label="AI Tutorial"
        >
          <Github :size="20" />
        </button>
      </div>
    </nav>
    <TutorialModal :isOpen="showTutorial" @close="showTutorial = false" />
  </template>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Sparkles, Github } from "lucide-vue-next";
import TutorialModal from "./TutorialModal.vue";

defineProps<{
  mobile?: boolean;
}>();

const showTutorial = ref(false);
const openGithub = () => {
  window.open("https://github.com/EnjoyWT/ImageSeg", "_blank");
};
</script>

<script lang="ts">
import { defineComponent, h } from "vue";

const XIcon = defineComponent({
  render() {
    return h(
      "svg",
      {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
      [
        h("path", { d: "M4 4l11.733 16h4.267l-11.733 -16z" }),
        h("path", { d: "M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" }),
      ]
    );
  },
});

export default {
  components: {
    XIcon,
  },
};
</script>
