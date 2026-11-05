# Seblak Story Photobooth PWA

## Isi
- Kamera depan/belakang dan webcam USB yang dikenali browser Android
- Countdown 3/5/10 detik
- 3 atau 4 foto per strip
- Frame kuning-hitam Seblak Story
- Simpan PNG dan cetak melalui dialog cetak Android
- PWA installable dan cache offline

## Cara menjalankan
1. Upload seluruh isi folder ini ke GitHub repository.
2. Aktifkan GitHub Pages: Settings > Pages > Deploy from a branch > main / root.
3. Buka URL HTTPS GitHub Pages di Samsung Tab A9.
4. Izinkan kamera, lalu pilih Add to Home screen / Install app.

Kamera memerlukan HTTPS atau localhost. Buka aplikasi setelah koneksi internet pertama kali agar file PWA tersimpan untuk penggunaan offline.

## Catatan printer
Versi ini mencetak lewat dialog cetak Android. Akses Bluetooth klasik ESC/POS tidak tersedia secara universal di PWA. Untuk cetak langsung tanpa dialog perlu diketahui model printer EPPOS dan jenis koneksi/protokolnya (Bluetooth BLE atau Bluetooth klasik/SPP), lalu dibuat jembatan Android yang sesuai.

## Kustomisasi
- Ubah slogan/alamat di `index.html` dan `app.js`.
- Ganti warna utama `#ffd329` di CSS dan kode gambar.
- Versi awal: 1.0.0.
