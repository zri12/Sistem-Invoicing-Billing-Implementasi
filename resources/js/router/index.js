import { createRouter, createWebHistory } from 'vue-router';
import Foundation from '@/views/Foundation.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'foundation',
            component: Foundation,
        },
    ],
});

export default router;
