import "./assets/option.css";
// import "../node_modules/flowbite-vue/dist/index.css";
import { createApp } from "vue";
// import { createPinia } from "pinia";

import App from "../src/views/OptionView.vue";
// import router from "../src/router";

const app = createApp(App);

// app.use(createPinia());

app.mount("#app");
