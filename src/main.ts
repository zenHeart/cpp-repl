import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const base = import.meta.env.BASE_URL;
      const registration = await navigator.serviceWorker.register(
        `${base}service-worker.js`,
        {
          scope: base,
          type: 'module'
        }
      );
      
      console.log('ServiceWorker 注册成功:', registration.scope);
    } catch (error) {
      console.log('ServiceWorker 注册失败:', error);
    }
  });
}