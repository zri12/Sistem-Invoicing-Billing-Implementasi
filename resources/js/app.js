import './bootstrap';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(createPinia());
app.use(router);

// Session restoration (if any) happens inside the router's beforeEach guard,
// which blocks the first navigation on fetchCurrentUser() — see router/index.js.
app.mount('#app');
