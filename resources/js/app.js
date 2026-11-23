import './bootstrap';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// A history entry restored from the back/forward cache retains its old Pinia
// session. Re-enter through session restoration before showing protected data.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.documentElement.style.visibility = 'hidden';
        window.location.reload();
    }
});

const app = createApp(App);
app.use(createPinia());
app.use(router);

// Session restoration (if any) happens inside the router's beforeEach guard,
// which blocks the first navigation on fetchCurrentUser() — see router/index.js.
// Wait for the initial route and session restoration before rendering.
// This prevents the dashboard layout from flashing on /login after refresh.
router.isReady().then(() => app.mount('#app'));
