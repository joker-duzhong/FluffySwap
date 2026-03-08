import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { initQiniuUpload } from "@/utils/qiniu-upload/init";

initQiniuUpload();

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);
  return {
    app,
    pinia,
  };
}
