// all thanks to https://pwa.js.org

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

workbox.setConfig({debug: false});
workbox.precaching.precacheAndRoute([{url: '/offline', revision: null}]);

// Offline mode
const htmlHandler = new workbox.strategies.NetworkOnly();
const navigationRoute = new workbox.routing.NavigationRoute(({ event }) => {
  const request = event.request;
  return htmlHandler.handle({ event, request })
    .catch(() => caches.match('/offline', {ignoreSearch: true}));
});
workbox.routing.registerRoute(navigationRoute);

// Cache html
workbox.routing.registerRoute(
  /(\/|index\.html)$/,
  new workbox.strategies.NetworkFirst()
);

// Cache images
workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg|webp|ico)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60, // Only cache 60 images.
        purgeOnQuotaError: true
      })
    ]
  })
);

// Cache css js
workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'cssjs',
  })
);

// Cache fonts
workbox.routing.registerRoute(
  /\.(?:woff|woff2|ttf|otf|eot)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'fonts'
  })
);
