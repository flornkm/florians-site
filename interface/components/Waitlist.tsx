import { Send } from "#design-system/Icons"
import { useRef, useState } from "preact/hooks"
import Button from "./Button"

const subscribeToWaitlist = async (email: string) => {
  const res = await fetch("/api/waitlist", {
    method: "POST",
    body: JSON.stringify({ email: email }),
  })

  return res.status
}

export default function Waitlist() {
  const mailInput = useRef<HTMLInputElement>(null)
  const [info, setInfo] = useState(
    undefined as Record<string, string> | undefined
  )
  const [loading, setLoading] = useState(false)

  const subscribe = async () => {
    setLoading(true)

    const email = mailInput.current!.value

    if (
      email === "" ||
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i.test(email) === false
    ) {
      setLoading(false)
      return setInfo({
        message: "Please enter a valid email address.",
        type: "error",
      })
    }

    const status = await subscribeToWaitlist(email)

    if (status !== 200) {
      setLoading(false)
      return setInfo({ message: "Something went wrong.", type: "error" })
    }

    setLoading(false)
    mailInput.current!.value = ""
    setInfo({ message: "You're on the list!", type: "success" })
  }

  return (
    <div class="w-full py-4">
      <div
        class={
          "flex gap-4 group sticky bottom-0.5 -left-1 -right-1 " +
          (loading ? "cursor-not-allowed" : "")
        }
      >
        <form class="relative w-full" onSubmit={(e) => e.preventDefault()}>
          <input
            onInput={() => {
              if (info) setInfo(undefined)
            }}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                subscribe()
              }
            }}
            ref={mailInput}
            type="text"
            placeholder="john.doe@domain.com"
            class={
              "w-full placeholder:text-neutral-400 relative top-[1px] disabled:cursor-not-allowed outline-0 outline-neutral-500/0 transition-all focus:outline-4 focus:outline-neutral-500/10 outline-offset-1 px-6 py-3 rounded-full bg-white border dark:bg-neutral-800 dark:placeholder:text-neutral-500 dark:focus:outline-none " +
              (info && info.type === "error"
                ? "border-red-200 focus:border-red-300 text-red-500 dark:border-red-700/50 dark:focus:border-red-700"
                : info && info.type === "success"
                ? "border-green-200 focus:border-green-300 text-green-500 dark:border-green-700/50 dark:focus:border-green-700"
                : "border-neutral-200 focus:border-neutral-300 dark:border-neutral-700/50 dark:focus:border-neutral-700") +
              (loading ? " opacity-50 pointer-events-none" : "")
            }
          />
          <Button
            function={() => {
              subscribe()
            }}
            rounded
            type="primary"
            class={
              "absolute right-1 top-1/2 -translate-y-1/2 group/button leading-none overflow-hidden md:hover:pl-28 mt-[1px] " +
              (loading ? "pointer-events-none opacity-50" : "")
            }
          >
            <>
              <p class="absolute hidden md:block transition-all opacity-0 md:group-hover/button:block group-hover/button:opacity-100 -left-[100%] group-hover/button:left-4 duration-200">
                Subscribe
              </p>
              <Send class="w-5 h-5 rotate-90" />
            </>
          </Button>
        </form>
      </div>
      {info && info.message && info.type === "error" ? (
        <p class="text-red-500 text-sm mt-2 ml-6">{info.message}</p>
      ) : info && info.message && info.type === "success" ? (
        <p class="text-green-500 text-sm mt-2 ml-6">{info.message}</p>
      ) : undefined}
    </div>
  )
}

