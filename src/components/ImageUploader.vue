<template>
  <div
    :class="[
      'h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all duration-300',
      isDragging
        ? 'border-apple-blue bg-apple-blue/5'
        : 'border-apple-border bg-white',
    ]"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div
      class="w-16 h-16 bg-apple-gray rounded-full flex items-center justify-center mb-6 text-apple-subtext"
    >
      <ImageIcon :size="32" />
    </div>
    <h3 class="text-xl font-medium text-apple-text mb-2">上传图片</h3>
    <p class="text-apple-subtext mb-8 text-center max-w-xs">
      拖拽图片到这里，或者点击选择
      <br />
      <span class="text-xs mt-2 block">支持 JPG, PNG, WEBP (最大 10MB)</span>
    </p>

    <input
      type="file"
      ref="inputRef"
      class="hidden"
      :accept="SUPPORTED_FORMATS.join(',')"
      @change="onFileChange"
    />

    <Button @click="triggerUpload" variant="primary" class="shadow-lg">
      <Upload :size="18" class="mr-2" />
      选择照片
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Upload, Image as ImageIcon } from "lucide-vue-next";
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FORMATS } from "../constants";
import type { ImageInfo } from "../types";
import Button from "./ui/Button.vue";

const emit = defineEmits<{
  (e: "imageSelected", info: ImageInfo): void;
  (e: "error", msg: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const handleFile = (file: File) => {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    emit("error", "不支持的文件格式。请使用 PNG, JPG 或 WEBP。");
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    emit("error", "文件过大。最大限制为 10MB。");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    const img = new Image();
    img.onload = () => {
      emit("imageSelected", {
        src,
        file,
        width: img.width,
        height: img.height,
        originalName: file.name,
      });
    };
    img.src = src;
  };
  reader.readAsDataURL(file);
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files?.[0]) {
    handleFile(e.dataTransfer.files[0]);
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    handleFile(target.files[0]);
  }
};

const triggerUpload = () => {
  inputRef.value?.click();
};
</script>
