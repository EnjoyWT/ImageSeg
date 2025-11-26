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
        :style="{
          aspectRatio:
            settings.cropMode === 'square'
              ? '1 / 1'
              : `${imageInfo.width} / ${imageInfo.height}`,
          maxWidth: '100%',
          maxHeight: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
        }"
        @mousedown="handleMouseDown"
      >
        <!-- PHANTOM DRIVER IMAGE -->
        <img
          :src="
            settings.cropMode === 'square' ? SQUARE_SVG_DATA : imageInfo.src
          "
          alt="layout-driver"
          class="opacity-0 pointer-events-none block"
          style="
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
          "
        />

        <!-- REAL IMAGE LAYER -->
        <img
          :src="imageInfo.src"
          alt="preview"
          draggable="false"
          class="absolute inset-0 w-full h-full pointer-events-none select-none"
          :style="{
            objectFit: settings.cropMode === 'square' ? 'cover' : 'contain',
            transform: `translate(${settings.offsetX * 100}%, ${
              settings.offsetY * 100
            }%) scale(${settings.scaleX}, ${settings.scaleY})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }"
        />

        <!-- GRID OVERLAY -->
        <div
          class="absolute inset-0 grid z-20 pointer-events-none"
          :style="{
            gridTemplateColumns: `repeat(${settings.cols}, 1fr)`,
            gridTemplateRows: `repeat(${settings.rows}, 1fr)`,
          }"
        >
          <div
            v-for="(_, i) in settings.rows * settings.cols"
            :key="i"
            style="pointer-events: auto"
            @mouseup="handleGridClick(i)"
            :class="[
              'relative border border-dashed border-red-500/60 transition-colors duration-75 hover:bg-red-500/10',
              selectedIndices.has(i)
                ? 'bg-red-500/20 ring-1 ring-inset ring-red-500 border-solid'
                : '',
            ]"
          >
            <!-- Padding visualization -->
            <div
              v-if="hasPadding"
              class="absolute border-2 border-dashed border-blue-500/50"
              :style="{
                top: `${(settings.paddingTop / blockHeight) * 100}%`,
                right: `${(settings.paddingRight / blockWidth) * 100}%`,
                bottom: `${(settings.paddingBottom / blockHeight) * 100}%`,
                left: `${(settings.paddingLeft / blockWidth) * 100}%`,
              }"
            />

            <div
              v-if="selectedIndices.has(i)"
              class="absolute top-0.5 left-0.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm font-bold"
            >
              ✓
            </div>
          </div>
        </div>

        <!-- GRID RESIZER -->
        <GridResizer
          :rows="settings.rows"
          :cols="settings.cols"
          @gridChange="handleGridResize"
        />
      </div>
    </div>

    <!-- Info Footer -->
    <div
      class="flex-shrink-0 mt-2 pt-2 border-t border-apple-border/40 flex items-center justify-between text-[10px] md:text-xs text-apple-subtext px-2"
    >
      <div class="flex items-center gap-3">
        <span>原图: {{ imageInfo.width }}×{{ imageInfo.height }}</span>
        <span class="text-apple-text/80">
          {{
            hasMoved || settings.scaleX !== 1 || settings.scaleY !== 1
              ? "(已调整)"
              : ""
          }}
        </span>
      </div>
      <div class="font-medium text-apple-text">
        单块: {{ blockWidth }} × {{ blockHeight }}px
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { GridSettings, ImageInfo } from "../types";
import { getViewportDimensions } from "../utils/imageProcessing";
import GridResizer from "./GridResizer.vue";

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
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const initialOffset = ref({ x: 0, y: 0 });
const hasMoved = ref(false);

const SQUARE_SVG_DATA =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg==";

// Viewport Dimensions
const viewportDims = computed(() => {
  return getViewportDimensions(
    props.imageInfo.width,
    props.imageInfo.height,
    props.settings.cropMode
  );
});

const blockWidth = computed(() =>
  Math.round(viewportDims.value.width / props.settings.cols)
);
const blockHeight = computed(() =>
  Math.round(viewportDims.value.height / props.settings.rows)
);

const hasPadding = computed(
  () =>
    props.settings.paddingTop > 0 ||
    props.settings.paddingRight > 0 ||
    props.settings.paddingBottom > 0 ||
    props.settings.paddingLeft > 0
);

// Mouse Wheel Zoom Logic
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();

  const zoomIn = e.deltaY < 0;
  const step = 0.05;
  const delta = zoomIn ? step : -step;

  let newScaleX = props.settings.scaleX + delta;
  let newScaleY = props.settings.scaleY + delta;

  newScaleX = Math.min(3, Math.max(0.5, newScaleX));
  newScaleY = Math.min(3, Math.max(0.5, newScaleY));

  newScaleX = Number(newScaleX.toFixed(2));
  newScaleY = Number(newScaleY.toFixed(2));

  emit("settingsChange", {
    scaleX: newScaleX,
    scaleY: newScaleY,
  });
};

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener("wheel", handleWheel, {
      passive: false,
    });
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener("wheel", handleWheel);
  }
  window.removeEventListener("mouseup", handleMouseUp);
  window.removeEventListener("mousemove", handleMouseMove);
});

const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return; // Only left click
  isDragging.value = true;
  hasMoved.value = false;
  dragStart.value = { x: e.clientX, y: e.clientY };
  initialOffset.value = {
    x: props.settings.offsetX,
    y: props.settings.offsetY,
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;

  const dx = e.clientX - dragStart.value.x;
  const dy = e.clientY - dragStart.value.y;

  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    hasMoved.value = true;
  }

  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();

    const percentX = dx / rect.width;
    const percentY = dy / rect.height;

    emit("settingsChange", {
      offsetX: initialOffset.value.x + percentX,
      offsetY: initialOffset.value.y + percentY,
    });
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
};

const handleGridClick = (index: number) => {
  if (hasMoved.value) return;

  const newSet = new Set(props.selectedIndices);
  if (newSet.has(index)) {
    newSet.delete(index);
  } else {
    newSet.add(index);
  }
  emit("selectionChange", newSet);
};

const handleGridResize = (rows: number, cols: number) => {
  emit("settingsChange", { rows, cols });
  emit("selectionChange", new Set());
};
</script>
