const VERSION = "worktogether-shell-v4";
const ASSET_CACHE = "worktogether-assets-v4";
const OFFLINE_PAGES = ["/en/offline", "/uk/offline", "/pl/offline"];
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

async function localizedOfflineResponse(locale) {
  const cached = (await caches.match(`/${locale}/offline`)) ?? (await caches.match("/en/offline"));
  if (!cached) return Response.error();

  const headers = new Headers(cached.headers);
  headers.set("Content-Language", locale);
  headers.delete("Content-Encoding");
  headers.delete("Content-Length");

  let html = await cached.text();
  const htmlLanguage = /(<html\b[^>]*\blang=)(["'])[^"']*\2/iu;
  html = htmlLanguage.test(html)
    ? html.replace(htmlLanguage, `$1"${locale}"`)
    : html.replace(/<html\b/iu, `<html lang="${locale}"`);

  return new Response(html, {
    status: cached.status,
    statusText: cached.statusText,
    headers,
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(OFFLINE_PAGES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== VERSION && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  // Next.js development chunk names are not content-addressed. Caching them on
  // loopback can mix Turbopack/HMR generations and cause reload loops in
  // Firefox. Production assets remain cacheable because their filenames are
  // immutable build hashes.
  if (LOOPBACK_HOSTS.has(self.location.hostname) && url.pathname.startsWith("/_next/")) {
    return;
  }

  if (request.mode === "navigate") {
    const networkResponse =
      url.searchParams.get("offline-preview") === "1"
        ? Promise.reject(new TypeError("Offline fallback preview requested."))
        : fetch(request);
    event.respondWith(
      networkResponse.catch(async () => {
        const locale = /^\/(en|uk|pl)(?:\/|$)/u.exec(url.pathname)?.[1] ?? "en";
        return localizedOfflineResponse(locale);
      })
    );
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached ?? Response.error());
        return cached ?? network;
      })
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { title: "WorkTogether", body: event.data?.text() ?? "" };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "WorkTogether", {
      body: payload.body ?? "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: payload.tag ?? "worktogether",
      renotify: false,
      data: {
        url: payload.url ?? "/en/notifications",
        notificationId: payload.notificationId,
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requested = new URL(event.notification.data?.url ?? "/notifications", self.location.origin);
  const target =
    requested.origin === self.location.origin
      ? requested.href
      : new URL("/notifications", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const sameOrigin = clients.find((client) => client.url.startsWith(self.location.origin));
      if (sameOrigin) {
        sameOrigin.navigate(target);
        return sameOrigin.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
