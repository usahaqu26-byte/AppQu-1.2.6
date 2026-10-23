# AppQu & BaksoQu POS — Ekosistem Warga & POS Android

Aplikasi ekosistem komunitas warga, lapak UMKM, dan Point of Sales (POS Kasir Restoran, Bengkel, Klinik & Ritel) berbasis Android Capacitor & React SPA.

---

## ⚡ Otomatisasi CI/CD: Push GitHub ➔ Auto-Version ➔ Auto-Action ➔ Auto-Release ➔ Auto-Update

Alur ini dirancang **100% Free** (gratis tanpa biaya runner khusus, tanpa biaya langganan, dan tanpa akun Google Play Developer berbayar):

### 1. 🚀 Push ke GitHub (Cukup 1 Perintah)
Setiap kali Anda melakukan push ke branch `main` atau `master`:
```bash
git add .
git commit -m "feat: pembaruan fitur"
git push origin main
```
Workflow GitHub Actions di [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) akan **langsung terpicu otomatis**.

### 2. 🔢 Auto-Versioning (Monotonik SemVer & VersionCode)
- Sistem menghitung versi baru secara otomatis: jika versi awal `1.2.2`, push berikutnya menjadi `v1.2.3`, `v1.2.4`, dst.
- Android `versionCode` otomatis naik (`1000 + run_number`), sehingga sistem Android di HP akan langsung menerima pembaruan APK tanpa error *"older version code"*.
- Jika Anda ingin rilis versi khusus (misal versi mayor `v2.0.0`), cukup buat tag:
  ```bash
  git tag v2.0.0
  git push origin v2.0.0
  ```

### 3. ⚙️ Build APK Mulus & Cepat (100% Free)
- Dijalankan pada runner resmi `ubuntu-latest` dari kuota gratis GitHub Actions.
- Menggunakan **JDK 21 Temurin** dengan cache Gradle aktif (waktu kompilasi cepat ~1-3 menit).
- Menggunakan Android SDK 35 & Android Gradle Plugin 8.7.3.
- Konfigurasi memori optimal (`-Xmx2048m -XX:MaxMetaspaceSize=512m --no-daemon`) mencegah Out-Of-Memory.
- Auto-generate Keystore debug di runner, sehingga berkas APK langsung ditandatangani (*signed*) tanpa perlu sertifikat berbayar.

### 4. 📦 Auto-Release di GitHub
Setelah build sukses, GitHub Release dibuat secara otomatis dengan berkas:
- **`AppQu-vX.X.X.apk`** — Berkas APK versi rilis spesifik.
- **`AppQu-latest.apk`** — Tautan permanen yang selalu mengarah ke versi termutakhir.
- **`BaksoQu-POS-vX.X.X.apk`** — Salinan nama untuk POS BaksoQu.
- **`version.json`** — Metadata rilis untuk dideteksi oleh aplikasi.

### 5. 📲 In-App Auto-Update (Langsung di Aplikasi)
- Aplikasi secara otomatis memeriksa GitHub Releases saat dibuka di latar belakang.
- Jika terdapat versi baru di GitHub, muncul **banner notifikasi** & modal pembaruan dengan catatan rilis (*changelog*).
- Pengguna cukup menekan tombol **"Unduh & Perbarui Sekarang"** untuk mengunduh APK dan memasangnya langsung.
- Terdapat proteksi fallback multi-tier ke berkas `raw.githubusercontent.com` sehingga pemeriksaan pembaruan tidak terhambat oleh *rate-limit* GitHub API.

---

## 🛠️ Konfigurasi Repositori di Aplikasi
1. Buka menu **Pengaturan** di aplikasi ➔ pilih tab **Update APK**.
2. Masukkan nama repositori GitHub Anda (format: `username/nama-repo`, contoh: `smbsyariah/baksoqu-pos` atau `akunbaru/appqu`).
3. Tekan tombol **"Auto-Deteksi"** untuk membaca otomatis repositori dari `version.json`.
4. Tekan **"Periksa Pembaruan Sekarang"** untuk menguji koneksi rilis.

---

## 🔄 Bisakah Tetap Auto-Update Walaupun Ganti-Ganti Akun di GitHub?

**YA, SANGAT BISA!** Sistem telah disiapkan agar sepenuhnya adaptif terhadap pergantian akun GitHub tanpa perlu merombak kode:

### 1. ⚙️ CI/CD Otomatis Membaca Akun Baru
Skrip GitHub Actions [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) menggunakan variabel bawaan GitHub `${{ github.repository }}` dan `${{ secrets.GITHUB_TOKEN }}`. 
- Saat Anda memindahkan, melakukan *fork*, atau *push* repositori ini ke akun GitHub baru (misal: `akun-kedua/appqu`), GitHub Actions di akun baru akan **otomatis mengenali nama akun tersebut** dan menerbitkan rilis APK di bawah akun baru tersebut.

### 2. 🔑 Keystore Konsisten (`android/app/debug.keystore`)
Masalah klasik saat ganti akun adalah Android menolak update dengan pesan *"App not installed / Signature mismatch"*.
- Di AppQu, berkas penandatangan digital (`android/app/debug.keystore`) **disimpan permanen di repository**.
- Akun GitHub mana pun yang mengompilasi APK, kunci tanda tangan APK-nya **100% identik**. Ponsel Android pengguna dapat melakukan *in-place update* (menimpa update secara mulus tanpa harus menghapus aplikasi dan tanpa kehilangan data).

### 3. 🎯 Cara Mengalihkan Sumber Update:
* **Skenario A (Pengguna Memasang APK Baru dari Akun Baru):**
  APK yang dibuild oleh akun baru otomatis membawa `version.json` berisi nama akun baru. Begitu dibuka, aplikasi **langsung otomatis mengalihkan sumber pembaruan ke akun baru**.
* **Skenario B (HP Masih Memakai APK dari Akun Lama):**
  Pengguna/Admin cukup membuka menu **Pengaturan** ➔ tab **Update APK** ➔ ubah kolom repository ke `akun-baru/nama-repo` ➔ klik **Simpan**. Aplikasi akan langsung melacak rilis dari akun baru.
* **Skenario C (Fitur Transfer Repository di GitHub):**
  Jika Anda memindahkan repositori melalui menu *Settings ➔ Transfer ownership* di GitHub, GitHub secara otomatis membuat pengalihan permanen (HTTP 301/307 Redirect). Semua panggilan API pembaruan dari HP akan otomatis dialihkan ke akun baru tanpa perlu ubah apa pun di HP!
