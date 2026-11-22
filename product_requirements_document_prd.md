# Product Requirements Document (PRD)

**Nama Produk:** NVGame Switcher  
**Versi Dokumen:** 1.0  
**Target Platform:** Windows 11 (x64 / ARM64)  
**Status:** Draft / Ready for Development  

---

## 1. Ringkasan Eksekutif & Tujuan Produk

**Discord Game Activity Switcher** adalah aplikasi desktop ringan berkinerja tinggi (*native* Windows 11) yang memungkinkan pengguna mensimulasikan aktivitas bermain game tertentu di klien Discord Desktop tanpa harus menginstal atau menjalankan file game sebenarnya yang berukuran puluhan gigabyte.

### Tujuan Utama

1. **Performa Native Tanpa Lag:** Mampu merender, mencari, dan memfilter lebih dari 15.000 daftar game dari database publik Discord secara instan (60/120 FPS) dengan konsumsi RAM minimal (< 50 MB).
2. **Zero Disk Clutter:** Menggunakan mekanisme *filesystem hardlink* di direktori sementara (`%TEMP%`) dan *cleanup* otomatis sehingga tidak mengotori direktori sistem maupun memakan ruang penyimpanan.
3. **Kontrol Instan (One-Click Switch):** Menyediakan sakelar (*toggle switch*) On/Off langsung pada daftar game, penghitung durasi sesi (*session timer*), serta integrasi *System Tray* Windows 11.

---

## 2. Target Pengguna & Use Case

* **Pengguna Utama:** Pengguna Discord di Windows 11 yang ingin menguji atau menyimulasikan status aktivitas (*Game Activity*) dan melacak durasi sesi untuk berbagai judul game dari katalog Discord.
* **Skenario Penggunaan:**
  1. Pengguna membuka aplikasi, mencari nama game tertentu (misalnya *"Counter-Strike 2"* atau *"Cyberpunk 2077"*).
  2. Pengguna mengaktifkan *toggle switch* ke posisi **ON**.
  3. Sistem membuat struktur folder & *hardlink executable* di `%TEMP%`, lalu menjalankan proses *dummy* dengan 0% beban CPU/GPU.
  4. Klien Discord mendeteksi proses tersebut sebagai game asli.
  5. Pengguna mematikan *toggle* (**OFF**) atau beralih ke game lain; sistem otomatis menghentikan proses lama dan menghapus direktori sementaranya.

---

## 3. Arsitektur & Tech Stack (Native Windows 11)

Untuk menjamin performa *native* tanpa *lag* dan ukuran *installer* kecil (< 10 MB), arsitektur aplikasi dibagi menjadi dua lapisan utama:

| Komponen                 | Teknologi                                | Alasan Pemilihan                                                                                                              |
|:------------------------ |:---------------------------------------- |:----------------------------------------------------------------------------------------------------------------------------- |
| **Core Framework**       | **Tauri v2**                             | Menggunakan *WebView2* bawaan Windows 11 tanpa membundel Chromium sehingga jauh lebih hemat RAM dibanding Electron.           |
| **Backend & OS Engine**  | **Rust (`windows-rs`)**                  | Eksekusi *native* berkecepatan tinggi, akses langsung ke Win32 API, manajemen proses aman, dan dukungan `std::fs::hard_link`. |
| **Frontend UI**          | **React 19 + TypeScript + Tailwind CSS** | Komponen UI reaktif dengan desain selaras Windows 11 (Mica/Fluent aesthetic).                                                 |
| **List Virtualization**  | **`@tanstack/react-virtual`**            | Merender hanya item yang terlihat di *viewport* (~15–20 baris), menjamin *scrolling* 15.000+ game tetap 120 FPS tanpa *lag*.  |
| **Dummy Process Binary** | **Rust / C++ Minimal Binary (~15 KB)**   | Program konsol tanpa jendela (`CREATE_NO_WINDOW`) yang hanya memanggil Win32 `Sleep(INFINITE)` (0% CPU, ~1 MB RAM).           |

---

## 4. Spesifikasi Fitur Fungsional

### 4.1. Sinkronisasi & Manajemen Database Game

* **Sumber Data:** Mengambil data dari endpoint publik `https://discord.com/api/v9/applications/detectable`.
* **Filtering Otomatis:** Hanya menyimpan dan menampilkan aplikasi yang memiliki array `executables` dengan `"os": "win32"`.
* **Local Caching:** Menyimpan hasil *parsing* ke `%LOCALAPPDATA%\DiscordGameSwitcher\games_cache.json` agar aplikasi terbuka secara instan (*cold start* < 0.5 detik) tanpa menunggu unduhan jaringan.
* **Manual Sync:** Tombol *Refresh Database* di *header* untuk memperbarui daftar game terbaru dari server Discord.

### 4.2. Antarmuka Daftar Game & Pencarian Instan

* **Instant Fuzzy Search:** Pencarian *real-time* berdasarkan nama game maupun nama file `.exe` dengan *debouncing* ringan dan pencocokan indeks di memori.
* **Virtualized Game List:** Menampilkan:
  * Ikon game (diambil secara *lazy-load* dari `https://cdn.discordapp.com/app-icons/{id}/{icon_hash}.png` dengan *fallback* ikon default).
  * Nama resmi game.
  * Target *executable path* (contoh: `game/bin/win64/cs2.exe`).
  * Tombol **Favorite (Bintang)** untuk menyematkan game ke daftar teratas.
  * **Toggle Switch (ON/OFF)** sebagai pengontrol utama.
