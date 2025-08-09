const CACHE_NAME = 'wasm-cache-v1';

// 需要缓存的文件列表 - 使用相对路径
const PRECACHE_ASSETS = [
  './wasm/lld',
  './wasm/clang',
  './wasm/memfs',
  './wasm/sysroot.tar'
];



// 其他事件处理保持不变...

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 安装事件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 直接使用相对路径进行缓存
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/wasm/')) {
    event.respondWith(
      caches.match(event.request).then(async (response) => {
        // 如果缓存中存在，直接返回
        if (response) {
          return response;
        }
        
        try {
          // 从网络获取
          const networkResponse = await fetch(event.request);
          // 只缓存成功的响应
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.error('获取资源失败:', error);
          throw error;
        }
      })
    );
  }
});