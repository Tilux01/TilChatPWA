self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = {
      notification: {
        title: "New Message",
        body: "You have a new message."
      }
    };
  }

  const { title, body, icon } = data.notification;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || "/icon-192.png",
      data
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        return clients.openWindow("/");
      })
  );
});
