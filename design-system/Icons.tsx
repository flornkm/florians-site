const Icon = (props: {
  children: any
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) => (
  <svg
    width={props.size || 16}
    height={props.size || 16}
    viewBox="0 0 24 24"
    onClick={props.onClick}
    class={props.class}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {props.children}
  </svg>
)

export function Folder(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M3 4V19H21V7H12L10 4H3Z"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function TextFile(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M13 3H5V21H19V9M13 3L19 9M13 3V9H19M9 13H12M9 17H15.5"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function File(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M13 3H5V21H19V9M13 3L19 9M13 3V9H19"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Edit(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M13.5 6L16.5 3L21 7.5L18 10.5M13.5 6L3 16.5V21H7.5L18 10.5M13.5 6L18 10.5"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Alert(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: (e?: MouseEvent) => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M11.9961 10.0156V12.0121M11.999 15H12.009M11.1344 3.49213L2.88563 17.4956C2.49362 18.1611 2.97412 19 3.74728 19H20.2449C21.0181 19 21.4986 18.1611 21.1066 17.4956L12.8577 3.49213C12.4712 2.83596 11.521 2.83596 11.1344 3.49213ZM12.249 15C12.249 15.1381 12.1371 15.25 11.999 15.25C11.861 15.25 11.749 15.1381 11.749 15C11.749 14.8619 11.861 14.75 11.999 14.75C12.1371 14.75 12.249 14.8619 12.249 15Z"
        stroke="black"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
      />
    </Icon>
  )
}

export function Expand(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M14 4H20V10M14 10L19.25 4.75M10 14L4.75 19.25M4 14V20H10"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function SVG(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M10 5V4H9V5H10ZM14 5H15V4H14V5ZM14 9V10H15V9H14ZM10 9H9V10H10V9ZM18 15V14H17V15H18ZM22 15H23V14H22V15ZM22 19V20H23V19H22ZM18 19H17V20H18V19ZM2 15V14H1V15H2ZM6 15H7V14H6V15ZM6 19V20H7V19H6ZM2 19H1V20H2V19ZM9.5 8H10.5V6H9.5V8ZM9.81225 8.34838L10.7622 8.03613L10.1378 6.13613L9.18775 6.44838L9.81225 8.34838ZM14.5 6H13.5V8H14.5V6ZM14.8122 6.44838L13.8622 6.13613L13.2378 8.03613L14.1878 8.34838L14.8122 6.44838ZM3.01727 14.4385L2.95572 15.4366L4.95193 15.5597L5.01348 14.5615L3.01727 14.4385ZM18.9865 14.5615L19.0481 15.5597L21.0443 15.4366L20.9827 14.4385L18.9865 14.5615ZM3 7V9C4.10457 9 5 8.10457 5 7H3ZM3 7H1C1 8.10457 1.89543 9 3 9V7ZM3 7V5C1.89543 5 1 5.89543 1 7H3ZM3 7H5C5 5.89543 4.10457 5 3 5V7ZM21 7V9C22.1046 9 23 8.10457 23 7H21ZM21 7H19C19 8.10457 19.8954 9 21 9V7ZM21 7V5C19.8954 5 19 5.89543 19 7H21ZM21 7H23C23 5.89543 22.1046 5 21 5V7ZM10 6H14V4H10V6ZM13 5V9H15V5H13ZM14 8H10V10H14V8ZM18 16H22V14H18V16ZM21 15V19H23V15H21ZM22 18H18V20H22V18ZM19 19V15H17V19H19ZM5 15V19H7V15H5ZM6 18H2V20H6V18ZM3 19V15H1V19H3ZM3 8H9.5V6H3V8ZM9 5V9H11V5H9ZM14.5 8H21V6H14.5V8ZM5.01348 14.5615C5.19276 11.6543 7.14918 9.22369 9.81225 8.34838L9.18775 6.44838C5.76553 7.57321 3.24815 10.6944 3.01727 14.4385L5.01348 14.5615ZM14.1878 8.34838C16.8508 9.22369 18.8072 11.6543 18.9865 14.5615L20.9827 14.4385C20.7519 10.6944 18.2345 7.5732 14.8122 6.44838L14.1878 8.34838ZM2 16H6V14H2V16Z"
        fill="currentColor"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Chevron(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M9 4L17 12L9 20"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Bulb(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M4 9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9C20 10.8924 19.3427 12.6309 18.2452 14H5.75483C4.65734 12.6309 4 10.8924 4 9Z"
        fill="currentColor"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M8 16V18C8 18.5523 8.44772 19 9 19H15C15.5523 19 16 18.5523 16 18V16H8Z"
        fill="currentColor"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M8 21C8 20.4477 8.44772 20 9 20H15C15.5523 20 16 20.4477 16 21C16 21.5523 15.5523 22 15 22H9C8.44772 22 8 21.5523 8 21Z"
        fill="currentColor"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Check(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M3 15L9.29412 20L21 4"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Close(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M5 5L19 19M19 5L5 19"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function ArrowRight(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M14 6L20 12L14 18M19 12H4"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function ArrowLeft(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M10 6L4 12L10 18M5 12H20"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Send(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12ZM8.29289 10.2929C7.90237 10.6834 7.90237 11.3166 8.29289 11.7071C8.68342 12.0976 9.31658 12.0976 9.70711 11.7071L11 10.4142V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V10.4142L14.2929 11.7071C14.6834 12.0976 15.3166 12.0976 15.7071 11.7071C16.0976 11.3166 16.0976 10.6834 15.7071 10.2929L12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L8.29289 10.2929Z"
        fill="currentColor"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Plus(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M12 4V12M12 12V20M12 12H4M12 12H20"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Collapse(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M15 4C15 3.44772 14.5523 3 14 3C13.4477 3 13 3.44772 13 4V10C13 10.5523 13.4477 11 14 11H20C20.5523 11 21 10.5523 21 10C21 9.44772 20.5523 9 20 9H16.4142L20.7071 4.70711C21.0976 4.31658 21.0976 3.68342 20.7071 3.29289C20.3166 2.90237 19.6834 2.90237 19.2929 3.29289L15 7.58579V4ZM4 13C3.44772 13 3 13.4477 3 14C3 14.5523 3.44772 15 4 15H7.58579L3.29289 19.2929C2.90237 19.6834 2.90237 20.3166 3.29289 20.7071C3.68342 21.0976 4.31658 21.0976 4.70711 20.7071L9 16.4142V20C9 20.5523 9.44772 21 10 21C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13H4Z"
        fill="currentColor"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Star(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M12 2L14.8769 8.00573L21.5 8.87539L16.655 13.4568L17.8713 20L12 16.8257L6.12868 20L7.345 13.4568L2.5 8.87539L9.12305 8.00573L12 2Z"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Share(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M3 8V19H19M8 14V13C8 10.2386 10.2386 8 13 8H20M20 8L16.5 4.5M20 8L16.5 11.5"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Sports(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M12 12C13.35 9.51506 13.35 5.48495 12 3M12 12C9.17306 12.0739 5.68337 14.088 4.20642 16.5M12 12C13.477 14.412 16.9671 16.4261 19.794 16.5M7.50371 13.4343C9.20613 16.2139 12.4045 18.6922 15.8159 20.1426M3.04441 11.153C6.03241 8.96273 9.75937 7.47157 13.0079 7.38725M15.4934 15.1784C17.049 12.3145 17.5994 8.30998 17.157 4.62945M18.364 5.63604C21.8787 9.15077 21.8787 14.8493 18.364 18.364C14.8492 21.8787 9.15074 21.8787 5.63604 18.364C2.12132 14.8492 2.12132 9.15074 5.63604 5.63604C9.15077 2.12132 14.8493 2.12132 18.364 5.63604Z"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}

export function Translate(props: {
  size?: number
  class?: string
  stroke?: 2 | 1.5
  onClick?: () => void
  fill?: string
}) {
  return (
    <Icon size={props.size} class={props.class} onClick={props.onClick}>
      <path
        d="M19.7783 4.22183L4.22197 19.7782M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM18.3644 18.364C17.1928 19.5355 13.3939 17.636 9.87913 14.1213C6.36441 10.6066 4.46492 6.8076 5.63649 5.63603C6.80807 4.46446 10.6071 6.36395 14.1218 9.87867C17.6365 13.3934 19.536 17.1924 18.3644 18.364Z"
        stroke="currentColor"
        stroke-width={props.stroke || 1.5}
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
    </Icon>
  )
}
