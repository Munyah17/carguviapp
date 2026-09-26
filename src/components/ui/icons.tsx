import type { ComponentProps } from "react";

type P = ComponentProps<"svg">;

function Svg({ children, ...props }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);
export const IconHome = (p: P) => (
  <Svg {...p}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </Svg>
);
export const IconCar = (p: P) => (
  <Svg {...p}>
    <path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16" />
    <rect x="3" y="16" width="18" height="4" rx="1" />
    <circle cx="7.5" cy="20" r="0.5" />
    <circle cx="16.5" cy="20" r="0.5" />
  </Svg>
);
export const IconPackage = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </Svg>
);
export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </Svg>
);
export const IconCart = (p: P) => (
  <Svg {...p}>
    <path d="M4 5h2l2.4 11h9.2l2-8H7" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </Svg>
);
export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);
export const IconStar = (p: P) => (
  <Svg {...p}>
    <path d="m12 3 2.7 5.7 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 19.9l1.3-6.2L3 9.4l6.3-.7L12 3Z" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m4 12.5 5.5 5.5L20 6.5" />
  </Svg>
);
export const IconShield = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Svg>
);
export const IconBell = (p: P) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Svg>
);
export const IconTruck = (p: P) => (
  <Svg {...p}>
    <path d="M2 7h11v9H2zM13 10h5l3 3v3h-8" />
    <circle cx="6.5" cy="18" r="1.5" />
    <circle cx="16.5" cy="18" r="1.5" />
  </Svg>
);
export const IconStore = (p: P) => (
  <Svg {...p}>
    <path d="M4 9l1-5h14l1 5" />
    <path d="M4 9v11h16V9M4 9h16" />
    <path d="M9.5 20v-6h5v6" />
  </Svg>
);
export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </Svg>
);
export const IconChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);
export const IconHeart = (p: P) => (
  <Svg {...p}>
    <path d="M12 20s-8-4.8-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.2-8 10-8 10Z" />
  </Svg>
);
export const IconWrench = (p: P) => (
  <Svg {...p}>
    <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14.5 12 12 9.5l2.7-3.2Z" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconFilter = (p: P) => (
  <Svg {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);
export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
  </Svg>
);
export const IconArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
