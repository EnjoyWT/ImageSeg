<template>
  <!-- Mobile Navbar -->
  <div class="md:hidden">
    <Navbar :mobile="true" />
  </div>

  <div
    class="min-h-screen w-full bg-apple-gray p-2 md:p-4 pt-20 md:pt-4 flex items-center justify-center font-sans"
  >
    <div class="w-full max-w-7xl flex flex-col md:flex-row gap-3 md:h-[90vh]">
      <div
        v-if="globalError"
        class="fixed top-24 md:top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-red-200 text-red-600 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
      >
        <AlertCircle :size="18" />
        <span class="font-medium text-sm">{{ globalError }}</span>
      </div>

      <div
        v-if="suggestion"
        class="fixed top-24 md:top-6 left-1/2 -translate-x-1/2 z-50 bg-apple-blue/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
      >
        <Sparkles :size="18" />
        <span class="font-medium text-sm">{{ suggestion }}</span>
      </div>

      <!-- Desktop Navbar - integrated in layout -->
      <div class="hidden md:block">
        <Navbar />
      </div>

      <!-- LEFT PANEL: Preview / Upload -->
      <!-- Mobile: fixed height (50vh) or min-height to ensure image shows. Desktop: full height. -->
      <div
        class="flex-1 bg-white rounded-[24px] md:rounded-[32px] border border-apple-border/60 p-3 md:p-5 shadow-sm relative overflow-hidden flex flex-col h-[55vh] md:h-full min-h-[400px]"
      >
        <div
          class="flex justify-between items-center mb-2 flex-shrink-0 min-h-[32px]"
        >
          <div class="flex items-center gap-2">
            <div class="flex gap-1.5 mr-2">
              <div class="w-3 h-3 rounded-full bg-red-400"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div class="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span
              class="text-xs font-medium text-apple-subtext uppercase tracking-widest hidden sm:inline-block"
            >
              预览
            </span>
          </div>

          <div v-if="imageInfo" class="flex items-center gap-2">
            <Button
              variant="ghost"
              @click="handleSelectAll"
              class="h-7 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 rounded-lg text-apple-text"
              title="全选"
            >
              <CheckSquare :size="14" />
              <span class="hidden sm:inline">全选</span>
            </Button>
            <Button
              variant="ghost"
              @click="handleSelectNone"
              class="h-7 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 rounded-lg text-apple-text"
              title="重置选中"
            >
              <XSquare :size="14" />
              <span class="hidden sm:inline">重置</span>
            </Button>
            <div class="w-px h-4 bg-gray-200 mx-1"></div>
            <Button
              variant="ghost"
              @click="handleReset"
              class="h-7 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 rounded-lg text-apple-blue font-medium"
              title="重新上传"
            >
              <Upload :size="14" />
              <span class="hidden sm:inline">重新上传</span>
            </Button>
          </div>
        </div>

        <div class="flex-1 min-h-0 w-full relative">
          <GridPreview
            v-if="imageInfo"
            :imageInfo="imageInfo"
            :settings="settings"
            :selectedIndices="selectedIndices"
            @selectionChange="setSelectedIndices"
            @settingsChange="handleSettingsChange"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="w-full max-w-md p-4">
              <ImageUploader
                @imageSelected="handleImageSelected"
                @error="handleError"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Controls -->
      <div
        class="w-full md:w-[340px] flex-shrink-0 flex flex-col h-auto md:h-full"
      >
        <Sidebar
          :imageInfo="imageInfo"
          :settings="settings"
          @update:settings="settings = $event"
          @reset="handleReset"
          :selectedCount="selectedIndices.size"
          :totalSlices="settings.rows * settings.cols"
          :processingState="processingState"
          @update:processingState="processingState = $event"
          :selectedIndices="selectedIndices"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Navbar from "./components/Navbar.vue";
import ImageUploader from "./components/ImageUploader.vue";
import GridPreview from "./components/GridPreview.vue";
import Sidebar from "./components/Sidebar.vue";
import type { ImageInfo, GridSettings, ProcessingState } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import {
  AlertCircle,
  Upload,
  CheckSquare,
  XSquare,
  Sparkles,
} from "lucide-vue-next";
import Button from "./components/ui/Button.vue";
import { suggestGridDimensions } from "./utils/gridDetection";

const imageInfo = ref<ImageInfo | null>(null);
const settings = ref<GridSettings>({ ...DEFAULT_SETTINGS });
const selectedIndices = ref<Set<number>>(new Set());
const processingState = ref<ProcessingState>({
  isProcessing: false,
  progress: 0,
  error: null,
});
const globalError = ref<string | null>(null);
const suggestion = ref<string | null>(null);

// Reset when new image loads
const handleImageSelected = (info: ImageInfo) => {
  imageInfo.value = info;

  // Auto-suggest grid dimensions
  const gridSuggestion = suggestGridDimensions(info.width, info.height);

  settings.value = {
    ...DEFAULT_SETTINGS,
    rows: gridSuggestion.rows,
    cols: gridSuggestion.cols,
    // Reset transform on new image
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0,
  };

  selectedIndices.value = new Set();
  globalError.value = null;

  // Show suggestion notification
  suggestion.value = gridSuggestion.reason;
  setTimeout(() => (suggestion.value = null), 4000);
};

const handleReset = () => {
  imageInfo.value = null;
  selectedIndices.value = new Set();
  processingState.value = { isProcessing: false, progress: 0, error: null };
};

const handleError = (msg: string) => {
  globalError.value = msg;
  setTimeout(() => (globalError.value = null), 5000);
};

const handleSelectAll = () => {
  const total = settings.value.rows * settings.value.cols;
  const newSet = new Set<number>();
  for (let i = 0; i < total; i++) {
    newSet.add(i);
  }
  selectedIndices.value = newSet;
};

const handleSelectNone = () => {
  selectedIndices.value = new Set();
};

const handleSettingsChange = (newSettings: Partial<GridSettings>) => {
  settings.value = { ...settings.value, ...newSettings };
};

const setSelectedIndices = (indices: Set<number>) => {
  selectedIndices.value = indices;
};
</script>
