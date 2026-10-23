<script setup lang="ts">
import { computed, useId } from 'vue';
const props = withDefaults(defineProps<{ progress?: number }>(), { progress: 1 });
const id = useId().replace(/:/g, '');
const phase = (start: number, end: number) => Math.max(0, Math.min(1, (props.progress - start) / (end - start)));
const stream = computed(() => phase(0.02, 0.19));
const pipes = computed(() => phase(0.16, 0.55));
const homes = computed(() => phase(0.42, 0.64));
const fill = computed(() => phase(0.57, 0.89));
const spill = computed(() => phase(0.89, 0.98));
const pipePath = 'M276 239V286Q276 310 252 310H137Q111 310 111 336V545Q111 565 137 565H578Q604 565 604 585V616H556';
</script>

<template>
  <svg class="water-network" viewBox="0 0 720 720" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient :id="`${id}-water`" x1="180" y1="230" x2="540" y2="650" gradientUnits="userSpaceOnUse">
        <stop stop-color="#baf5df" />
        <stop offset=".55" stop-color="#47c7c1" />
        <stop offset="1" stop-color="#158b9b" />
      </linearGradient>
      <linearGradient :id="`${id}-metal`" x1="0" y1="90" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop stop-color="#b7d9c7" />
        <stop offset=".55" stop-color="#e4efdc" />
        <stop offset="1" stop-color="#82b2a6" />
      </linearGradient>
      <clipPath :id="`${id}-reservoir`"><rect x="164" y="599" width="390" height="88" rx="13" /></clipPath>
      <linearGradient :id="`${id}-cascade`" x1="0" y1="598" x2="0" y2="707" gradientUnits="userSpaceOnUse">
        <stop stop-color="#a5ecdb" />
        <stop offset=".4" stop-color="#71d8c7" />
        <stop offset="1" stop-color="#71d8c7" stop-opacity=".12" />
      </linearGradient>
      <clipPath :id="`${id}-spill`"><rect x="536" y="594" width="55" :height="116 * spill" /></clipPath>
      <pattern :id="`${id}-grain`" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r=".8" fill="#bad7c6" opacity=".25" />
      </pattern>
    </defs>
    <rect width="720" height="720" :fill="`url(#${id}-grain)`" />
    <circle cx="538" cy="155" r="105" fill="#e8c785" opacity=".18" />
    <circle cx="538" cy="155" r="65" fill="#edcf94" />
    <path d="M371 174C401 158 424 164 438 184H485C493 158 522 158 537 177H583" stroke="#d3e5d3" stroke-width="2" opacity=".55" />
    <path d="M60 451Q171 358 284 414T505 398Q593 372 667 438V539H60Z" fill="#bdd7be" opacity=".35" />
    <path d="M65 496Q185 444 331 482T659 470V538H65Z" fill="#88bfae" opacity=".25" />
    <ellipse cx="363" cy="544" rx="290" ry="20" fill="#143e43" opacity=".15" />
    <!-- A generous, recognisable tap with a valve and open spout. -->
    <path d="M92 127H242Q276 127 276 161V185" stroke="#456e65" stroke-width="44" stroke-linejoin="round" />
    <path d="M92 127H242Q276 127 276 161V185" :stroke="`url(#${id}-metal)`" stroke-width="40" stroke-linejoin="round" />
    <path d="M92 115H242Q264 115 264 143" stroke="#fff5db" stroke-width="4" stroke-linecap="round" opacity=".8" />
    <rect x="77" y="99" width="20" height="56" rx="5" fill="#e5efd9" />
    <path d="M176 109V79M143 76H209" stroke="#d8e8d1" stroke-width="12" stroke-linecap="round" />
    <ellipse cx="276" cy="185" rx="20" ry="6" fill="#163e43" />
    <path
      d="M276 191V235"
      stroke="#62d9cd"
      stroke-width="12"
      stroke-linecap="round"
      pathLength="1"
      stroke-dasharray="1"
      :stroke-dashoffset="1 - stream"
    />
    <path d="M270 197V229" stroke="#e4fff0" stroke-width="2" :opacity="stream" />
    <!-- The descending pipe draws only as the reader advances. -->
    <path :d="pipePath" stroke="#b2c9bb" stroke-width="24" stroke-linejoin="round" opacity=".48" />
    <path :d="pipePath" stroke="#315d5e" stroke-width="16" stroke-linejoin="round" />
    <path
      :d="pipePath"
      :stroke="`url(#${id}-water)`"
      stroke-width="10"
      stroke-linecap="round"
      pathLength="1"
      stroke-dasharray="1"
      :stroke-dashoffset="1 - pipes"
    />
    <g v-for="(x, index) in [178, 343, 508]" :key="x">
      <path :d="`M${x} 565V524`" stroke="#b2c9bb" stroke-width="16" />
      <path :d="`M${x} 565V524`" stroke="#72dbca" stroke-width="7" pathLength="1" stroke-dasharray="1" :stroke-dashoffset="1 - homes" />
      <path :d="`M${x - 51} 452L${x + 2} 413L${x + 55} 452V525H${x - 51}Z`" fill="#f5efda" stroke="#244d4e" stroke-width="2" />
      <path
        :d="`M${x - 62} 454L${x + 2} 404L${x + 66} 454`"
        :stroke="index === 1 ? '#bd8767' : '#799f91'"
        stroke-width="13"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path :d="`M${x - 34} 423V406H${x - 20}V413`" stroke="#b88766" stroke-width="7" />
      <rect :x="x - 31" y="468" width="24" height="27" rx="3" :fill="homes > 0.5 ? '#e9bd69' : '#9ebdb2'" />
      <path :d="`M${x - 19} 468V495M${x - 31} 481H${x - 7}`" stroke="#f6efd9" stroke-width="2" />
      <rect :x="x + 16" y="480" width="23" height="45" rx="3" fill="#315d5e" />
      <circle :cx="x + 32" cy="504" r="2" fill="#e9bd69" />
    </g>
    <g stroke="#96b8a2" stroke-width="3">
      <path d="M642 525V451M642 490Q617 471 624 455Q646 463 642 490M642 473Q665 454 660 441Q640 451 642 473" />
      <path d="M75 529V486M75 508Q53 497 61 482Q78 490 75 508" />
    </g>
    <!-- The lower reservoir fills, then pours visibly down the right edge. -->
    <rect x="157" y="591" width="404" height="103" rx="19" fill="#ecf0d9" stroke="#8eb9ad" stroke-width="3" />
    <g :clip-path="`url(#${id}-reservoir)`">
      <rect x="164" :y="687 - 88 * fill" width="390" height="88" :fill="`url(#${id}-water)`" />
      <path
        :d="`M155 ${687 - 88 * fill}Q205 ${674 - 88 * fill} 255 ${687 - 88 * fill}T355 ${687 - 88 * fill}T455 ${687 - 88 * fill}T565 ${687 - 88 * fill}`"
        stroke="#d4fff0"
        stroke-width="3"
      />
    </g>
    <path d="M184 618H197M184 641H197M184 664H197" stroke="#46796d" stroke-width="2" />
    <!-- Water rolls over the lip as one sheet; the reveal follows gravity. -->
    <g :clip-path="`url(#${id}-spill)`">
      <path
        d="M541 599C556 596 565 600 568 613C571 631 568 659 572 684C573 692 577 698 580 703C570 708 559 708 552 703C558 696 561 688 561 678L560 622C560 610 555 605 541 605Z"
        :fill="`url(#${id}-cascade)`"
      />
      <path
        d="M544 601C557 599 563 605 564 616C566 637 563 660 566 681"
        stroke="#d4fff0"
        stroke-width="2"
        stroke-linecap="round"
        opacity=".7"
      />
    </g>
    <ellipse cx="567" cy="704" rx="21" ry="3" fill="#71d8c7" :opacity="Math.max(0, (spill - 0.85) / 0.15) * 0.3" />
    <g font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="2" fill="currentColor" opacity=".8">
      <text x="91" y="45">01 / ABRIR</text>
      <text x="145" y="281">02 / CONECTAR</text>
      <text x="370" y="379">03 / LLEGAR A CASA</text>
      <text x="218" y="650">CADA GOTA CUENTA</text>
    </g>
  </svg>
</template>
<style scoped>
.water-network {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  color: inherit;
}
</style>
