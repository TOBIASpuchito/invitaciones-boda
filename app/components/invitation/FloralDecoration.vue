<template>
  <div class="floral-bg" aria-hidden="true">

    <!-- Top-right: realistic olive/eucalyptus branch -->
    <svg class="floral floral--tr" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway sway--1">
        <!-- main stem -->
        <path d="M290 0 C270 40 240 80 200 130 C165 175 130 210 90 260 C60 298 35 340 15 390"
              stroke="#2d4a2a" stroke-width="2.2" stroke-linecap="round" fill="none"/>

        <!-- leaf pair 1 -->
        <path d="M255 42 C245 28 225 20 210 28 C200 35 205 50 220 52 C235 54 250 48 255 42Z"
              fill="#3a5c35" opacity="0.82"/>
        <path d="M255 42 C260 30 275 18 288 22 C298 26 297 40 285 44 C272 48 260 46 255 42Z"
              fill="#4a7040" opacity="0.75"/>
        <line x1="255" y1="42" x2="232" y2="38" stroke="#2d4a2a" stroke-width="0.8" opacity="0.6"/>
        <line x1="255" y1="42" x2="278" y2="32" stroke="#2d4a2a" stroke-width="0.8" opacity="0.6"/>

        <!-- leaf pair 2 -->
        <path d="M228 82 C212 66 190 60 178 70 C168 78 175 94 192 97 C209 100 224 92 228 82Z"
              fill="#3a5c35" opacity="0.80"/>
        <path d="M228 82 C236 68 254 58 268 64 C280 70 278 86 265 91 C250 96 235 92 228 82Z"
              fill="#4a7040" opacity="0.72"/>
        <line x1="228" y1="82" x2="200" y2="80" stroke="#2d4a2a" stroke-width="0.8" opacity="0.5"/>
        <line x1="228" y1="82" x2="255" y2="73" stroke="#2d4a2a" stroke-width="0.8" opacity="0.5"/>

        <!-- leaf pair 3 -->
        <path d="M196 126 C178 110 155 105 143 116 C133 125 141 141 159 144 C177 147 192 138 196 126Z"
              fill="#3a5c35" opacity="0.78"/>
        <path d="M196 126 C206 113 225 104 238 111 C250 118 246 135 232 140 C217 145 202 140 196 126Z"
              fill="#4a7040" opacity="0.70"/>

        <!-- leaf pair 4 -->
        <path d="M162 172 C144 156 120 151 108 163 C98 173 106 190 125 193 C144 196 158 186 162 172Z"
              fill="#3a5c35" opacity="0.75"/>
        <path d="M162 172 C172 160 192 151 205 158 C217 165 213 183 198 188 C183 193 168 187 162 172Z"
              fill="#4a7040" opacity="0.68"/>

        <!-- leaf pair 5 -->
        <path d="M124 220 C107 204 83 200 71 212 C61 222 70 240 89 243 C108 246 120 236 124 220Z"
              fill="#3a5c35" opacity="0.72"/>
        <path d="M124 220 C135 208 155 200 168 208 C180 215 175 233 160 238 C145 243 130 237 124 220Z"
              fill="#4a7040" opacity="0.65"/>

        <!-- small berries -->
        <circle cx="268" cy="20" r="3.5" fill="#2d4a2a" opacity="0.55"/>
        <circle cx="275" cy="14" r="2.5" fill="#2d4a2a" opacity="0.45"/>
        <circle cx="262" cy="13" r="2" fill="#2d4a2a" opacity="0.40"/>
        <circle cx="240" cy="96" r="3" fill="#2d4a2a" opacity="0.45"/>
        <circle cx="248" cy="90" r="2" fill="#2d4a2a" opacity="0.38"/>
      </g>
    </svg>

    <!-- Bottom-left: realistic botanical fern/eucalyptus -->
    <svg class="floral floral--bl" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway sway--2">
        <!-- main stem -->
        <path d="M30 420 C50 378 80 338 118 292 C152 250 188 212 225 168 C255 132 280 90 300 40"
              stroke="#2d4a2a" stroke-width="2.2" stroke-linecap="round" fill="none"/>

        <!-- leaf pair 1 (bottom) -->
        <path d="M65 378 C50 360 28 354 16 366 C6 376 15 393 35 396 C55 399 68 390 65 378Z"
              fill="#3a5c35" opacity="0.82"/>
        <path d="M65 378 C76 364 97 357 110 365 C122 373 117 391 102 396 C87 401 71 394 65 378Z"
              fill="#4a7040" opacity="0.75"/>
        <line x1="65" y1="378" x2="38" y2="374" stroke="#2d4a2a" stroke-width="0.8" opacity="0.5"/>
        <line x1="65" y1="378" x2="92" y2="368" stroke="#2d4a2a" stroke-width="0.8" opacity="0.5"/>

        <!-- leaf pair 2 -->
        <path d="M100 334 C84 316 60 311 48 323 C38 333 47 351 67 354 C87 357 102 346 100 334Z"
              fill="#3a5c35" opacity="0.80"/>
        <path d="M100 334 C112 320 133 313 146 322 C158 330 152 348 137 353 C122 358 106 350 100 334Z"
              fill="#4a7040" opacity="0.72"/>

        <!-- leaf pair 3 -->
        <path d="M138 286 C122 268 98 264 86 276 C76 286 85 304 105 307 C125 310 140 300 138 286Z"
              fill="#3a5c35" opacity="0.78"/>
        <path d="M138 286 C150 272 171 265 184 274 C196 282 190 300 175 305 C160 310 144 302 138 286Z"
              fill="#4a7040" opacity="0.70"/>

        <!-- leaf pair 4 -->
        <path d="M174 240 C158 222 134 218 122 230 C112 240 121 258 141 261 C161 264 176 254 174 240Z"
              fill="#3a5c35" opacity="0.75"/>
        <path d="M174 240 C186 226 207 219 220 228 C232 236 226 254 211 259 C196 264 180 256 174 240Z"
              fill="#4a7040" opacity="0.68"/>

        <!-- leaf pair 5 -->
        <path d="M210 194 C194 176 170 172 158 184 C148 194 157 212 177 215 C197 218 212 208 210 194Z"
              fill="#3a5c35" opacity="0.72"/>
        <path d="M210 194 C222 180 243 173 256 182 C268 190 262 208 247 213 C232 218 216 210 210 194Z"
              fill="#4a7040" opacity="0.65"/>

        <!-- leaf pair 6 (top) -->
        <path d="M248 146 C232 128 208 124 196 136 C186 146 195 164 215 167 C235 170 250 160 248 146Z"
              fill="#3a5c35" opacity="0.70"/>
        <path d="M248 146 C260 132 281 125 294 134 C306 142 300 160 285 165 C270 170 254 162 248 146Z"
              fill="#4a7040" opacity="0.62"/>

        <!-- small berries -->
        <circle cx="18" cy="362" r="3.5" fill="#2d4a2a" opacity="0.50"/>
        <circle cx="10" cy="356" r="2.5" fill="#2d4a2a" opacity="0.42"/>
        <circle cx="22" cy="354" r="2" fill="#2d4a2a" opacity="0.38"/>
        <circle cx="280" cy="136" r="3" fill="#2d4a2a" opacity="0.45"/>
        <circle cx="290" cy="128" r="2" fill="#2d4a2a" opacity="0.38"/>
      </g>
    </svg>

  </div>
</template>

<style scoped>
.floral-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.floral {
  position: absolute;
  width: clamp(180px, 28vw, 340px);
}

.floral--tr {
  top: -2rem;
  right: -2rem;
}

.floral--bl {
  bottom: -2rem;
  left: -2rem;
}

/* ── sway animations ─────────────────────────────── */
.sway--1 {
  transform-origin: 88% 2%;
  animation: sway1 7s ease-in-out infinite;
}

.sway--2 {
  transform-origin: 10% 98%;
  animation: sway2 8.5s ease-in-out infinite;
}

@keyframes sway1 {
  0%, 100% { transform: rotate(0deg) skewX(0deg); }
  25%       { transform: rotate(2deg) skewX(0.4deg); }
  60%       { transform: rotate(-1.4deg) skewX(-0.3deg); }
}

@keyframes sway2 {
  0%, 100% { transform: rotate(0deg) skewX(0deg); }
  30%       { transform: rotate(-2.2deg) skewX(-0.4deg); }
  68%       { transform: rotate(1.5deg) skewX(0.3deg); }
}
</style>

