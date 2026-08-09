<template>
  <div class="panel-corners">
    <span class="corner corner-tl" />
    <span class="corner corner-tr" />
    <span class="corner corner-bl" />
    <span class="corner corner-br" />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.panel-corners {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #00d4ff;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
  animation: cornerPulse 3s ease-in-out infinite;
}

.corner-tl {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}
.corner-tr {
  top: -1px;
  right: -1px;
  border-left: none;
  border-bottom: none;
}
.corner-bl {
  bottom: -1px;
  left: -1px;
  border-right: none;
  border-top: none;
}
.corner-br {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

@keyframes cornerPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; box-shadow: 0 0 14px rgba(0, 212, 255, 0.9); }
}
</style>
