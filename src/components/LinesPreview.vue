<template>
  <div class="flex flex-col h-full w-full select-none">
    <!-- Container Area -->
    <div
      class="flex-1 flex items-center justify-center min-h-0 w-full relative overflow-hidden bg-apple-gray/30 rounded-lg p-0 md:p-1"
    >
      <!-- The Viewport Wrapper -->
      <div
        ref="containerRef"
        class="relative shadow-sm overflow-hidden bg-white flex items-center justify-center"
        :style="containerStyle"
        @click="handleContainerClick"
      >
        <!-- PHANTOM DRIVER IMAGE - 用于驱动容器尺寸 -->
        <img
          :src="settings.cropMode === 'square' ? SQUARE_SVG_DATA : imageInfo.src"
          alt="layout-driver"
          class="opacity-0 pointer-events-none block"
          style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;"
        />

        <!-- REAL IMAGE LAYER -->
        <img
          :src="imageInfo.src"
          alt="preview"
          draggable="false"
          class="absolute inset-0 w-full h-full pointer-events-none select-none"
          :style="{
            objectFit: settings.cropMode === 'square' ? 'cover' : 'contain',
            transform: `translate(${settings.offsetX * 100}%, ${settings.offsetY * 100}%) scale(${settings.scaleX}, ${settings.scaleY})`,
            transformOrigin: 'center',
          }"
        />

        <!-- 水平分割线 -->
        <div
          v-for="line in settings.horizontalLines"
          :key="line.id"
          class="absolute left-0 right-0 h-0.5 bg-red-500 cursor-ns-resize group z-30"
          :style="{ top: `${(line.position / viewportHeight) * 100}%` }"
          @mousedown.stop="startDragLine('horizontal', line.id, $event)"
        >
          <!-- 删除按钮 -->
          <button
            @click.stop="removeLine('horizontal', line.id)"
            class="absolute -right-0 -top-2.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
          <!-- 位置标签 -->
          <span
            class="absolute left-1 -top-4 text-[9px] bg-red-500 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {{ Math.round(line.position) }}px
          </span>
        </div>

        <!-- 垂直分割线 -->
        <div
          v-for="line in settings.verticalLines"
          :key="line.id"
          class="absolute top-0 bottom-0 w-0.5 bg-blue-500 cursor-ew-resize group z-30"
          :style="{ left: `${(line.position / viewportWidth) * 100}%` }"
          @mousedown.stop="startDragLine('vertical', line.id, $event)"
        >
          <!-- 删除按钮 -->
          <button
            @click.stop="removeLine('vertical', line.id)"
            class="absolute -top-0  -left-2.5 w-5 h-5 bg-blue-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-blue-600"
          >
            ×
          </button>
          <!-- 位置标签 -->
          <span
            class="absolute top-1 left-2 text-[9px] bg-blue-500 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {{ Math.round(line.position) }}px
          </span>
        </div>

        <!-- 分割区域预览 (点击选择) -->
        <div class="absolute inset-0 z-20 pointer-events-none">
          <div
            v-for="(region, i) in regions"
            :key="i"
            class="absolute border border-dashed border-green-500/40 pointer-events-auto hover:bg-green-500/10 transition-colors"
            :class="selectedIndices.has(i) ? 'bg-green-500/20 border-solid border-green-500' : ''"
            :style="{
              left: `${(region.x / viewportWidth) * 100}%`,
              top: `${(region.y / viewportHeight) * 100}%`,
              width: `${(region.width / viewportWidth) * 100}%`,
              height: `${(region.height / viewportHeight) * 100}%`,
            }"
            @click.stop="toggleRegion(i)"
          >
            <div
              v-if="selectedIndices.has(i)"
              class="absolute top-0.5 left-0.5 bg-green-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm font-bold"
            >
              ✓
            </div>
          </div>
        </div>

        <!-- 添加线按钮区域 -->
       
      </div>
    </div>

    <!-- Info Footer -->
    <div
      class="flex-shrink-0 mt-2 pt-2 border-t border-apple-border/40 flex items-center justify-between text-[10px] md:text-xs text-apple-subtext px-2"
    >
      <div class="flex items-center gap-3">
        <span>视口: {{ viewportWidth }}×{{ viewportHeight }}</span>
        <span class="text-red-500">水平线: {{ settings.horizontalLines.length }}</span>
        <span class="text-blue-500">垂直线: {{ settings.verticalLines.length }}</span>
      </div>
      <div class="font-medium text-apple-text">
        切片数: {{ regions.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import type { GridSettings, ImageInfo, SplitLine } from "../types";

const props = defineProps<{
  imageInfo: ImageInfo;
  settings: GridSettings;
  selectedIndices: Set<number>;
}>();

const emit = defineEmits<{
  (e: "selectionChange", indices: Set<number>): void;
  (e: "settingsChange", newSettings: Partial<GridSettings>): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);

// 拖拽状态
const draggingLine = ref<{ type: 'horizontal' | 'vertical'; id: string } | null>(null);

// 计算视口尺寸（应用裁剪模式）
const viewportWidth = computed(() => {
  if (props.settings.cropMode === 'square') {
    return Math.min(props.imageInfo.width, props.imageInfo.height);
  }
  return props.imageInfo.width;
});

const viewportHeight = computed(() => {
  if (props.settings.cropMode === 'square') {
    return Math.min(props.imageInfo.width, props.imageInfo.height);
  }
  return props.imageInfo.height;
});

// 容器样式
const containerStyle = computed(() => {
  return {
    aspectRatio: props.settings.cropMode === 'square'
      ? '1 / 1'
      : `${props.imageInfo.width} / ${props.imageInfo.height}`,
    maxWidth: '100%',
    maxHeight: '100%',
  };
});

// 正方形占位图 SVG
const SQUARE_SVG_DATA = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg==";

// 计算分割区域（基于视口尺寸）
const regions = computed(() => {
  const { horizontalLines, verticalLines } = props.settings;
  const width = viewportWidth.value;
  const height = viewportHeight.value;

  // 排序分割线位置
  const hPositions = [0, ...horizontalLines.map(l => l.position).sort((a, b) => a - b), height];
  const vPositions = [0, ...verticalLines.map(l => l.position).sort((a, b) => a - b), width];

  const result: { x: number; y: number; width: number; height: number }[] = [];

  for (let row = 0; row < hPositions.length - 1; row++) {
    for (let col = 0; col < vPositions.length - 1; col++) {
      const x = vPositions[col] ?? 0;
      const y = hPositions[row] ?? 0;
      const nextX = vPositions[col + 1] ?? width;
      const nextY = hPositions[row + 1] ?? height;
      result.push({
        x,
        y,
        width: nextX - x,
        height: nextY - y,
      });
    }
  }

  return result;
});

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 添加水平线
const addHorizontalLine = () => {
  const newLine: SplitLine = {
    id: generateId(),
    position: viewportHeight.value / 2,
  };
  emit("settingsChange", {
    horizontalLines: [...props.settings.horizontalLines, newLine],
  });
  // 重置选择
  emit("selectionChange", new Set());
};

// 添加垂直线
const addVerticalLine = () => {
  const newLine: SplitLine = {
    id: generateId(),
    position: viewportWidth.value / 2,
  };
  emit("settingsChange", {
    verticalLines: [...props.settings.verticalLines, newLine],
  });
  emit("selectionChange", new Set());
};

// 删除线
const removeLine = (type: 'horizontal' | 'vertical', id: string) => {
  if (type === 'horizontal') {
    emit("settingsChange", {
      horizontalLines: props.settings.horizontalLines.filter(l => l.id !== id),
    });
  } else {
    emit("settingsChange", {
      verticalLines: props.settings.verticalLines.filter(l => l.id !== id),
    });
  }
  emit("selectionChange", new Set());
};

// 开始拖拽线
const startDragLine = (type: 'horizontal' | 'vertical', id: string, e: MouseEvent) => {
  draggingLine.value = { type, id };
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('mouseup', handleDragEnd);
};

// 拖拽移动
const handleDragMove = (e: MouseEvent) => {
  if (!draggingLine.value || !containerRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  const { type, id } = draggingLine.value;

  if (type === 'horizontal') {
    const relativeY = e.clientY - rect.top;
    const position = Math.max(10, Math.min(viewportHeight.value - 10, 
      (relativeY / rect.height) * viewportHeight.value
    ));
    
    emit("settingsChange", {
      horizontalLines: props.settings.horizontalLines.map(l =>
        l.id === id ? { ...l, position } : l
      ),
    });
  } else {
    const relativeX = e.clientX - rect.left;
    const position = Math.max(10, Math.min(viewportWidth.value - 10,
      (relativeX / rect.width) * viewportWidth.value
    ));
    
    emit("settingsChange", {
      verticalLines: props.settings.verticalLines.map(l =>
        l.id === id ? { ...l, position } : l
      ),
    });
  }
};

// 结束拖拽
const handleDragEnd = () => {
  draggingLine.value = null;
  window.removeEventListener('mousemove', handleDragMove);
  window.removeEventListener('mouseup', handleDragEnd);
};

// 点击容器添加线 (双击)
const handleContainerClick = (e: MouseEvent) => {
  // 单击不处理，由区域点击处理
};

// 切换区域选择
const toggleRegion = (index: number) => {
  const newSet = new Set(props.selectedIndices);
  if (newSet.has(index)) {
    newSet.delete(index);
  } else {
    newSet.add(index);
  }
  emit("selectionChange", newSet);
};

onUnmounted(() => {
  window.removeEventListener('mousemove', handleDragMove);
  window.removeEventListener('mouseup', handleDragEnd);
});
</script>
