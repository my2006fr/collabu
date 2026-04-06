/**
 * Icons.jsx — Centralized SVG icon library for CollabU
 * All icons are inline SVGs, fully theme-aware via currentColor.
 * Usage: import { IconGithub, IconProject } from './Icons'
 *        <IconGithub size={20} color="var(--accent)" />
 */

const icon = (path, viewBox = "0 0 24 24") =>
  function Icon({ size = 20, color = "currentColor", style = {}, className = "" }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "inline-block", flexShrink: 0, ...style }}
        className={className}
        aria-hidden="true"
      >
        {path(color)}
      </svg>
    );
  };

/* ── Brand / Logo ─────────────────────────────────────────────────────────── */
export const IconHexLogo = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path
      d="M14 2L25.26 8.5V21.5L14 28L2.74 21.5V8.5L14 2Z"
      stroke={color} strokeWidth="2" fill="none"
    />
    <path
      d="M14 7L20.93 11V19L14 23L7.07 19V11L14 7Z"
      fill={color} opacity="0.25"
    />
    <circle cx="14" cy="15" r="3" fill={color} />
  </svg>
);

export const IconGithub = icon(c => (
  <>
  <path
    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
    fill={c}
  />
  </>
));

/* ── Navigation ──────────────────────────────────────────────────────────── */
export const IconFeed = icon(c => (
  <>
    <path d="M3 5h18M3 10h18M3 15h12M3 20h8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconProjects = icon(c => (
  <>
    <rect x="2" y="3" width="20" height="14" rx="2" stroke={c} strokeWidth="2"/>
    <path d="M8 21h8M12 17v4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconProfile = icon(c => (
  <>
    <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconGuide = icon(c => (
  <>
    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconSun = icon(c => (
  <>
    <circle cx="12" cy="12" r="4" stroke={c} strokeWidth="2"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconMoon = icon(c => (
  <>
  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconMenu = icon(c => (
    <>
      <path d="M3 12h18M3 6h18M3 18h18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </>
));

export const IconClose = icon(c => (
  <>
    <path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconChevronRight = icon(c => (
  <>
  <path d="M9 18l6-6-6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconArrowLeft = icon(c => (
  <>
    <path d="M19 12H5M12 19l-7-7 7-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/* ── Actions ─────────────────────────────────────────────────────────────── */
export const IconPlus = icon(c => (
  <>
  <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconEdit = icon(c => (
  <>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconTrash = icon(c => (
  <>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconCheck = icon(c => (
  <>
  <path d="M20 6L9 17l-5-5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconX = icon(c => (
  <>
    <path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconSearch = icon(c => (
  <>
    <circle cx="11" cy="11" r="8" stroke={c} strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconUpload = icon(c => (
  <>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <polyline points="17 8 12 3 7 8" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="3" x2="12" y2="15" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconSend = icon(c => (
  <>
  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconCopy = icon(c => (
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" stroke={c} strokeWidth="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={c} strokeWidth="2"/>
  </>
));

export const IconLogout = icon(c => (
  <>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <polyline points="16 17 21 12 16 7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

/* ── Status / Info ───────────────────────────────────────────────────────── */
export const IconInfo = icon(c => (
  <>
    <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/>
    <line x1="12" y1="8" x2="12" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="16" x2="12.01" y2="16" stroke={c} strokeWidth="3" strokeLinecap="round"/>
  </>
));

export const IconWarning = icon(c => (
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={c} strokeWidth="2"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="3" strokeLinecap="round"/>
  </>
));

export const IconSuccess = icon(c => (
  <>
    <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/>
    <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconLock = icon(c => (
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" stroke={c} strokeWidth="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconEmail = icon(c => (
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={c} strokeWidth="2"/>
    <path d="M2 7l10 7 10-7" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconStar = icon(c => (
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
));

/* ── Features / Content ──────────────────────────────────────────────────── */
export const IconTask = icon(c => (
  <>
    <path d="M9 11l3 3L22 4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconChat = icon(c => (
  <>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconUsers = icon(c => (
  <>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconSkill = icon(c => (
  <>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconBolt = icon(c => (
  <>
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconGlobe = icon(c => (
  <>
    <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke={c} strokeWidth="2"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={c} strokeWidth="2"/>
  </>
));

export const IconCode = icon(c => (
  <>
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconCalendar = icon(c => (
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke={c} strokeWidth="2"/>
  </>
));

export const IconGallery = icon(c => (
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" stroke={c} strokeWidth="2"/>
    <polyline points="21 15 16 10 5 21" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconPost = icon(c => (
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

export const IconHandshake = icon(c => (
  <>
    <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconRocket = icon(c => (
  <>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconKey = icon(c => (
  <>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

export const IconSettings = icon(c => (
  <>
    <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="2"/>
  </>
));

export const IconNumber1 = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2"/>
    <path d="M14 11l3-2v14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconNumber2 = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2"/>
    <path d="M12 12a4 4 0 118 0c0 3-8 7-8 11h8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconNumber3 = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2"/>
    <path d="M12 11h6l-4 5a4 4 0 110 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconNumber4 = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2"/>
    <path d="M19 23V10l-8 9h10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconNumber5 = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2"/>
    <path d="M19 11h-6l-1 6a4 4 0 110 0 4 4 0 010-0" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconNumber6 = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2"/>
    <path d="M18 11a4 4 0 00-4 4v2a4 4 0 008 0 4 4 0 00-8 0" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Emoji Replacements ───────────────────────────────────────────────────── */

/** 👍 Like / Thumbs up */
export const IconThumbUp = icon(c => (
  <>
  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zm-7 11H5a2 2 0 01-2-2v-7a2 2 0 012-2h2v11z"
    stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** 🔗 Share / Link */
export const IconLink = icon(c => (
  <>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** 📎 Attach / Paperclip */
export const IconPaperclip = icon(c => (
  <>
  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
    stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** 🖼️ Image / Gallery */
export const IconImage = icon(c => (
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill={c}/>
    <polyline points="21 15 16 10 5 21" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** 🎬 Video */
export const IconVideo = icon(c => (
  <>
    <polygon points="23 7 16 12 23 17 23 7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="1" y="5" width="15" height="14" rx="2" stroke={c} strokeWidth="2"/>
  </>
));

/** 🎵 Audio / Music */
export const IconMusic = icon(c => (
  <>
    <path d="M9 18V5l12-2v13" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3" stroke={c} strokeWidth="2"/>
    <circle cx="18" cy="16" r="3" stroke={c} strokeWidth="2"/>
  </>
));

/** 📄 PDF / Document */
export const IconFile = icon(c => (
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** 📊 Spreadsheet / Chart */
export const IconSpreadsheet = icon(c => (
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/>
    <line x1="3" y1="9" x2="21" y2="9" stroke={c} strokeWidth="2"/>
    <line x1="3" y1="15" x2="21" y2="15" stroke={c} strokeWidth="2"/>
    <line x1="9" y1="9" x2="9" y2="21" stroke={c} strokeWidth="2"/>
    <line x1="15" y1="9" x2="15" y2="21" stroke={c} strokeWidth="2"/>
  </>
));

/** ⭐ Star / Rating */
export const IconStarFilled = icon(c => (
  <>
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    fill={c} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** 🍴 Fork */
export const IconFork = icon(c => (
  <>
    <circle cx="6" cy="6" r="2" stroke={c} strokeWidth="2"/>
    <circle cx="18" cy="6" r="2" stroke={c} strokeWidth="2"/>
    <circle cx="12" cy="18" r="2" stroke={c} strokeWidth="2"/>
    <path d="M6 8v2a4 4 0 004 4h4a4 4 0 004-4V8M12 14v2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

/** 🐛 Bug / Issue */
export const IconBug = icon(c => (
  <>
    <path d="M8 2l1.88 1.88M16 2l-1.88 1.88M9 7.13v-1a3.003 3.003 0 116 0v1" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0112 0v3c0 3.3-2.7 6-6 6z" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 13H2M22 13h-4M6 17l-2 2M18 17l2 2M6 9l-2-2M18 9l2-2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </>
));

/** 🔧 Wrench / Skill */
export const IconWrench = icon(c => (
  <>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** ✅ Connected / Success check */
export const IconCheckCircleFilled = icon(c => (
  <>
    <circle cx="12" cy="12" r="10" fill={c} opacity="0.15" stroke={c} strokeWidth="2"/>
    <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </>
));

/** ⚠️ Warning triangle filled */
export const IconWarningFilled = icon(c => (
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      fill={c} opacity="0.15" stroke={c} strokeWidth="2"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="3" strokeLinecap="round"/>
  </>
));

/** ℹ️ Info circle filled */
export const IconInfoFilled = icon(c => (
  <>
    <circle cx="12" cy="12" r="10" fill={c} opacity="0.12" stroke={c} strokeWidth="2"/>
    <line x1="12" y1="8" x2="12" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="16" x2="12.01" y2="16" stroke={c} strokeWidth="3" strokeLinecap="round"/>
  </>
));

/** 🔔 Bell */
export const IconBell = icon(c => (
  <>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </>
));

/** 🔔 Bell with dot */
export const IconBellDot = icon(c => (
  <>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="18" cy="5" r="3" fill="var(--danger)" stroke="none"/>
  </>
));
