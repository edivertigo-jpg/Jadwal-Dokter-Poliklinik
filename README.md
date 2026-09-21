# Jadwal Praktek Dokter — RSU Surya Husadha Nusa Dua (PWA)

## Isi
- `index.html` — aplikasi + data jadwal dokter
- `manifest.webmanifest` — nama, icon, warna aplikasi
- `sw.js` — service worker (offline)
- `icons/` — icon aplikasi (dari logo RSU)

## Pasang di GitHub Pages
1. Upload semua file & folder `icons/` ke repo (langsung di root, jangan di dalam subfolder lain).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
3. Buka `https://USERNAME.github.io/NAMA-REPO/` di HP.

## Pasang di HP
- **Android (Chrome):** tombol "Pasang di HP" muncul di header, atau menu ⋮ → *Install app*.
- **iPhone (Safari):** Bagikan → *Tambah ke Layar Utama*.

## Update jadwal
Cukup ganti `index.html` di GitHub. HP yang online otomatis ambil versi baru;
kalau offline, tampil versi terakhir yang tersimpan.
Ubah `VERSION` di `sw.js` hanya kalau icon / manifest / sw.js ikut berubah.
