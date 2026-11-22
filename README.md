# NVGame Switcher 🎮

> **Discord Game Activity Switcher** – Aplikasi desktop native Windows 11 berkinerja tinggi untuk mensimulasikan aktivitas bermain game di Discord Desktop tanpa perlu menginstal atau menjalankan file game sebenarnya (0% CPU, zero disk clutter).

[![Platform](https://img.shields.io/badge/Platform-Windows%2011%20%7C%2010-0078D4?logo=windows)](https://github.com/Adiholick/nvgame-switcher)
[![Framework](https://img.shields.io/badge/Framework-Tauri%20v2-FFC131?logo=tauri)](https://tauri.app/)
[![UI](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-61DAFB?logo=react)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Rust-black?logo=rust)](https://www.rust-lang.org/)

---

## ✨ Fitur Utama

- **🚀 Instant Cold-Start (< 50ms):** Dilengkapi snapshot database offline 10.400+ judul game terverifikasi Discord win32.
- **⚡ List Virtualization (@tanstack/react-virtual):** Scrolling lancar stabil di 60–120 FPS tanpa freeze pada ribuan game.
- **🔗 Zero Disk Clutter (NTFS Hardlink):** Menghubungkan direktori runtime sementara di `%TEMP%\dgs_runtime\` ke binary dummy menggunakan `std::fs::hard_link` (0 byte penggunaan disk tambahan).
- **🔕 Silent Background Simulation:** Engine simulasi berjalan senyap sebagai *Win32 ToolWindow* (`WS_EX_TOOLWINDOW` & `WS_MINIMIZE`) tanpa memunculkan window kosong yang mengganggu atau memenuhi taskbar.
- **⏱️ Live Session Timer & Banner:** Stopwatch aktif real-time (`HH:MM:SS`) dengan indikator proses PID dan tombol one-click stop.
- **📌 Windows 11 System Tray:** Integrasi tray dengan menu kontekstual (Status game aktif, Stop, Buka Jendela, dan Quit).
- **⚙️ Pengaturan Fleksibel:** Opsi *Minimize to System Tray on Close (X)* dan *Auto Cleanup on Exit*.
- **🧹 Automatic Orphan Cleanup:** Menjamin pembersihan folder sementara dan penghentian proses game saat aplikasi ditutup maupun saat startup sweep.
- **⭐ Favorit & Riwayat:** Sematkan game favorit dan lacak daftar game yang baru saja dimainkan.

---

## 📥 Tata Cara Instalasi

Pilih salah satu metode instalasi di bawah ini sesuai kebutuhan Anda:

### Metode 1: Menggunakan Installer (Untuk Pengguna Langsung)

1. Buka halaman **[Releases](https://github.com/Adiholick/nvgame-switcher/releases)** di repository GitHub ini.
2. Unduh file installer versi terbaru:
   - **`NVGame Switcher_1.0.0_x64-setup.exe`** (Installer wizard praktis), atau
   - **`NVGame Switcher_1.0.0_x64_en-US.msi`** (Windows Installer package).
3. Jalankan file installer yang telah diunduh dan ikuti panduan di layar hingga selesai.
   > **Catatan Windows SmartScreen:**  
   > Karena aplikasi open-source ini belum menggunakan sertifikat berbayar (*code signing certificate*), Windows Defender SmartScreen mungkin akan menampilkan notifikasi *"Windows protected your PC"*. Cukup klik **More info** lalu pilih **Run anyway**.
4. Setelah instalasi selesai, buka **NVGame Switcher** melalui Start Menu atau shortcut Desktop.

---

### Metode 2: Build dari Source Code (Untuk Developer)

Jika Anda ingin berkontribusi atau mengompilasi aplikasi sendiri dari kode sumber:

#### Prasyarat Sistem:
- **Sistem Operasi:** Windows 10 atau Windows 11 (64-bit).
- **Node.js:** Versi 18 ke atas ([Unduh Node.js](https://nodejs.org/)).
- **Rust & Cargo:** Toolchain stable MSVC ([Unduh Rustup](https://rustup.rs/)).
- **C++ Build Tools:** Visual Studio C++ Build Tools (dibutuhkan oleh compiler Rust di Windows).

#### Langkah-langkah Build:

1. **Clone repository:**
   ```powershell
   git clone https://github.com/Adiholick/nvgame-switcher.git
   cd nvgame-switcher
   ```

2. **Install dependensi Node.js:**
   ```powershell
   npm install
   ```

3. **Jalankan Mode Pengembangan (Dev Mode):**
   ```powershell
   npm run tauri dev
   ```
   *Perintah ini akan menjalankan Vite dev server dan membuka jendela desktop aplikasi secara otomatis dengan fitur Hot Reload.*

4. **Kompilasi Installer Release (.exe & .msi):**
   ```powershell
   npm run tauri build
   ```
   *Hasil build installer akan otomatis dibuat di folder `src-tauri/target/release/bundle/nsis/` dan `bundle/msi/`.*

---

## 🎮 Panduan Penggunaan

1. **Pastikan Discord Mengizinkan Deteksi Game:**
   - Buka aplikasi **Discord Desktop**.
   - Masuk ke **User Settings (ikon roda gigi)** -> **Activity Privacy**.
   - Aktifkan opsi **"Display current activity as a status message"** (Tampilkan aktivitas saat ini sebagai pesan status).
2. **Memilih & Menjalankan Game:**
   - Gunakan bilah pencarian instan di bagian atas untuk menemukan judul game yang Anda inginkan (misal: *Counter-Strike 2*, *Valorant*, *Grand Theft Auto V*).
   - Klik **Toggle Switch** di sebelah kanan nama game ke posisi **ON**.
   - Banner hijau aktif akan muncul di bagian atas lengkap dengan penghitung durasi sesi (*timer*).
   - Cek profil Discord Anda; status Anda akan langsung berubah menjadi *"Playing <Nama Game>"*.
3. **Menghentikan Simulasi:**
   - Klik tombol **Stop** pada banner aktif di bagian atas, atau matikan switch game yang sedang berjalan.
   - Anda juga dapat menghentikan sesi langsung dari menu klik-kanan **System Tray** di taskbar pojok kanan bawah.

---

## 🛠️ Arsitektur & Tech Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | **Tauri v2** | Menggunakan native Windows WebView2, hemat RAM (< 45 MB). |
| **Backend OS** | **Rust** (`windows-sys`, `tokio`, `reqwest`, `serde`, `chrono`) | Manajemen proses native, Win32 API, dan IPC berkecepatan tinggi. |
| **Frontend UI** | **React 18 + TypeScript + Tailwind CSS** | Desain Fluent / NV Dark Modern yang selaras dengan Windows 11. |
| **Virtualizer** | **@tanstack/react-virtual** | Merender daftar game secara virtual tanpa lag pada 10.000+ item. |
| **Simulation Engine** | **Win32 ToolWindow Process** | Menjalankan proses minim memori (0% CPU) tanpa window yang mengganggu. |

---

## 📁 Struktur Proyek

```
NVGameSwitcher/
├── src-tauri/                     # Rust Backend (Tauri v2)
│   ├── Cargo.toml
│   ├── tauri.conf.json            # Konfigurasi jendela & permissions
│   ├── resources/
│   │   ├── default_games_snapshot.json # Snapshot 10.400+ game win32
│   │   └── dummy.exe              # Binary simulasi ringan
│   ├── src/
│   │   ├── main.rs                # Entry point aplikasi
│   │   ├── lib.rs                 # Handler IPC Commands Tauri
│   │   ├── dummy_main.rs          # Source code Win32 dummy toolwindow
│   │   ├── hardlink.rs            # Mesin hardlink NTFS ke %TEMP%
│   │   ├── process_engine.rs      # Runner proses silent Win32
│   │   ├── discord_api.rs         # Sinkronisasi API resmi detectable Discord
│   │   ├── cache.rs               # Manajemen cache lokal (%LOCALAPPDATA%)
│   │   ├── settings.rs            # Manajemen preferensi pengguna
│   │   ├── tray.rs                # Handler Windows 11 System Tray
│   │   ├── cleanup.rs             # Pembersih folder sementara otomatis
│   │   └── state.rs               # Single-Active Session State
├── src/                           # Frontend (React + TypeScript)
│   ├── App.tsx                    # Controller & state utama
│   ├── index.css                  # Styling tema NV Dark Modern Fluent
│   ├── types/index.ts             # Definisi interface TypeScript
│   ├── components/
│   │   ├── TitleBar.tsx           # Custom draggable titlebar
│   │   ├── Header.tsx             # Instant search & tombol sinkronisasi
│   │   ├── ActiveSessionBanner.tsx# Banner status simulasi aktif & stopwatch
│   │   ├── TabNavigation.tsx      # Tab All, Favorites, dan History
│   │   ├── GameList.tsx           # Virtualized list container
│   │   ├── GameRow.tsx            # Komponen baris game dengan toggle switch
│   │   └── SettingsModal.tsx      # Modal preferensi (Minimize to Tray, dll)
├── package.json
└── vite.config.ts
```

---

## 🔒 Kebijakan Privasi & Keamanan

- **100% Offline & Lokal:** Seluruh proses berjalan di komputer Anda sendiri.
- **Bebas Akun / Token:** Aplikasi **tidak pernah** meminta password, API key, maupun token akun Discord Anda.
- **Aman Tanpa Backdoor:** Hanya mengambil daftar nama game yang terdaftar secara publik di Discord melalui endpoint resmi `https://discord.com/api/v9/applications/detectable`.

---

## 📝 Lisensi

Proyek ini didistribusikan di bawah lisensi terbuka untuk komunitas Discord dan developer.
