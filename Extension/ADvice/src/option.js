import "./assets/option.css";
// import "../node_modules/flowbite-vue/dist/index.css";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// import { createPinia } from "pinia";

import App from "../src/views/OptionView.vue";
// import router from "../src/router";

const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: "mdi", // This is already the default value - only for display purposes
    },
  });
  

const app = createApp(App);

// app.use(createPinia());

app.use(vuetify).mount("#app");
