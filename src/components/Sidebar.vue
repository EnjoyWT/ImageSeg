<template>
  <div class="relative h-full">
    <div
      :class="[
        'flex flex-col gap-3 h-full md:overflow-y-auto pr-0 md:pr-1 pb-4 transition-opacity duration-300',
        isDisabled ? 'opacity-75' : 'opacity-100',
      ]"
    >
    <!-- 1. Slicing Parameters -->
    <Card class="py-4 px-5">
      <div class="flex items-center justify-between mb-3">
        <h4
          class="font-semibold text-xs text-apple-subtext uppercase tracking-wider flex items-center gap-2"
        >
          <Grid :size="14" /> 网格布局
        </h4>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label
            :class="[
              'text-[10px] font-medium transition-colors',
              isDisabled ? 'text-apple-subtext' : 'text-apple-text',
            ]"
            >列数</label
          >
          <input
            type="number"
            min="1"
            max="20"
            :disabled="isDisabled"
            :value="settings.cols"
            @input="handleColsInput"
            @blur="handleColsBlur"
            class="w-full px-2 py-2 bg-apple-gray rounded-lg text-center font-semibold text-base focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50"
          />
        </div>
        <div class="space-y-1">
          <label
            :class="[
              'text-[10px] font-medium transition-colors',
              isDisabled ? 'text-apple-subtext' : 'text-apple-text',
            ]"
            >行数</label
          >
          <input
            type="number"
            min="1"
            max="20"
            :disabled="isDisabled"
            :value="settings.rows"
            @input="handleRowsInput"
            @blur="handleRowsBlur"
            class="w-full px-2 py-2 bg-apple-gray rounded-lg text-center font-semibold text-base focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50"
          />
        </div>
      </div>
      <div
        class="mt-3 pt-3 border-t border-apple-border/40 flex justify-between items-center"
      >
        <span class="text-xs text-apple-subtext">切片总数</span>
        <span class="font-semibold text-apple-text text-sm">{{
          settings.cols * settings.rows
        }}</span>
      </div>
    </Card>

    <!-- 2. Scale & Crop Settings -->
    <Card class="py-4 px-5">
      <div class="flex items-center justify-between mb-3">
        <h4
          class="font-semibold text-xs text-apple-subtext uppercase tracking-wider flex items-center gap-2"
        >
          <Move :size="14" /> 调整与裁剪
        </h4>
        <button
          @click="resetTransforms"
          :disabled="isDisabled"
          class="text-[10px] text-apple-blue hover:underline disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw :size="10" /> 重置调整
        </button>
      </div>

      <div class="space-y-5">
        <!-- Mode Select -->
        <div class="flex bg-apple-gray p-1 rounded-xl">
          <button
            :disabled="isDisabled"
            @click="handleInputChange('cropMode', 'original')"
            :class="[
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              settings.cropMode === 'original'
                ? 'bg-white shadow-sm text-apple-text'
                : 'text-apple-subtext hover:text-apple-text',
            ]"
          >
            原比例
          </button>
          <button
            :disabled="isDisabled"
            @click="handleInputChange('cropMode', 'square')"
            :class="[
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              settings.cropMode === 'square'
                ? 'bg-white shadow-sm text-apple-text'
                : 'text-apple-subtext hover:text-apple-text',
            ]"
          >
            正方形
          </button>
        </div>

        <!-- Independent Scale Controls -->
        <div class="space-y-4">
          <!-- Scale X -->
          <div class="flex flex-col gap-1.5">
            <div
              class="flex justify-between items-center text-[10px] text-apple-subtext font-medium"
            >
              <span class="flex items-center gap-1"
                ><ArrowLeftRight :size="12" /> 横向缩放</span
              >
              <span>{{ Math.round(settings.scaleX * 100) }}%</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="handleScaleStep('X', -0.01)"
                :disabled="isDisabled"
                class="w-6 h-6 flex items-center justify-center rounded-full bg-apple-gray hover:bg-gray-200 text-apple-text transition-colors disabled:opacity-50"
              >
                <Minus :size="12" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.01"
                :disabled="isDisabled"
                :value="settings.scaleX"
                @input="(e) => handleInputChange('scaleX', parseFloat((e.target as HTMLInputElement).value))"
                class="flex-1 h-1.5 bg-apple-gray rounded-lg appearance-none cursor-pointer accent-apple-text disabled:opacity-50"
              />
              <button
                @click="handleScaleStep('X', 0.01)"
                :disabled="isDisabled"
                class="w-6 h-6 flex items-center justify-center rounded-full bg-apple-gray hover:bg-gray-200 text-apple-text transition-colors disabled:opacity-50"
              >
                <Plus :size="12" />
              </button>
            </div>
          </div>

          <!-- Scale Y -->
          <div class="flex flex-col gap-1.5">
            <div
              class="flex justify-between items-center text-[10px] text-apple-subtext font-medium"
            >
              <span class="flex items-center gap-1"
                ><ArrowUpDown :size="12" /> 纵向缩放</span
              >
              <span>{{ Math.round(settings.scaleY * 100) }}%</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="handleScaleStep('Y', -0.01)"
                :disabled="isDisabled"
                class="w-6 h-6 flex items-center justify-center rounded-full bg-apple-gray hover:bg-gray-200 text-apple-text transition-colors disabled:opacity-50"
              >
                <Minus :size="12" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.01"
                :disabled="isDisabled"
                :value="settings.scaleY"
                @input="(e) => handleInputChange('scaleY', parseFloat((e.target as HTMLInputElement).value))"
                class="flex-1 h-1.5 bg-apple-gray rounded-lg appearance-none cursor-pointer accent-apple-text disabled:opacity-50"
              />
              <button
                @click="handleScaleStep('Y', 0.01)"
                :disabled="isDisabled"
                class="w-6 h-6 flex items-center justify-center rounded-full bg-apple-gray hover:bg-gray-200 text-apple-text transition-colors disabled:opacity-50"
              >
                <Plus :size="12" />
              </button>
            </div>
          </div>

          <p class="text-[9px] text-apple-subtext text-center mt-0.5">
            提示：也可在预览区使用滚轮缩放，拖拽移动
          </p>
        </div>

        <!-- Format -->
        <div class="flex flex-col gap-1.5 pt-2 border-t border-apple-border/40">
          <label class="text-[10px] font-medium text-apple-text"
            >导出格式</label
          >
          <div class="flex bg-apple-gray p-1 rounded-xl">
            <button
              v-for="fmt in formats"
              :key="fmt"
              :disabled="isDisabled"
              @click="handleInputChange('format', fmt)"
              :class="[
                'flex-1 py-1.5 text-xs font-medium uppercase rounded-lg transition-all',
                settings.format === fmt
                  ? 'bg-white shadow-sm text-apple-text'
                  : 'text-apple-subtext hover:text-apple-text',
              ]"
            >
              {{ fmt }}
            </button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 3. Padding/Margin Control -->
    <Card class="py-4 px-5">
      <div class="flex items-center justify-between mb-3">
        <h4
          class="font-semibold text-xs text-apple-subtext uppercase tracking-wider flex items-center gap-2"
        >
          <Crop :size="14" /> 切割边距
        </h4>
        <button
          @click="resetPaddings"
          :disabled="isDisabled"
          class="text-[10px] text-apple-blue hover:underline disabled:opacity-50"
        >
          重置
        </button>
      </div>

      <div class="space-y-3">
        <!-- Unified padding control -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-medium text-apple-text"
            >统一边距 (px)</label
          >
          <input
            type="number"
            min="0"
            max="200"
            :disabled="isDisabled"
            placeholder="0"
            @input="handleUnifiedPadding"
            class="w-full px-3 py-2 bg-apple-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50"
          />
        </div>

        <!-- Individual padding controls -->
        <div class="grid grid-cols-2 gap-2 text-[10px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-apple-text">上</label>
            <input
              type="number"
              min="0"
              max="200"
              :disabled="isDisabled"
              :value="settings.paddingTop"
              @input="(e) => handleInputChange('paddingTop', Math.max(0, parseInt((e.target as HTMLInputElement).value) || 0))"
              class="px-2 py-1.5 bg-apple-gray rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-apple-blue/20 disabled:opacity-50"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-apple-text">下</label>
            <input
              type="number"
              min="0"
              max="200"
              :disabled="isDisabled"
              :value="settings.paddingBottom"
              @input="(e) => handleInputChange('paddingBottom', Math.max(0, parseInt((e.target as HTMLInputElement).value) || 0))"
              class="px-2 py-1.5 bg-apple-gray rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-apple-blue/20 disabled:opacity-50"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-apple-text">左</label>
            <input
              type="number"
              min="0"
              max="200"
              :disabled="isDisabled"
              :value="settings.paddingLeft"
              @input="(e) => handleInputChange('paddingLeft', Math.max(0, parseInt((e.target as HTMLInputElement).value) || 0))"
              class="px-2 py-1.5 bg-apple-gray rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-apple-blue/20 disabled:opacity-50"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-apple-text">右</label>
            <input
              type="number"
              min="0"
              max="200"
              :disabled="isDisabled"
              :value="settings.paddingRight"
              @input="(e) => handleInputChange('paddingRight', Math.max(0, parseInt((e.target as HTMLInputElement).value) || 0))"
              class="px-2 py-1.5 bg-apple-gray rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-apple-blue/20 disabled:opacity-50"
            />
          </div>
        </div>

        <p class="text-[9px] text-apple-subtext text-center">
          边距将从每个切片边缘裁剪指定像素
        </p>
      </div>
    </Card>

    <!-- 4. File Naming -->
    <Card class="py-4 px-5">
      <div class="flex items-center justify-between mb-3">
        <h4
          class="font-semibold text-xs text-apple-subtext uppercase tracking-wider flex items-center gap-2"
        >
          <FileText :size="14" /> 文件命名
        </h4>
      </div>

      <div class="space-y-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-medium text-apple-text"
            >自定义前缀 (可选)</label
          >
          <input
            type="text"
            :disabled="isDisabled"
            :value="settings.filePrefix"
            @input="(e) => handleInputChange('filePrefix', (e.target as HTMLInputElement).value)"
            placeholder="例如: product_image"
            class="w-full px-3 py-2 bg-apple-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50"
          />
        </div>

        <div
          class="text-[9px] text-apple-subtext bg-apple-gray/50 rounded-lg p-2"
        >
          <p class="font-medium mb-1">预览格式:</p>
          <code class="text-apple-text">
            {{
              settings.filePrefix
                ? `${settings.filePrefix}_1_1.${settings.format}`
                : `原文件名_1_1.${settings.format}`
            }}
          </code>
        </div>
      </div>
    </Card>

    <!-- 5. Download Action - 占位元素 -->
    <div class="h-20 shrink-0"></div>
  </div>

  <!-- Download Action - 固定在底部 -->
  <div class="absolute bottom-0 left-0 right-0 bg-[rgb(245,245,247)] pt-2 pb-4 px-0 border-t border-apple-border/20">
    <Button
      @click="handleDownload"
      variant="primary"
      class="w-full h-12 text-sm shadow-lg shadow-apple-blue/20"
      :isLoading="processingState.isProcessing"
      :disabled="isDisabled || processingState.isProcessing"
    >
      <template v-if="!processingState.isProcessing">
        <Download :size="18" class="mr-2" />
        {{
          selectedCount > 0
            ? `下载选中 (${selectedCount})`
            : `下载全部 (${totalSlices})`
        }}
      </template>
    </Button>
    <div v-if="processingState.isProcessing" class="mt-3">
      <div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-apple-blue transition-all duration-300 ease-out"
          :style="{ width: `${processingState.progress}%` }"
        />
      </div>
      <p class="text-center text-[10px] text-apple-subtext mt-1">
        正在打包 ZIP... {{ processingState.progress }}%
      </p>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { GridSettings, ImageInfo, ProcessingState } from "../types";
