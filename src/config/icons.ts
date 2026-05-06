export type AuraIconName =
  | "discover"
  | "create"
  | "works"
  | "profile"
  | "back"
  | "more"
  | "close"
  | "heart"
  | "heartFilled"
  | "download"
  | "share"
  | "wand"
  | "mic"
  | "copy"
  | "save"
  | "regenerate"
  | "poster"
  | "wallet"
  | "logs"
  | "invite"
  | "support"
  | "info"
  | "delete"
  | "check"
  | "image"
  | "planet"
  | "crown";

const ICON_FILE = "/static/aura-icons.svg";

const iconIds: Record<AuraIconName, string> = {
  discover: "discover",
  create: "create",
  works: "works",
  profile: "profile",
  back: "back",
  more: "more",
  close: "close",
  heart: "heart",
  heartFilled: "heart-filled",
  download: "download",
  share: "share",
  wand: "wand",
  mic: "mic",
  copy: "copy",
  save: "save",
  regenerate: "regenerate",
  poster: "poster",
  wallet: "wallet",
  logs: "logs",
  invite: "invite",
  support: "support",
  info: "info",
  delete: "delete",
  check: "check",
  image: "image",
  planet: "planet",
  crown: "crown",
};

type SvgIcon = {
  viewBox?: string;
  body: string;
};

const gradient = `
  <defs>
    <linearGradient id="g" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
      <stop stop-color="#16C7FF"/>
      <stop offset="1" stop-color="#9C4DFF"/>
    </linearGradient>
  </defs>
`;

