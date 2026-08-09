<template>
  <span class="flip-number">
    <span
      v-for="(ch, idx) in formattedDigits"
      :key="idx"
      class="flip-digit"
      :class="{
        'flip-digit-comma': ch === ',',
        'flip-digit-decimal': idx === decimalStart && decimalStart > 0,
      }"
    >
      <template v-if="ch === ','">
        <span class="flip-comma">,</span>
      </template>
      <template v-else>
        <span class="flip-num">{{ ch }}</span>
      </template>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    decimals?: number;
    separator?: string;
  }>(),
  {
    decimals: 0,
    separator: ',',
  },
);

const formattedDigits = computed(() => {
  const fixed = Number(props.value).toFixed(props.decimals);
  const [intPart, decPart] = fixed.split('.');
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.separator);
  const result = withSep.split('');
  if (decPart) {
    result.push('.');
    result.push(...decPart.split(''));
  }
  return result;
});

const decimalStart = computed(() => {
  const fixed = Number(props.value).toFixed(props.decimals);
  const [intPart] = fixed.split('.');
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.separator).length;
});
</script>

<style scoped>
.flip-number {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
}

.flip-digit {
  display: inline-block;
  font-variant-numeric: tabular-nums;
  animation: digitFlip 0.6s ease-out;
}

.flip-num {
  display: inline-block;
  animation: numRoll 0.6s ease-out;
}

.flip-comma {
  display: inline-block;
  animation: numRoll 0.6s ease-out;
  margin: 0 1px;
}

@keyframes digitFlip {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes numRoll {
  0% {
    opacity: 0;
    transform: translateY(-50%) scale(0.5);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
</style>