import Card from "./ui/Card.vue";
import Button from "./ui/Button.vue";
import {
  Download,
  Grid,
  Move,
  Minus,
  Plus,
  ArrowLeftRight,
  ArrowUpDown,
  RefreshCw,
  Crop,
  FileText,
} from "lucide-vue-next";
import { processAndDownload } from "../utils/imageProcessing";

const props = defineProps<{
  imageInfo: ImageInfo | null;
  settings: GridSettings;
  selectedCount: number;
  totalSlices: number;
  processingState: ProcessingState;
  selectedIndices: Set<number>;
}>();

const emit = defineEmits<{
  (e: "update:settings", settings: GridSettings): void;
  (e: "update:processingState", state: ProcessingState): void;
  (e: "reset"): void;
}>();

const isDisabled = computed(() => !props.imageInfo);
const formats = ["png", "jpg", "webp"] as const;

const handleDownload = async () => {
  if (!props.imageInfo) return;

  emit("update:processingState", {
    isProcessing: true,
    progress: 0,
    error: null,
  });
  try {
    await processAndDownload(
      props.imageInfo,
      props.settings,
      props.selectedIndices,
      (p) =>
        emit("update:processingState", {
          ...props.processingState,
          progress: p,
        })
    );
  } catch (e) {
    emit("update:processingState", {
      ...props.processingState,
      error: "下载失败，请重试。",
    });
  } finally {
    setTimeout(() => {
      emit("update:processingState", {
        isProcessing: false,
        progress: 0,
        error: null,
      });
    }, 1000);
  }
};

