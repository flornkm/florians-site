import Button, { InlineLink } from "#components/Button"
import { Eye, Rotate, Trash } from "#design-system/Icons"
import { useState } from "preact/hooks"

export default function Page() {
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <>
      <style>
        {`
          @keyframes draw {
            from {
              stroke-dashoffset: 1000;
            }
            to {
              stroke-dashoffset: 0;
            }
          }

          .svg-container path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.1));
          }
          
          .svg-container {
            background: #f5f5f5 !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
            position: relative;
          }

          .svg-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.03) 0px,
              rgba(0, 0, 0, 0.03) 1px,
              transparent 1px,
              transparent 16px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.03) 0px,
              rgba(0, 0, 0, 0.03) 1px,
              transparent 1px,
              transparent 16px
            );
          }

          @media (prefers-color-scheme: dark) {
            .svg-container {
                background: #0A0A0A !important;
              }

            .svg-container::before {
              background: repeating-linear-gradient(
                0deg,
                rgba(255, 255, 255, 0.03) 0px,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px,
                transparent 16px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.03) 0px,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px,
                transparent 16px
              );
            }

            .svg-container path {
              stroke: #fff;
            }
          }

          /* Hover state */
          .svg-container:hover path:nth-child(1) { stroke-dashoffset: 0; transition-delay: 0s; }
          .svg-container:hover path:nth-child(2) { stroke-dashoffset: 0; transition-delay: 0.1s; }
          .svg-container:hover path:nth-child(3) { stroke-dashoffset: 0; transition-delay: 0.2s; }
          .svg-container:hover path:nth-child(4) { stroke-dashoffset: 0; transition-delay: 0.3s; }
          .svg-container:hover path:nth-child(5) { stroke-dashoffset: 0; transition-delay: 0.4s; }
          .svg-container:hover path:nth-child(6) { stroke-dashoffset: 0; transition-delay: 0.5s; }
          .svg-container:hover path:nth-child(7) { stroke-dashoffset: 0; transition-delay: 0.6s; }
          .svg-container:hover path:nth-child(8) { stroke-dashoffset: 0; transition-delay: 0.7s; }
          .svg-container:hover path:nth-child(9) { stroke-dashoffset: 0; transition-delay: 0.8s; }
          .svg-container:hover path:nth-child(10) { stroke-dashoffset: 0; transition-delay: 0.9s; }
          
          /* Un-hover state (reverse order) */
          .svg-container path:nth-child(1) { transition-delay: 0.9s; }
          .svg-container path:nth-child(2) { transition-delay: 0.8s; }
          .svg-container path:nth-child(3) { transition-delay: 0.7s; }
          .svg-container path:nth-child(4) { transition-delay: 0.6s; }
          .svg-container path:nth-child(5) { transition-delay: 0.5s; }
          .svg-container path:nth-child(6) { transition-delay: 0.4s; }
          .svg-container path:nth-child(7) { transition-delay: 0.3s; }
          .svg-container path:nth-child(8) { transition-delay: 0.2s; }
          .svg-container path:nth-child(9) { transition-delay: 0.1s; }
          .svg-container path:nth-child(10) { transition-delay: 0s; }
        `}
      </style>
      <div class="flex items-center mb-4 py-2 bg-transparent sticky top-0 lg:top-14 z-50">
        <div class="w-[99vw] bg-light-neutral/95 backdrop-blur-xl dark:bg-black/90 absolute top-0 bottom-0 left-1/2 -translate-x-1/2" />
        <div class="flex relative z-20">
          <InlineLink link="/archive" class="px-1.5 -ml-1.5">
            Archive
          </InlineLink>
          <p> / </p>
          <InlineLink link="/archive/experiments" class="px-1.5 line-clamp-1">
            Experiments
          </InlineLink>
          <p> / </p>
          <p class="font-medium px-1.5 text-neutral-400 dark:text-neutral-600 truncate">
            SVG Animation
          </p>
        </div>
      </div>
      <div class="w-full h-[calc(100vh-256px)] flex items-center justify-center">
        <div class="svg-container text-blue-900 rounded-2xl p-4 shadow-sm py-16 px-32 overflow-hidden">
          <SVG />
        </div>
      </div>
    </>
  )
}