const iconSvg: Record<AuraIconName, SvgIcon> = {
  discover: {
    body: '<circle cx="12" cy="12" r="7.2" fill="none" stroke="url(#g)" stroke-width="1.9"/><path d="M5.2 14.4c3.4 1.2 7.6.2 13.1-4.3" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="8" r="1.1" fill="#EAF2FF"/>',
  },
  create: {
    body: '<path d="M12 4v16M4 12h16" fill="none" stroke="url(#g)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="8.2" fill="none" stroke="#EAF2FF" stroke-width="1.8"/>',
  },
  works: {
    body: '<rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M7 15l3.2-3.4 2.5 2.3 1.7-1.8L18 15" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.4" cy="8.7" r="1.1" fill="#EAF2FF"/>',
  },
  profile: {
    body: '<circle cx="12" cy="8.5" r="3.2" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M5.6 19c1-3.5 3-5.2 6.4-5.2s5.4 1.7 6.4 5.2" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round"/>',
  },
  back: {
    body: '<path d="M15.5 5.2L8.7 12l6.8 6.8" fill="none" stroke="#EAF2FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  more: {
    body: '<circle cx="7" cy="12" r="1.6" fill="#EAF2FF"/><circle cx="12" cy="12" r="1.6" fill="#EAF2FF"/><circle cx="17" cy="12" r="1.6" fill="#EAF2FF"/>',
  },
  close: {
    body: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="#EAF2FF" stroke-width="2" stroke-linecap="round"/>',
  },
  heart: {
    body: '<path d="M12 19.2s-7.2-4-8.5-8.7C2.7 7.3 4.7 5 7.4 5c1.7 0 3.1 1 4.6 2.7C13.5 6 14.9 5 16.6 5c2.7 0 4.7 2.3 3.9 5.5C19.2 15.2 12 19.2 12 19.2z" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linejoin="round"/>',
  },
  heartFilled: {
    body: '<path d="M12 20s-7.7-4.3-9-9.2C2 7.2 4.4 4.6 7.4 4.6c1.8 0 3.3 1 4.6 2.6 1.3-1.6 2.8-2.6 4.6-2.6 3 0 5.4 2.6 4.4 6.2C19.7 15.7 12 20 12 20z" fill="url(#g)"/>',
  },
  download: {
    body: '<path d="M12 4v10M8.2 10.3L12 14l3.8-3.7M5 18.5h14" fill="none" stroke="#EAF2FF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  share: {
    body: '<path d="M8.5 12.6l6.9 4.1M15.4 7.3L8.5 11.4" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linecap="round"/><circle cx="6.2" cy="12" r="2.4" fill="none" stroke="url(#g)" stroke-width="1.9"/><circle cx="17.8" cy="6" r="2.4" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><circle cx="17.8" cy="18" r="2.4" fill="none" stroke="#EAF2FF" stroke-width="1.8"/>',
  },
  wand: {
    body: '<path d="M4.8 19.2L15.6 8.4M13.7 6.5l3.8 3.8" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round"/><path d="M6.5 5.2l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7.7-1.7M18 14l.5 1.1 1.1.5-1.1.5L18 17.2l-.5-1.1-1.1-.5 1.1-.5L18 14z" fill="none" stroke="#EAF2FF" stroke-width="1.6" stroke-linejoin="round"/>',
  },
  mic: {
    body: '<rect x="8.2" y="4" width="7.6" height="11" rx="3.8" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M5.5 11.8c0 3.6 2.5 6.1 6.5 6.1s6.5-2.5 6.5-6.1M12 18v2.2" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round"/>',
  },
  copy: {
    body: '<rect x="8" y="7" width="10" height="12" rx="2" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M6 15h-.4A2.6 2.6 0 013 12.4V6.6A2.6 2.6 0 015.6 4h6.8A2.6 2.6 0 0115 6.6V7" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round"/>',
  },
  save: {
    body: '<path d="M5 5h11l3 3v11H5z" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 5v5h7V5M8 19v-5h8v5" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linejoin="round"/>',
  },
  regenerate: {
    body: '<path d="M18.3 8.2A7.2 7.2 0 006.1 7l-1.2 1.4M5.7 15.8A7.2 7.2 0 0017.9 17l1.2-1.4" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round"/><path d="M5 4.8v3.6h3.6M19 19.2v-3.6h-3.6" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  poster: {
    body: '<rect x="5" y="3.8" width="14" height="16.4" rx="2.4" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M8 14.5l2.5-2.7 2 1.9 1.5-1.5 2 2.3M8 7.3h8" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  wallet: {
    body: '<path d="M4 8.2h13.5A2.5 2.5 0 0120 10.7v6.1a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.8V7.6A2.6 2.6 0 016.6 5h9.2" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16.2" cy="13.5" r="1.2" fill="none" stroke="url(#g)" stroke-width="1.9"/>',
  },
  logs: {
    body: '<path d="M6 5.2h12M6 11.8h12M6 18.4h12" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linecap="round"/><path d="M6 5.2v13.2" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round"/>',
  },
  invite: {
    body: '<rect x="4" y="9" width="16" height="10" rx="2" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M12 9v10M4.8 12h14.4" fill="none" stroke="url(#g)" stroke-width="1.9"/><path d="M8.3 9C6.7 7.2 7.1 5.2 8.8 5.1c1.5-.1 2.6 1.5 3.2 3.9.6-2.4 1.7-4 3.2-3.9 1.7.1 2.1 2.1.5 3.9" fill="none" stroke="#EAF2FF" stroke-width="1.6" stroke-linecap="round"/>',
  },
  support: {
    body: '<path d="M5 12a7 7 0 0114 0v3.6a2.2 2.2 0 01-2.2 2.2h-1.4v-5.2H19M5 12.6h3.6v5.2H7.2A2.2 2.2 0 015 15.6z" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 20h2" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round"/>',
  },
  info: {
    body: '<circle cx="12" cy="12" r="8" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M12 10.5v5M12 7.4h.1" fill="none" stroke="url(#g)" stroke-width="2" stroke-linecap="round"/>',
  },
  delete: {
    body: '<path d="M5 7h14M9 7V5h6v2M8 10v8M12 10v8M16 10v8" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linecap="round"/><path d="M7 7l.8 13h8.4L17 7" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linejoin="round"/>',
  },
  check: {
    body: '<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="url(#g)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  image: {
    body: '<rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M7 15.5l3.4-3.7 2.5 2.2 1.8-1.9 2.3 3.4" fill="none" stroke="url(#g)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.5" cy="8.8" r="1.1" fill="#EAF2FF"/>',
  },
  planet: {
    body: '<ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-20 12 12)" fill="none" stroke="url(#g)" stroke-width="1.9"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#EAF2FF" stroke-width="1.8"/><path d="M9.3 7.4c1.5 1.3 3.4 1.8 6.1 1.6" fill="none" stroke="#EAF2FF" stroke-width="1.5" stroke-linecap="round"/>',
  },
  crown: {
    body: '<path d="M5.2 17.6h13.6l1-9.4-4.5 3.4L12 5.3l-3.3 6.3-4.5-3.4 1 9.4z" fill="url(#g)"/><path d="M6.2 20h11.6" fill="none" stroke="#EAF2FF" stroke-width="1.8" stroke-linecap="round"/>',
  },
};

const toSvgDataUri = ({ viewBox = "0 0 24 24", body }: SvgIcon) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${gradient}${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const SPRITE_ICON_ASSETS: Record<AuraIconName, string> = Object.fromEntries(Object.entries(iconIds).map(([name, id]) => [name, `${ICON_FILE}#${id}`])) as Record<AuraIconName, string>;

export const ICON_ASSETS: Record<AuraIconName, string> = Object.fromEntries(Object.entries(iconSvg).map(([name, svg]) => [name, toSvgDataUri(svg)])) as Record<AuraIconName, string>;

export const getIconSrc = (name: AuraIconName) => ICON_ASSETS[name];