const handleInputChange = (
  field: keyof GridSettings,
  value: number | string
) => {
  const newSettings = { ...props.settings };

  if (field === "cropMode") {
    newSettings[field] = value as any;
    newSettings.scaleX = 1;
    newSettings.scaleY = 1;
    newSettings.offsetX = 0;
    newSettings.offsetY = 0;
  } else {
    // @ts-ignore
    newSettings[field] = value;
  }
  emit("update:settings", newSettings);
};

// 列数输入处理 - 允许输入过程中清空，只在有效数字时更新
const handleColsInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const val = parseInt(input.value);
  if (!isNaN(val) && val >= 1 && val <= 20) {
    handleInputChange("cols", val);
  }
};

// 列数失焦处理 - 确保最终值有效
const handleColsBlur = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const val = parseInt(input.value);
  if (isNaN(val) || val < 1) {
    input.value = String(props.settings.cols);
  } else if (val > 20) {
    handleInputChange("cols", 20);
  }
};

// 行数输入处理
const handleRowsInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const val = parseInt(input.value);
  if (!isNaN(val) && val >= 1 && val <= 20) {
    handleInputChange("rows", val);
  }
};

// 行数失焦处理
const handleRowsBlur = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const val = parseInt(input.value);
  if (isNaN(val) || val < 1) {
    input.value = String(props.settings.rows);
  } else if (val > 20) {
    handleInputChange("rows", 20);
  }
};

const handleScaleStep = (axis: "X" | "Y", amount: number) => {
  const field = axis === "X" ? "scaleX" : "scaleY";
  const current = props.settings[field];
  const newVal = Math.min(3, Math.max(0.5, current + amount));
  handleInputChange(field, Number(newVal.toFixed(2)));
};

const resetTransforms = () => {
  emit("update:settings", {
    ...props.settings,
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0,
  });
};

const resetPaddings = () => {
  emit("update:settings", {
    ...props.settings,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  });
};

const handleUnifiedPadding = (e: Event) => {
  const val = Math.max(0, parseInt((e.target as HTMLInputElement).value) || 0);
  emit("update:settings", {
    ...props.settings,
    paddingTop: val,
    paddingRight: val,
    paddingBottom: val,
    paddingLeft: val,
  });
};
</script>