function SVG() {
  return (
    <svg
      width="598"
      height="257"
      viewBox="0 0 598 257"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32.6055 152.63C32.6055 152.63 43.0055 143.4 52.9655 148.36C59.6355 151.68 46.0255 157.2 44.6555 164.61C43.9555 165.23 46.2355 170.76 53.5955 168.08C53.5955 168.08 61.2255 165.51 65.3255 162.19C65.3255 162.19 83.8455 145.84 85.1055 146.41C85.1055 146.41 66.4855 158.3 49.0255 185.23C49.0255 185.23 27.7855 213 14.2055 213.63C14.2055 213.63 2.30551 214.79 4.20551 206.59C4.68551 204.51 7.37551 204.43 8.10551 205.11C8.87551 205.82 8.84551 207.84 6.52551 207.42M19.0455 201.85C19.0455 201.85 23.6755 193.01 43.4455 188.17L75.4255 179.76C75.4255 179.76 102.196 171.89 115.026 157.91C115.026 157.91 130.916 137.48 106.826 150C104.196 151.37 80.6655 171.39 69.8555 187.54C60.1655 202.01 57.9255 207.24 59.9655 211.42C59.9655 211.42 66.2755 219.83 78.2655 205.74C78.2655 205.74 84.6855 199.01 86.0455 191.01"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M97.5355 195.78C97.5355 195.78 115.016 177.69 125.776 182.89C125.856 182.61 128.496 184.25 126.216 190.57C126.216 190.57 130.296 181.93 122.016 182.29C119.776 182.37 104.936 186.05 95.1355 205.05C95.1355 205.05 91.8955 214.13 98.2955 214.13C99.2955 214.13 100.536 213.77 102.096 213.25C102.856 213.01 109.776 209.57 117.456 201.01C126.336 191.09 128.336 189.13 133.696 183.17C133.216 183.05 114.176 206.73 114.576 211.29C114.576 211.29 114.296 214.09 117.536 214.13C118.656 214.13 120.296 213.97 122.456 212.97C122.456 212.97 131.536 208.54 141.696 195.78"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M141.696 195.78L164.656 167.61C164.656 167.61 108.816 244.97 106.976 247.53C111.416 244.85 141.816 193.97 170.776 182.37C175.856 180.57 182.416 183.53 174.096 192.17C171.736 194.61 157.016 203.61 155.656 208.89C155.656 208.89 153.376 217.93 166.056 212.53C166.056 212.53 173.776 208.06 183.936 195.78"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M183.936 195.78L206.896 167.61C206.896 167.61 151.056 244.97 149.216 247.53C153.656 244.85 184.056 193.97 213.016 182.37C218.096 180.57 224.656 183.53 216.336 192.17C213.976 194.61 199.256 203.61 197.896 208.89C197.896 208.89 195.616 217.93 208.296 212.53C208.296 212.53 216.016 208.06 226.176 195.78"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M226.176 195.78L240.976 182.77C240.976 182.77 225.016 198.25 220.496 208.61C220.496 208.61 217.136 217.69 230.216 212.85C230.216 212.85 237.376 211.49 249.056 199.49C256.736 191.57 255.576 192.45 264.496 182.97C255.656 192.13 220.216 255.61 197.136 252.45C187.776 251.13 203.296 236.09 227.736 228.41C236.496 225.65 250.496 218.61 258.656 209.85C266.856 201.05 270.856 196.22 270.776 195.78"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M348.819 170.03C348.819 170.03 340.709 182.78 330.219 181.63C329.309 181.53 320.849 177.17 331.859 162.29C361.599 128.48 377.239 154.07 359.819 174.34C359.819 174.34 347.479 190.11 323.529 200.08C323.529 200.08 309.249 206.18 305.969 214.8C305.969 214.8 314.599 204.09 327.539 204.69C335.479 205.05 331.679 206.02 346.289 211.68C349.399 212.89 358.479 211.23 362.799 199.63"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M409.799 190.91C430.919 156.03 416.369 147.35 414.429 146.73C401.309 142.56 382.329 162.72 375.409 177.44C370.179 188.55 365.869 204.4 372.879 212.79C375.819 216.3 396.659 212.61 409.799 190.91Z"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M453.369 170.03C453.369 170.03 445.259 182.78 434.769 181.63C433.859 181.53 425.399 177.17 436.409 162.29C466.149 128.48 481.789 154.07 464.369 174.34C464.369 174.34 452.029 190.11 428.079 200.08C428.079 200.08 413.799 206.18 410.519 214.8C410.519 214.8 419.149 204.09 432.089 204.69C440.029 205.05 436.229 206.02 450.839 211.68C453.949 212.89 463.029 211.23 467.349 199.63"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M531.849 142C529.739 146.94 522.589 149.46 521.009 149.68C512.889 150.54 511.629 143.4 496.189 153.57L499.659 146.94L483.149 177.76C479.089 180.81 476.859 183.86 473.989 186.91C489.059 166.08 509.139 173.38 506.289 191.33C504.579 202.06 497.449 220.95 474.419 227.62C467.469 229.63 450.009 230.38 448.329 222.46"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M532.5 141.5C536.312 123.203 539.5 102.5 554.224 87.5C568.947 72.5 569.5 62.0161 569.5 62.0161M569.5 62.0161C561.333 59.5161 545 49.3161 545 28.5161C545 2.51605 566.5 4.01605 569.5 4.01605C572.5 4.01605 594 4.01605 594 28.5161C594 48.1161 577 59.0161 569.5 62.0161Z"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
