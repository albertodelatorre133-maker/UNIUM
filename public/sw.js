/**
 * Service worker mínimo, solo para recibir notificaciones push. Se registra
 * desde lib/push.ts cuando la alumna activa las notificaciones en su perfil.
 */

const ESTILO_POR_TIPO = {
  recordatorio: {
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [{ action: "ver", title: "Ver mi clase" }],
  },
  cupo: {
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    actions: [{ action: "ver", title: "Ver mis clases" }],
  },
  promocion: {
    vibrate: [150],
    requireInteraction: false,
    actions: [{ action: "ver", title: "Ver más" }],
  },
  general: {
    vibrate: [150],
    requireInteraction: false,
    actions: [],
  },
};

self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = {};
  }

  const titulo = datos.titulo || "UNIUM";
  const tipo = datos.tipo && ESTILO_POR_TIPO[datos.tipo] ? datos.tipo : "general";
  const estilo = ESTILO_POR_TIPO[tipo];

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || "",
      icon: "/icon.png",
      badge: "/icon.png",
      tag: tipo,
      renotify: true,
      vibrate: estilo.vibrate,
      requireInteraction: estilo.requireInteraction,
      actions: estilo.actions,
      data: { url: datos.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if (cliente.url.startsWith(self.location.origin) && "focus" in cliente) {
          cliente.navigate(url);
          return cliente.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
