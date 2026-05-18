export const ASSETS = {
  logoWordmark: "/static/common-logo-wordmark.png",
  logoSymbol: "/static/common-logo-symbol.png",
  defaultAvatar: "/static/logoSymbol.png",
  invitePosterBg: "/static/invite-poster-bg.png",
  sparkLarge: "/static/common-spark-large.png",
  vipHero: "/static/profile-vip-hero.png",
  vipCardBg: "/static/profile-vip-card-bg.png",

  tabTemplateInactive: "/static/common-tab-template-inactive.png",
  tabTemplateActive: "/static/common-tab-template-active.png",
  tabProfileInactive: "/static/common-tab-profile-inactive.png",
  tabProfileActive: "/static/common-tab-profile-active.png",

  iconWallet: "/static/common-icon-wallet.png",
  iconGift: "/static/common-icon-gift.png",
  iconLogout: "/static/common-icon-logout.png",
  iconDownload: "/static/common-icon-download.png",
  iconClose: "/static/common-icon-close.png",
  iconSpark: "/static/common-icon-spark.png",
  iconRadioEmpty: "/static/common-icon-radio-empty.png",
  iconCheckSmall: "/static/common-icon-check-small.png",
  iconChevronLeft: "/static/common-icon-chevron-left.png",
  iconChevronRight: "/static/common-icon-chevron-right.png",
  iconBook: "/static/common-icon-book.png",
  iconEdit: "/static/common-icon-edit.png",
  iconEdit1: "/static/common-icon-edit-1.png",
  iconWechat: "/static/common-icon-wechat.png",
  iconMoments: "/static/common-icon-moments.png",

  iconStar: "/static/star.png",
  iconShare: "/static/share.png",
  iconScanning: "/static/scanning.png",
  iconDelete: "/static/delete.png",
  iconSelectAll: "/static/select-all.png",
  iconSame: "/static/same.png",
  iconSwitch: "/static/switch.png",

  createUploadImage: "/static/create-icon-upload-image.png",
  createSend: "/static/create-icon-send.png",
} as const;

export type AssetName = keyof typeof ASSETS;
