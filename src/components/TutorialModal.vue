<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      @click="onClose"
    />

    <!-- Modal -->
    <div
      class="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-apple-border/60"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-apple-gray/50 flex items-center justify-center border border-apple-border/40"
          >
            <Sparkles :size="20" class="text-apple-text" />
          </div>
          <div>
            <h2 class="text-xl font-semibold text-apple-text">
              表情包生成教程
            </h2>
            <p class="text-xs text-apple-subtext">AI 提示词参考</p>
          </div>
        </div>
        <button
          @click="onClose"
          class="w-8 h-8 rounded-full hover:bg-apple-gray transition-colors flex items-center justify-center"
        >
          <X :size="18" class="text-apple-subtext" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        <!-- Prompt Section -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-apple-text">Prompt 提示词</h3>
            <button
              @click="handleCopy"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-apple-blue text-white text-xs font-medium hover:bg-apple-hoverBlue transition-colors"
            >
              <template v-if="copied">
                <Check :size="14" />
                已复制
              </template>
              <template v-else>
                <Copy :size="14" />
                复制
              </template>
            </button>
          </div>
          <div
            class="bg-apple-gray/50 rounded-2xl p-4 border border-apple-border/40"
          >
            <pre
              class="text-xs text-apple-text whitespace-pre-wrap font-mono leading-relaxed"
              >{{ promptText }}</pre
            >
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-apple-text mb-3">使用教学</h3>
          <p class="text-sm text-apple-text leading-relaxed">
            直接拿一张图片当底图，输入上面的 Prompt
            就可以了。或者你可以微调一下，比如文字随机横向/竖向排列，比例 1:1
            等等。生成后上传到本工具，使用 4×6 布局切割即可。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { X, Sparkles, Copy, Check } from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const onClose = () => {
  emit("close");
};

const copied = ref(false);

const promptText = `为我生成图中角色的绘制 Q 版的，LINE 风格的半身像表情包，注意头饰要正确
彩色手绘风格，使用 4x6 布局，涵盖各种各样的常用聊天语句，或是一些有关的娱乐 meme
其他需求：不要原图复制，所有标注为手写简体中文，中文文字横向或者纵向随机排列，
生成的图片需为 4K 分辨率 16:9`;

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(promptText);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};
</script>
