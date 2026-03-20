/* ============================================
   ARTIST PUSH — Modern SVG Icon System
   3D-inspired gradient icons
   ============================================ */

const ICONS = {
  // ── Stars ──
  starFull: `<svg viewBox="0 0 20 20" fill="none"><defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs><path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" fill="url(#sg)"/></svg>`,

  starEmpty: `<svg viewBox="0 0 20 20" fill="none"><path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" stroke="#555" stroke-width="1.2" fill="none"/></svg>`,

  // ── UI Icons ──
  check: `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="rgba(0,255,133,0.1)" stroke="rgba(0,255,133,0.3)" stroke-width="1"/><path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="#00FF85" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  checkSc: `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="rgba(255,85,0,0.1)" stroke="rgba(255,85,0,0.3)" stroke-width="1"/><path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="#FF5500" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  close: `<svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

  menu: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

  cart: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6h18" stroke="currentColor" stroke-width="1.5"/><path d="M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  arrowLeft: `<svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  arrowRight: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0l-7-7m7 7l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  chevronRight: `<svg viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  minus: `<svg viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="6" stroke="currentColor" stroke-width="1.2" opacity="0.3"/><path d="M6 10h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,

  plus: `<svg viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="6" stroke="currentColor" stroke-width="1.2" opacity="0.3"/><path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,

  lock: `<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="9" width="14" height="9" rx="2" fill="rgba(0,255,133,0.1)" stroke="#00FF85" stroke-width="1.2"/><path d="M6 9V6a4 4 0 018 0v3" stroke="#00FF85" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="13.5" r="1.5" fill="#00FF85"/></svg>`,

  remove: `<svg viewBox="0 0 20 20" fill="none"><path d="M4 5h12M7 5V4a1 1 0 011-1h4a1 1 0 011 1v1M8 9v5M12 9v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M5 5l1 11a2 2 0 002 2h4a2 2 0 002-2l1-11" stroke="currentColor" stroke-width="1.2"/></svg>`,

  // ── Service Icons (Spotify — green gradients) ──
  spPlay: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spPlay" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient><filter id="spGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feComposite in="SourceGraphic" in2="blur"/></filter></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><circle cx="24" cy="24" r="15" fill="rgba(0,255,133,0.06)"/><path d="M20 16l14 8-14 8V16z" fill="url(#spPlay)" filter="url(#spGlow)"/></svg>`,

  spListeners: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spList" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><path d="M24 8c-3 0-6 2.5-6 7 0 4 2.5 7 6 7s6-3 6-7c0-4.5-3-7-6-7z" fill="url(#spList)"/><path d="M12 38c0-6 5-10 12-10s12 4 12 10" stroke="url(#spList)" stroke-width="2.5" stroke-linecap="round" fill="rgba(0,255,133,0.06)"/></svg>`,

  spFollowers: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spFol" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><circle cx="19" cy="17" r="5" fill="url(#spFol)"/><path d="M9 36c0-5 4-9 10-9s10 4 10 9" fill="rgba(0,255,133,0.15)" stroke="url(#spFol)" stroke-width="1.5"/><circle cx="32" cy="17" r="4" fill="rgba(0,255,133,0.5)"/><path d="M27 36c0-3 2-6 5-7.5" stroke="rgba(0,255,133,0.5)" stroke-width="1.5" stroke-linecap="round"/><path d="M36 22v6M33 25h6" stroke="url(#spFol)" stroke-width="1.8" stroke-linecap="round"/></svg>`,

  spSaves: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spSav" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><path d="M14 8h20a2 2 0 012 2v28l-12-8-12 8V10a2 2 0 012-2z" fill="rgba(0,255,133,0.12)" stroke="url(#spSav)" stroke-width="1.8"/><path d="M20 20h8M24 16v8" stroke="url(#spSav)" stroke-width="1.8" stroke-linecap="round"/></svg>`,

  spPlaylist: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spPl" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><path d="M12 14h16M12 20h16M12 26h10" stroke="url(#spPl)" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="30" r="5" fill="rgba(0,255,133,0.15)" stroke="url(#spPl)" stroke-width="1.5"/><path d="M37 22v8" stroke="url(#spPl)" stroke-width="1.5"/><path d="M32 25v5" stroke="url(#spPl)" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  spFeatured: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spFt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#00FF85"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><path d="M24 10l3.5 7 7.5 1.1-5.5 5.3 1.3 7.6L24 27.5l-6.8 3.5 1.3-7.6-5.5-5.3 7.5-1.1L24 10z" fill="url(#spFt)" opacity="0.9"/></svg>`,

  spMonthly: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spMo" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><rect x="10" y="12" width="28" height="24" rx="3" fill="rgba(0,255,133,0.06)" stroke="url(#spMo)" stroke-width="1.5"/><path d="M10 18h28" stroke="url(#spMo)" stroke-width="1.2"/><path d="M17 12V9M31 12V9" stroke="url(#spMo)" stroke-width="1.5" stroke-linecap="round"/><path d="M16 24h4l3-3 3 6 3-3h3" stroke="url(#spMo)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  spPackage: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="spPk" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><path d="M12 18l12-6 12 6-12 6-12-6z" fill="rgba(0,255,133,0.15)" stroke="url(#spPk)" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 18v12l12 6V24" stroke="url(#spPk)" stroke-width="1.5" stroke-linejoin="round"/><path d="M36 18v12l-12 6V24" stroke="url(#spPk)" stroke-width="1.5" stroke-linejoin="round"/></svg>`,

  // ── Service Icons (SoundCloud — orange gradients) ──
  scPlay: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="scPlay" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><circle cx="24" cy="24" r="15" fill="rgba(255,85,0,0.06)"/><path d="M20 16l14 8-14 8V16z" fill="url(#scPlay)"/></svg>`,

  scFollowers: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="scFol" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><circle cx="19" cy="17" r="5" fill="url(#scFol)"/><path d="M9 36c0-5 4-9 10-9s10 4 10 9" fill="rgba(255,85,0,0.15)" stroke="url(#scFol)" stroke-width="1.5"/><circle cx="32" cy="17" r="4" fill="rgba(255,85,0,0.5)"/><path d="M36 22v6M33 25h6" stroke="url(#scFol)" stroke-width="1.8" stroke-linecap="round"/></svg>`,

  scLikes: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="scLik" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><path d="M24 38s-12-7.5-12-16c0-4.5 3.5-8 7.5-8 2.5 0 4.5 1.5 4.5 1.5S26 12.5 28.5 12.5c4 0 7.5 3.5 7.5 8C36 30.5 24 38 24 38z" fill="url(#scLik)" opacity="0.9"/></svg>`,

  scReposts: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="scRep" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><path d="M10 20h20l-5-5" stroke="url(#scRep)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 28H18l5 5" stroke="url(#scRep)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  scComments: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="scCom" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><path d="M12 14h24a2 2 0 012 2v12a2 2 0 01-2 2H20l-6 5v-5h-2a2 2 0 01-2-2V16a2 2 0 012-2z" fill="rgba(255,85,0,0.12)" stroke="url(#scCom)" stroke-width="1.5"/><path d="M18 21h12M18 25h8" stroke="url(#scCom)" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  scOrganic: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="scOrg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><path d="M24 38V22" stroke="url(#scOrg)" stroke-width="2" stroke-linecap="round"/><path d="M24 22c-2-4-8-6-10-3s2 8 10 3z" fill="rgba(255,85,0,0.2)" stroke="url(#scOrg)" stroke-width="1.2"/><path d="M24 28c2-4 8-6 10-3s-2 8-10 3z" fill="rgba(255,85,0,0.2)" stroke="url(#scOrg)" stroke-width="1.2"/><path d="M24 16c-1.5-3-5-5-7-3s1 6 7 3z" fill="rgba(255,85,0,0.15)" stroke="url(#scOrg)" stroke-width="1"/></svg>`,

  scPackage: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="scPk" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><path d="M12 18l12-6 12 6-12 6-12-6z" fill="rgba(255,85,0,0.15)" stroke="url(#scPk)" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 18v12l12 6V24" stroke="url(#scPk)" stroke-width="1.5" stroke-linejoin="round"/><path d="M36 18v12l-12 6V24" stroke="url(#scPk)" stroke-width="1.5" stroke-linejoin="round"/></svg>`,

  // ── General / Decorative ──
  lightning: `<svg viewBox="0 0 20 20" fill="none"><path d="M11 1L4 11h5l-1 8 7-10h-5l1-8z" fill="url(#ltGrad)"/><defs><linearGradient id="ltGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs></svg>`,

  rocket: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="rktG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><path d="M24 6c-4 4-8 12-8 20l4 4 8-8 8 8 4-4c0-8-4-16-8-20h-8z" fill="rgba(0,255,133,0.1)" stroke="url(#rktG)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="24" cy="20" r="3" fill="url(#rktG)"/><path d="M16 26l-4 8 6-2M32 26l4 8-6-2" stroke="url(#rktG)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 38c0-2 2-4 4-4s4 2 4 4" stroke="url(#rktG)" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  heart: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="hrtG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF6B9D"/><stop offset="100%" stop-color="#C44569"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,107,157,0.06)" stroke="rgba(255,107,157,0.15)" stroke-width="1"/><path d="M24 36s-12-7.5-12-16c0-4.5 3.5-8 7.5-8 2.5 0 4.5 1.5 4.5 1.5S26 10.5 28.5 10.5c4 0 7.5 3.5 7.5 8C36 28.5 24 36 24 36z" fill="url(#hrtG)" opacity="0.85"/></svg>`,

  chartUp: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="chG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><path d="M12 32l7-8 5 4 12-14" stroke="url(#chG)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 14h6v6" stroke="url(#chG)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  spotify: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.08)" stroke="rgba(0,255,133,0.15)" stroke-width="1"/><path d="M14 20c6-2 14-2 20 2" stroke="#00FF85" stroke-width="2.5" stroke-linecap="round"/><path d="M16 26c5-1.5 11-1.5 16 1.5" stroke="#00FF85" stroke-width="2" stroke-linecap="round"/><path d="M18 32c4-1 9-1 12 1" stroke="#00FF85" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  cloud: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="clG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8800"/><stop offset="100%" stop-color="#FF5500"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(255,85,0,0.08)" stroke="rgba(255,85,0,0.15)" stroke-width="1"/><path d="M14 30a6 6 0 01-.5-12A8 8 0 0128 16a7 7 0 016.5 10H36a4 4 0 010 8H14z" fill="url(#clG)" opacity="0.7"/></svg>`,

  // ── "For Whom" tags ──
  mic: `<svg viewBox="0 0 20 20" fill="none"><rect x="7" y="2" width="6" height="10" rx="3" fill="rgba(0,255,133,0.3)" stroke="#00FF85" stroke-width="1"/><path d="M5 10a5 5 0 0010 0" stroke="#00FF85" stroke-width="1" fill="none"/><path d="M10 15v3M7 18h6" stroke="#00FF85" stroke-width="1" stroke-linecap="round"/></svg>`,

  headphones: `<svg viewBox="0 0 20 20" fill="none"><path d="M4 12v-2a6 6 0 0112 0v2" stroke="#00FF85" stroke-width="1.2" fill="none"/><rect x="2" y="12" width="4" height="5" rx="1" fill="rgba(0,255,133,0.3)" stroke="#00FF85" stroke-width="0.8"/><rect x="14" y="12" width="4" height="5" rx="1" fill="rgba(0,255,133,0.3)" stroke="#00FF85" stroke-width="0.8"/></svg>`,

  vinyl: `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" fill="rgba(0,255,133,0.08)" stroke="#00FF85" stroke-width="1"/><circle cx="10" cy="10" r="3" fill="rgba(0,255,133,0.3)" stroke="#00FF85" stroke-width="0.8"/><circle cx="10" cy="10" r="1" fill="#00FF85"/></svg>`,

  turntable: `<svg viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" fill="rgba(0,255,133,0.08)" stroke="#00FF85" stroke-width="0.8"/><circle cx="9" cy="10" r="5" stroke="#00FF85" stroke-width="0.8" fill="none"/><circle cx="9" cy="10" r="1.5" fill="#00FF85"/><path d="M14 7l2-2" stroke="#00FF85" stroke-width="1" stroke-linecap="round"/></svg>`,

  piano: `<svg viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" fill="rgba(0,255,133,0.08)" stroke="#00FF85" stroke-width="0.8"/><path d="M6 4v7M10 4v7M14 4v7" stroke="rgba(0,255,133,0.4)" stroke-width="2"/></svg>`,

  podcast: `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="2" fill="#00FF85"/><path d="M6 10a4.5 4.5 0 018 0" stroke="#00FF85" stroke-width="0.8" fill="none"/><path d="M3 12a7.5 7.5 0 0114 0" stroke="rgba(0,255,133,0.4)" stroke-width="0.8" fill="none"/><path d="M10 10v5" stroke="#00FF85" stroke-width="1.2" stroke-linecap="round"/><path d="M7 17h6" stroke="#00FF85" stroke-width="1" stroke-linecap="round"/></svg>`,

  email: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" fill="rgba(0,255,133,0.06)" stroke="#00FF85" stroke-width="1.2"/><path d="M3 7l9 6 9-6" stroke="#00FF85" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  creditCard: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" fill="rgba(0,255,133,0.06)" stroke="#00FF85" stroke-width="1.2"/><path d="M2 10h20" stroke="#00FF85" stroke-width="1.2"/><path d="M6 15h4M14 15h4" stroke="rgba(0,255,133,0.4)" stroke-width="1.2" stroke-linecap="round"/></svg>`,

  // ── Featured playlist icons ──
  plHipHop: `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.15)" stroke-width="0.8"/><rect x="10" y="8" width="4" height="16" rx="2" fill="rgba(0,255,133,0.4)"/><rect x="18" y="12" width="4" height="12" rx="2" fill="rgba(0,255,133,0.25)"/><circle cx="12" cy="24" r="3" fill="rgba(0,255,133,0.3)" stroke="#00FF85" stroke-width="0.8"/><circle cx="20" cy="24" r="3" fill="rgba(0,255,133,0.3)" stroke="#00FF85" stroke-width="0.8"/></svg>`,

  plElectronic: `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.15)" stroke-width="0.8"/><path d="M6 16h3l2-6 3 12 3-8 2 4 3-6 2 4h2" stroke="#00FF85" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  plIndie: `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.15)" stroke-width="0.8"/><path d="M16 8l2.5 5 5.5.8-4 3.9.9 5.3L16 20.5l-4.9 2.5.9-5.3-4-3.9 5.5-.8L16 8z" fill="rgba(255,215,0,0.5)" stroke="rgba(255,215,0,0.8)" stroke-width="0.8"/></svg>`,

  plChill: `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.15)" stroke-width="0.8"/><path d="M12 22c0-3 2-4.5 4-4.5s4 1.5 4 4.5" stroke="#00FF85" stroke-width="1.2" stroke-linecap="round"/><circle cx="13" cy="14" r="1.5" fill="#00FF85"/><circle cx="19" cy="14" r="1.5" fill="#00FF85"/><path d="M8 10c2-2 5-3 8-3s6 1 8 3" stroke="rgba(0,255,133,0.3)" stroke-width="1" stroke-linecap="round"/></svg>`,

  plLatin: `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.15)" stroke-width="0.8"/><path d="M14 10c-2 4-2 8 0 14" stroke="#FF6B6B" stroke-width="1.5" stroke-linecap="round"/><path d="M18 10c2 4 2 8 0 14" stroke="#FFA500" stroke-width="1.5" stroke-linecap="round"/><path d="M10 16h12" stroke="#FFD700" stroke-width="1.2" stroke-linecap="round"/></svg>`,

  plRnB: `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.15)" stroke-width="0.8"/><circle cx="16" cy="18" r="6" fill="none" stroke="#00FF85" stroke-width="1"/><circle cx="16" cy="18" r="2" fill="#00FF85"/><path d="M22 18v-8l-6 3v5" stroke="#00FF85" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // ── How It Works step icons ──
  stepChoose: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="stCh" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.12)" stroke-width="1"/><path d="M16 14h16a2 2 0 012 2v16a2 2 0 01-2 2H16a2 2 0 01-2-2V16a2 2 0 012-2z" fill="rgba(0,255,133,0.08)" stroke="url(#stCh)" stroke-width="1.5"/><path d="M18 20h12M18 25h8M18 30h10" stroke="url(#stCh)" stroke-width="1.5" stroke-linecap="round"/><circle cx="34" cy="14" r="6" fill="#111" stroke="url(#stCh)" stroke-width="1.5"/><path d="M32 14l1.5 1.5 3-3" stroke="url(#stCh)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  stepPay: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="stPay" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.12)" stroke-width="1"/><rect x="8" y="14" width="32" height="20" rx="3" fill="rgba(0,255,133,0.08)" stroke="url(#stPay)" stroke-width="1.5"/><path d="M8 20h32" stroke="url(#stPay)" stroke-width="1.5"/><rect x="12" y="26" width="8" height="4" rx="1" fill="rgba(0,255,133,0.2)"/><path d="M30 28h6" stroke="url(#stPay)" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  stepGrow: `<svg viewBox="0 0 48 48" fill="none"><defs><linearGradient id="stGr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="rgba(0,255,133,0.06)" stroke="rgba(0,255,133,0.12)" stroke-width="1"/><path d="M12 34V22" stroke="url(#stGr)" stroke-width="3" stroke-linecap="round"/><path d="M20 34V18" stroke="url(#stGr)" stroke-width="3" stroke-linecap="round"/><path d="M28 34V14" stroke="url(#stGr)" stroke-width="3" stroke-linecap="round"/><path d="M36 34V10" stroke="url(#stGr)" stroke-width="3" stroke-linecap="round"/></svg>`,

  successCheck: `<svg viewBox="0 0 80 80" fill="none"><defs><linearGradient id="scGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FF85"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs><circle cx="40" cy="40" r="38" fill="rgba(0,255,133,0.08)" stroke="url(#scGrad)" stroke-width="2"/><circle cx="40" cy="40" r="28" fill="rgba(0,255,133,0.05)"/><path d="M25 40l10 10 20-20" stroke="url(#scGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  emptyCart: `<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="38" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/><path d="M25 22l3 4h30l-4 18H32l-4-18" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="33" cy="52" r="3" fill="rgba(255,255,255,0.2)"/><circle cx="49" cy="52" r="3" fill="rgba(255,255,255,0.2)"/><path d="M35 36h10M40 31v10" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

// ── Helper functions ──
function icon(name, size) {
  const s = size ? `style="width:${size};height:${size}"` : '';
  return `<span class="icon" ${s}>${ICONS[name] || ''}</span>`;
}

function stars(count) {
  let html = '<span class="stars">';
  for (let i = 0; i < 5; i++) {
    html += i < count ? ICONS.starFull : ICONS.starEmpty;
  }
  html += '</span>';
  return html;
}

function check(variant) {
  return `<span class="check-icon">${variant === 'sc' ? ICONS.checkSc : ICONS.check}</span>`;
}

// Make available globally
window.ICONS = ICONS;
window.iconHelper = { icon, stars, check };
