/*
  Service Worker — cache เฉพาะ "app shell" เท่านั้น ตามกฎที่ตกลงไว้ใน
  Data_Schema_Logic_Design_Risk_Monitoring (หมวด Access Control):
  ห้าม cache ข้อมูลผู้ป่วย/ผลแล็บใดๆ — เวอร์ชัน demo นี้ข้อมูลอยู่ใน JS ในตัว index.html
  อยู่แล้ว (ไม่มี API call จริง) เมื่อต่อ backend จริงในอนาคต ห้ามเพิ่ม cache ของ
  response ที่มาจาก Apps Script API เด็ดขาด
*/
const CACHE_NAME = 'renal-monitor-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // cache-first เฉพาะไฟล์ shell ที่รู้จัก, อย่างอื่นปล่อยผ่านไป network ตามปกติ
  const isShellFile = SHELL_FILES.some((f) => event.request.url.endsWith(f.replace('./', '')));
  if (isShellFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
