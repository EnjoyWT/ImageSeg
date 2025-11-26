<template>
  <div class="absolute inset-0 pointer-events-none z-30">
    <!-- Row adjuster - Right edge -->
    <div
      class="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-auto cursor-row-resize hover:bg-apple-blue/10 transition-colors group"
      @mousedown.stop="handleMouseDown('rows', $event)"
    >
      <div
        class="flex flex-col items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-3 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripHorizontal :size="16" class="text-apple-blue" />
        <span class="text-xs font-semibold text-apple-text">{{
          displayRows
        }}</span>
        <span class="text-[9px] text-apple-subtext">行</span>
      </div>
    </div>

    <!-- Column adjuster - Bottom edge -->
    <div
      class="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center pointer-events-auto cursor-col-resize hover:bg-apple-blue/10 transition-colors group"
      @mousedown.stop="handleMouseDown('cols', $event)"
    >
      <div
        class="flex flex-row items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical :size="16" class="text-apple-blue" />
        <span class="text-xs font-semibold text-apple-text">{{
          displayCols
        }}</span>
        <span class="text-[9px] text-apple-subtext">列</span>
      </div>
    </div>

    <!-- Active drag feedback -->
    <div
      v-if="isDragging"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-apple-blue text-white px-6 py-3 rounded-xl shadow-2xl text-lg font-bold z-50 pointer-events-none"
    >
      {{ displayRows }} × {{ displayCols }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { GripVertical, GripHorizontal } from "lucide-vue-next";

const props = defineProps<{
  rows: number;
  cols: number;
}>();

const emit = defineEmits<{
  (e: "gridChange", rows: number, cols: number): void;
}>();

const isDragging = ref(false);
const dragType = ref<"rows" | "cols" | null>(null);
const tempValue = ref<number | null>(null);
const startPos = ref({ x: 0, y: 0 });
const startValue = ref(0);

const handleMouseDown = (type: "rows" | "cols", e: MouseEvent) => {
  isDragging.value = true;
  dragType.value = type;
  startPos.value = { x: e.clientX, y: e.clientY };
  startValue.value = type === "rows" ? props.rows : props.cols;

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !dragType.value) return;

  const delta =
    dragType.value === "rows"
      ? (e.clientY - startPos.value.y) / 50
      : (e.clientX - startPos.value.x) / 50;

  const newValue = Math.max(
    1,
    Math.min(20, Math.round(startValue.value + delta))
  );
  tempValue.value = newValue;
};

const handleMouseUp = () => {
  if (tempValue.value !== null && dragType.value) {
    if (dragType.value === "rows") {
      emit("gridChange", tempValue.value, props.cols);
    } else {
      emit("gridChange", props.rows, tempValue.value);
    }
  }
  isDragging.value = false;
  dragType.value = null;
  tempValue.value = null;

  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
};

const displayRows = computed(() =>
  tempValue.value !== null && dragType.value === "rows"
    ? tempValue.value
    : props.rows
);

const displayCols = computed(() =>
  tempValue.value !== null && dragType.value === "cols"
    ? tempValue.value
    : props.cols
);

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
});
</script>