* **Tab Filter:** *All Games*, *Favorites*, dan *History / Recently Played*.

### 4.3. Active Session Banner & Timer

* Ketika sebuah game aktif berjalan, muncul *banner* status di bagian atas jendela aplikasi yang menampilkan:
  * Nama game & PID (*Process ID*) yang berjalan.
  * **Live Session Timer (`HH:MM:SS`):** Menghitung durasi aktif sejak tombol **Start / ON** ditekan (membantu pengguna memantau target durasi sesi).
  * Tombol **Stop** cepat.

### 4.4. Process Spoofing Engine (Zero-Clutter Execution)

* **Single Active Mode (Default):** Mengaktifkan game baru secara otomatis mematikan game yang sedang berjalan sebelumnya (mencegah konflik dan penggunaan berlebihan).
* **Path Reconstruction:** Backend mengurai string `executables[].name` (misalnya `Binaries/Win64/Game.exe`) menjadi struktur folder relatif dan nama file target.
* **Hardlink Injection:** Membuat file target di `%TEMP%\dgs_runtime\{app_id}\...` menggunakan `std::fs::hard_link` yang merujuk pada `dummy.exe` internal (**0 byte penggunaan ruang penyimpanan tambahan**).
* **Silent Execution:** Menjalankan proses menggunakan flag Win32 `CREATE_NO_WINDOW` (`0x08000000`) sehingga tidak ada jendela CMD yang berkedip di layar pengguna.

### 4.5. Windows 11 System Tray & Lifecycle Safety

* **Minimize to Tray:** Menekan tombol tutup (`X`) dapat dikonfigurasi untuk menyembunyikan jendela ke *System Tray* Windows 11 sementara proses simulasi tetap berjalan di latar belakang.
* **Tray Context Menu:** Menampilkan status game aktif, tombol *Stop Active Game*, *Open Window*, dan *Quit*.
* **Guaranteed Cleanup on Exit:** Ketika pengguna memilih *Quit* dari *System Tray* atau aplikasi mengalami *graceful shutdown*, sistem wajib menghentikan seluruh *child process* aktif (`TerminateProcess`) dan menghapus direktori `%TEMP%\dgs_runtime\` secara rekursif.

---

## 5. Persyaratan Non-Fungsional (Performance & Reliability)

| Metrik                     | Target Spesifikasi                                       |
|:-------------------------- |:-------------------------------------------------------- |
| **Cold Startup Time**      | < 500 ms (menggunakan cache lokal)                       |
| **UI Frame Rate**          | Stabil di 60 FPS – 120 FPS saat *scrolling* 15.000+ item |
| **Search Latency**         | < 16 ms (1 frame) per input karakter                     |
| **Idle Memory Footprint**  | < 45 MB RAM                                              |
| **Dummy Process Overhead** | 0.0% CPU, < 1.5 MB RAM                                   |
| **Disk Footprint Sisa**    | 0 Byte setelah proses dihentikan (*Stop*)                |

---

## 6. Struktur Data & Penyimpanan Lokal

### 6.1. Skema Cache Game (`games_cache.json`)

```json
[
  {
    "id": "356875221078245376",
    "name": "Counter-Strike 2",
    "icon": "942b8e2e66564310724c7143b5e1f710",
    "executables": [
      "game/bin/win64/cs2.exe"
    ]
  }
]
```

### 6.2. Skema Preferensi Pengguna (`settings.json`)

```json
{
  "favorites": ["356875221078245376"],
  "recent_history": [
    {
      "id": "356875221078245376",
      "last_played_at": "2026-11-16T19:30:00Z",
      "total_seconds": 3600
    }
  ],
  "minimize_to_tray_on_close": true,
  "auto_cleanup_on_exit": true
}
```

---

## 7. Batasan Sistem & Risiko Teknis

1. **Game dengan Validasi Argumen Command-Line:** Sebagian kecil game berbasis *launcher* atau Java (seperti *Minecraft* dengan `javaw.exe`) memerlukan parameter *command-line* khusus agar dikenali Discord. Aplikasi akan memberi tanda indikator (*badge* info) pada entri yang menggunakan *executable* generik (`javaw.exe`, `cmd.exe`, dll).
2. **Orphan Process Recovery:** Jika komputer mengalami *crash* atau mati listrik saat simulasi berjalan, aplikasi akan melakukan pembersihan otomatis terhadap sisa folder di `%TEMP%\dgs_runtime\` pada saat aplikasi dibuka kembali (*startup sweep*).
3. **Kepatuhan Penggunaan:** Aplikasi dirancang untuk berjalan satu sesi aktif dalam satu waktu guna menghindari lonjakan telemetri tidak wajar pada klien Discord.

---

## 8. Milestone Pengembangan

* **Fase 1 — Core Engine (Rust Backend):** Implementasi fetcher API Discord, parser JSON, pembuat *hardlink* di `%TEMP%`, dan kontrol *Start/Stop* proses dengan `CREATE_NO_WINDOW`.
* **Fase 2 — Native UI & Virtual List (React + Tauri):** Membangun antarmuka bergaya Windows 11, *virtualized list* untuk >15.000 game, *instant search*, dan *active timer banner*.
* **Fase 3 — System Tray & Polish:** Integrasi *System Tray*, fitur *Favorites*, *History*, serta *startup orphan cleanup*.
* **Fase 4 — Packaging:** Kompilasi installer `.msi` / `.exe` (NSIS) mandiri untuk Windows 11.