// Define um nome e versão para o cache
const CACHE_NAME = 'compara-preco-cache-v1';

// Lista de arquivos que o Service Worker deve salvar em cache
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  // Adiciona os ícones principais ao cache
  'android/android-launchericon-192-192.png',
  'android/android-launchericon-512-512.png'
];

// Evento 'install': Salva os arquivos em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': Intercepta as requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o arquivo existir no cache, retorna ele
        if (response) {
          return response;
        }
        // Se não, busca na rede, salva no cache e retorna
        return fetch(event.request).then(
          response => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para salvar no cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Evento 'activate': Limpa caches antigos (para quando atualizarmos o app)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});