export function DesignEngineerEyeCatcher() {
  return (
    <svg
      width="512"
      height="100%"
      viewBox="0 0 256 256"
      fill="none"
      class="mx-auto md:ml-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M105.682 59.9662C106.704 52.8802 109.627 46.5327 113.903 42.1092C118.179 37.6856 123.517 35.4884 128.92 35.928C134.322 36.3676 139.42 39.4138 143.261 44.4979C147.102 49.5819 149.424 56.356 149.792 63.5551C150.161 70.7543 148.551 77.8861 145.264 83.6187C141.977 89.3513 137.237 93.2928 131.929 94.7069C126.977 96.0261 121.848 95.0616 117.376 91.9968"
        stroke="#DBDEDE"
        stroke-width="4"
      />
      <g filter="url(#filter0_f_2725_2715)">
        <path
          d="M118.264 97.1777C112.828 95.8303 107.921 92.8838 104.177 88.7187L106.919 86.2538C110.17 89.8704 114.431 92.429 119.151 93.5989L118.264 97.1777Z"
          fill="#B1B1B1"
        />
      </g>
      <g filter="url(#filter1_di_2725_2715)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M145.254 222.341L111.746 164.303L98.3457 141.183C96.3828 137.797 95.7294 133.808 96.5091 129.973L103.568 95.2488C107.411 80.9055 121.767 73.7716 134.745 77.2488L169.878 90.8032C173.226 92.0951 176.043 94.4753 177.876 97.5613L189.927 117.855L190.506 118.831L224.014 176.869C226.801 181.695 225.142 187.87 220.309 190.661L159.051 226.028C154.218 228.818 148.041 227.168 145.254 222.341ZM139.293 94.6337C135.64 88.306 127.542 86.1418 121.206 89.7998C114.87 93.4578 112.696 101.553 116.349 107.881C120.002 114.208 128.1 116.373 134.436 112.715C140.772 109.056 142.947 100.961 139.293 94.6337Z"
          fill="#DADADA"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M145.254 222.341L111.746 164.303L98.3457 141.183C96.3828 137.797 95.7294 133.808 96.5091 129.973L103.568 95.2488C107.411 80.9055 121.767 73.7716 134.745 77.2488L169.878 90.8032C173.226 92.0951 176.043 94.4753 177.876 97.5613L189.927 117.855L190.506 118.831L224.014 176.869C226.801 181.695 225.142 187.87 220.309 190.661L159.051 226.028C154.218 228.818 148.041 227.168 145.254 222.341ZM139.293 94.6337C135.64 88.306 127.542 86.1418 121.206 89.7998C114.87 93.4578 112.696 101.553 116.349 107.881C120.002 114.208 128.1 116.373 134.436 112.715C140.772 109.056 142.947 100.961 139.293 94.6337Z"
          fill="url(#paint0_linear_2725_2715)"
        />
        <path
          d="M190.506 118.831L224.014 176.869C226.801 181.695 225.142 187.87 220.309 190.661L159.051 226.028C154.218 228.818 148.041 227.168 145.254 222.341L111.746 164.303L98.3457 141.183C96.3828 137.797 95.7294 133.808 96.5091 129.973L103.568 95.2488C107.411 80.9055 121.767 73.7716 134.745 77.2488L169.878 90.8032C173.226 92.0951 176.043 94.4753 177.876 97.5613L189.927 117.855M190.506 118.831L189.927 117.855M190.506 118.831C190.317 118.502 190.123 118.177 189.927 117.855M121.206 89.7998C127.542 86.1418 135.64 88.306 139.293 94.6337C142.947 100.961 140.772 109.056 134.436 112.715C128.1 116.373 120.002 114.208 116.349 107.881C112.696 101.553 114.87 93.4578 121.206 89.7998Z"
          stroke="#71717A"
          stroke-width="2"
        />
      </g>
      <g style="mix-blend-mode:overlay" clip-path="url(#clip0_2725_2715)">
        <path
          d="M166.644 179.499L153.036 131.93M169.429 136.322L182.923 139.938C184.524 140.367 185.473 142.012 185.044 143.612L181.429 157.107M150.252 175.107L136.757 171.491C135.157 171.062 134.207 169.417 134.636 167.817L138.252 154.322"
          stroke="black"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <g filter="url(#filter2_di_2725_2715)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M31.0943 176.204L64.6021 118.167L77.9242 95.0014C79.8755 91.6082 83.003 89.0481 86.7147 87.8055L120.316 76.5564C134.659 72.7132 148.015 81.5792 151.493 94.5564L157.321 131.76C157.876 135.306 157.223 138.935 155.467 142.065L143.918 162.649L143.362 163.639L109.854 221.676C107.067 226.503 100.89 228.154 96.0572 225.364L34.7994 189.996C29.9663 187.206 28.3075 181.031 31.0943 176.204ZM138.711 107.188C142.364 100.86 140.19 92.7655 133.854 89.1074C127.518 85.4494 119.42 87.6136 115.767 93.9414C112.114 100.269 114.288 108.364 120.624 112.022C126.96 115.68 135.058 113.516 138.711 107.188Z"
          fill="#DADADA"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M31.0943 176.204L64.6021 118.167L77.9242 95.0014C79.8755 91.6082 83.003 89.0481 86.7147 87.8055L120.316 76.5564C134.659 72.7132 148.015 81.5792 151.493 94.5564L157.321 131.76C157.876 135.306 157.223 138.935 155.467 142.065L143.918 162.649L143.362 163.639L109.854 221.676C107.067 226.503 100.89 228.154 96.0572 225.364L34.7994 189.996C29.9663 187.206 28.3075 181.031 31.0943 176.204ZM138.711 107.188C142.364 100.86 140.19 92.7655 133.854 89.1074C127.518 85.4494 119.42 87.6136 115.767 93.9414C112.114 100.269 114.288 108.364 120.624 112.022C126.96 115.68 135.058 113.516 138.711 107.188Z"
          fill="url(#paint1_linear_2725_2715)"
        />
        <path
          d="M143.362 163.639L109.854 221.676C107.067 226.503 100.89 228.154 96.0572 225.364L34.7994 189.996C29.9663 187.206 28.3075 181.031 31.0943 176.204L64.6021 118.167L77.9242 95.0014C79.8755 91.6082 83.003 89.0481 86.7147 87.8055L120.316 76.5564C134.659 72.7132 148.015 81.5792 151.493 94.5564L157.321 131.76C157.876 135.306 157.223 138.935 155.467 142.065L143.918 162.649M143.362 163.639L143.918 162.649M143.362 163.639C143.552 163.31 143.737 162.98 143.918 162.649M133.854 89.1074C140.19 92.7655 142.364 100.86 138.711 107.188C135.058 113.516 126.96 115.68 120.624 112.022C114.288 108.364 112.114 100.269 115.767 93.9414C119.42 87.6137 127.518 85.4494 133.854 89.1074Z"
          stroke="#71717A"
          stroke-width="2"
        />
      </g>
      <g filter="url(#filter3_f_2725_2715)">
        <path
          d="M121.567 91.9173C117.532 88.0324 114.756 83.0271 113.596 77.548L117.203 76.7843C118.21 81.5419 120.621 85.8882 124.124 89.2615L121.567 91.9173Z"
          fill="#B1B1B1"
        />
      </g>
      <g style="mix-blend-mode:overlay" clip-path="url(#clip1_2725_2715)">
        <path
          d="M102.579 170.574L114.008 154.252L120.809 159.014C123.814 161.118 124.545 165.26 122.44 168.265C120.336 171.27 116.195 172 113.19 169.896L107.749 166.086M66.6145 151.93L73.4298 133.205L81.2318 136.045C84.679 137.299 86.4563 141.111 85.2017 144.558C83.947 148.005 80.1354 149.783 76.6883 148.528L70.4467 146.256M103.686 160.505C100.935 165.271 94.8417 166.903 90.0764 164.152C85.311 161.401 83.6783 155.307 86.4295 150.542C89.1808 145.777 95.2743 144.144 100.04 146.895C104.805 149.646 106.438 155.74 103.686 160.505Z"
          stroke="black"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M74.8286 163.875C75.6073 163.241 76.7739 163.786 76.7863 164.79L76.8269 168.079C76.8318 168.478 77.0343 168.848 77.3673 169.067L80.1047 170.868C80.9299 171.411 80.7824 172.663 79.8535 172.999L76.6782 174.148C76.3134 174.28 76.0349 174.58 75.9307 174.954L75.0223 178.212C74.7549 179.172 73.5025 179.407 72.9057 178.609L70.9611 176.011C70.7198 175.689 70.333 175.509 69.931 175.532L66.6886 175.72C65.6911 175.777 65.064 174.662 65.6319 173.84L67.547 171.067C67.7684 170.746 67.8204 170.338 67.6864 169.972L66.5311 166.817C66.1922 165.891 67.0522 164.974 67.9977 165.253L71.162 166.187C71.5418 166.299 71.9525 166.217 72.2595 165.967L74.8286 163.875Z"
          fill="black"
        />
        <path
          d="M119.266 130.426C120.141 129.935 121.197 130.672 121.037 131.664L120.51 134.935C120.447 135.326 120.581 135.722 120.868 135.995L123.259 138.269C123.974 138.948 123.61 140.151 122.638 140.321L119.328 140.898C118.944 140.965 118.617 141.214 118.45 141.566L117.006 144.611C116.578 145.514 115.298 145.528 114.849 144.636L113.391 141.734C113.21 141.374 112.861 141.129 112.461 141.081L109.238 140.696C108.249 140.578 107.827 139.376 108.524 138.665L110.891 136.249C111.163 135.972 111.284 135.58 111.216 135.198L110.623 131.874C110.45 130.902 111.46 130.148 112.343 130.591L115.271 132.061C115.628 132.24 116.049 132.23 116.397 132.035L119.266 130.426Z"
          fill="black"
        />
        <path
          d="M101.197 133.116C99.9545 135.268 97.2024 136.005 95.0501 134.763C92.8977 133.52 92.1603 130.768 93.4029 128.616C94.6456 126.463 97.3977 125.726 99.5501 126.968C101.702 128.211 102.44 130.963 101.197 133.116Z"
          fill="black"
        />
        <path
          d="M96.8837 182.587C95.6411 184.739 92.8889 185.476 90.7366 184.234C88.5843 182.991 87.8468 180.239 89.0895 178.087C90.3321 175.934 93.0843 175.197 95.2366 176.44C97.3889 177.682 98.1263 180.434 96.8837 182.587Z"
          fill="black"
        />
      </g>
      <path
        d="M149.101 73.2636C150.501 66.2936 149.951 58.8821 147.553 52.4133C145.155 45.9444 141.072 40.8606 136.068 38.1112C131.063 35.3617 125.479 35.1348 120.359 37.4727C115.238 39.8106 110.931 44.5534 108.241 50.8155C105.552 57.0776 104.664 64.4306 105.744 71.5014C106.824 78.5723 109.797 84.8773 114.109 89.2392C118.421 93.601 123.776 95.7212 129.175 95.204"
        stroke="url(#paint2_linear_2725_2715)"
        stroke-width="4"
      />
      <defs>
        <filter
          id="filter0_f_2725_2715"
          x="100.176"
          y="82.2539"
          width="22.9746"
          height="18.9238"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="2"
            result="effect1_foregroundBlur_2725_2715"
          />
        </filter>
        <filter
          id="filter1_di_2725_2715"
          x="95.1875"
          y="75.3789"
          width="131.18"
          height="156.006"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.313726 0 0 0 0 0.313726 0 0 0 0 0.313726 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2725_2715"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2725_2715"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="5" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_2725_2715"
          />
        </filter>
        <filter
          id="filter2_di_2725_2715"
          x="28.7422"
          y="74.6514"
          width="129.771"
          height="156.069"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.313726 0 0 0 0 0.313726 0 0 0 0 0.313726 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2725_2715"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2725_2715"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="5" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_2725_2715"
          />
        </filter>
        <filter
          id="filter3_f_2725_2715"
          x="109.596"
          y="72.7842"
          width="18.5293"
          height="23.1328"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="2"
            result="effect1_foregroundBlur_2725_2715"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2725_2715"
          x1="136.839"
          y1="115.877"
          x2="189.839"
          y2="207.675"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2725_2715"
          x1="119.087"
          y1="115.684"
          x2="66.0872"
          y2="207.483"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2725_2715"
          x1="109"
          y1="29"
          x2="119.112"
          y2="89.974"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#E8EAEA" />
          <stop offset="1" stop-color="#DBDEDE" />
        </linearGradient>
        <clipPath id="clip0_2725_2715">
          <rect
            width="72"
            height="72"
            fill="white"
            transform="translate(110.662 142.537) rotate(-30)"
          />
        </clipPath>
        <clipPath id="clip1_2725_2715">
          <rect
            width="72"
            height="72"
            fill="white"
            transform="translate(81.9648 106.424) rotate(30)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
