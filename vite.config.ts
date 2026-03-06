import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite';
// @ts-ignore
import postcssRemToResponsivePixel from 'postcss-rem-to-responsive-pixel';

export default defineConfig(() => {
  const isH5 = process.env.UNI_PLATFORM === 'h5';
  const isApp = process.env.UNI_PLATFORM === 'app-plus';
  const weappTailwindcssDisabled = isH5 || isApp;

  const postcssPlugins = [
    tailwindcss(),
    autoprefixer(),
  ];

  if (!weappTailwindcssDisabled) {
    postcssPlugins.push(
      postcssRemToResponsivePixel({
        rootValue: 32,
        propList: ['*'],
        transformUnit: 'rpx',
      })
    );
  }

  return {
    plugins: [
      uni(),
      uvtw({
        rem2rpx: true,
        disabled: weappTailwindcssDisabled
      })
    ],
    css: {
        postcss: {
          plugins: postcssPlugins,
        },
    },
  };
});
