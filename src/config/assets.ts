export const ASSETS = {
  logoWordmark: '/static/common-logo-wordmark.png',
  logoSymbol: '/static/common-logo-symbol.png',
  defaultAvatar: '/static/default-avatar.png',
  sparkLarge: '/static/common-spark-large.png',
  vipHero: '/static/profile-vip-hero.png',

  tabTemplateInactive: '/static/common-tab-template-inactive.png',
  tabTemplateActive: '/static/common-tab-template-active.png',
  tabProfileInactive: '/static/common-tab-profile-inactive.png',
  tabProfileActive: '/static/common-tab-profile-active.png',

  iconWallet: '/static/common-icon-wallet.png',
  iconGift: '/static/common-icon-gift.png',
  iconLogout: '/static/common-icon-logout.png',
  iconDownload: '/static/common-icon-download.png',
  iconClose: '/static/common-icon-close.png',
  iconSpark: '/static/common-icon-spark.png',
  iconRadioEmpty: '/static/common-icon-radio-empty.png',
  iconCheckLarge: '/static/common-icon-check-large.png',
  iconCheckSmall: '/static/common-icon-check-small.png',
  iconChevronRight: '/static/common-icon-chevron-right.png',

  createUploadImage: '/static/create-icon-upload-image.png',
  createSend: '/static/create-icon-send.png',
} as const

export type AssetName = keyof typeof ASSETS
