# NVGame Switcher 🎮

> **Discord Game Activity Switcher** – Aplikasi desktop native Windows 11 berkinerja tinggi untuk mensimulasikan aktivitas bermain game di Discord Desktop tanpa perlu menginstal atau menjalankan file game sebenarnya (0% CPU, zero disk clutter).

---

## ✨ Fitur Utama

- **🚀 Instant Cold-Start (< 50ms):** Dilengkapi snapshot database offline 10.400+ judul game terverifikasi Discord win32.
- **⚡ List Virtualization (@tanstack/react-virtual):** Scrolling lancar stabil di 60–120 FPS tanpa freeze pada ribuan game.
- **🔗 Zero Disk Clutter (NTFS Hardlink):** Menghubungkan direktori runtime sementara di `%TEMP%\dgs_runtime\` ke binary headless dummy menggunakan `std::fs::hard_link` (0 byte penggunaan disk tambahan).
- **⏱️ Live Session Timer & Banner:** Stopwatch aktif real-time (`HH:MM:SS`) dengan indikator proses PID dan tombol one-click stop.
- **📌 Windows 11 System Tray:** Integrasi tray dengan menu kontekstual (Status game, Stop, Open, Quit).
- **⚙️ Pengaturan Fleksibel:** Switch On/Off untuk *Minimize to System Tray on Close (X)* dan *Auto Cleanup on Exit*.
- **🧹 Automatic Orphan Cleanup:** Menjamin penghapusan folder sementara dan penghentian proses child secara bersih saat aplikasi ditutup maupun saat startup sweep setelah crash.
- **⭐ Favorit & Riwayat:** Sematkan game favorit dan lacak daftar game yang baru dimainkan.

---

## 🛠️ Arsitektur & Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | **Tauri v2** (WebView2 Windows 11, ultra ringan) |
| **Backend OS** | **Rust** (`windows-sys`, `tokio`, `reqwest`, `serde`, `chrono`) |
| **Frontend UI** | **React 18/19 + TypeScript + Tailwind CSS** (Windows 11 Fluent / NV Dark Modern) |
| **Virtualizer** | **@tanstack/react-virtual** |
| **Dummy Engine** | Minimal Win32 headless executable (`CREATE_NO_WINDOW`, `Sleep(INFINITE)`) |

---

## 🚀 Cara Menjalankan (Development Mode)

Pastikan dependensi berikut sudah terpasang:
- **Node.js** (v18+)
- **Rust & Cargo** (`rustup default stable-x86_64-pc-windows-msvc`)

### 1. Jalankan Mode Pengembangan
```powershell
# Jalankan Vite frontend dev server + Tauri window
npx @tauri-apps/cli dev
```

### 2. Kompilasi Installer Produksi (.msi / .exe)
```powershell
npx @tauri-apps/cli build
```
Hasil installer mandiri akan dibuat di folder `src-tauri/target/release/bundle/`.

---

## 📁 Struktur Proyek

```
NVGameSwitcher/
├── src-tauri/                     # Rust Backend (Tauri v2)
│   ├── Cargo.toml
│   ├── tauri.conf.json            # Konfigurasi jendela & permissions
│   ├── resources/
│   │   └── default_games_snapshot.json # Snapshot 10.400+ game terkompresi
│   ├── src/
│   │   ├── main.rs                # Entry point
│   │   ├── lib.rs                 # Handler IPC Commands
│   │   ├── dummy_main.rs          # Headless dummy binary
│   │   ├── hardlink.rs            # Mesin hardlink NTFS
│   │   ├── process_engine.rs      # Runner proses silent Win32
│   │   ├── discord_api.rs         # Sinkronisasi API Discord detectable
│   │   ├── cache.rs               # Manajemen cache lokal (%LOCALAPPDATA%)
│   │   ├── settings.rs            # Pengaturan pengguna (%LOCALAPPDATA%)
│   │   ├── tray.rs                # Windows 11 System Tray
│   │   ├── cleanup.rs             # Pembersihan folder sementara
│   │   └── state.rs               # Single-Active Session State
├── src/                           # Frontend (React + TypeScript)
│   ├── App.tsx                    # Controller utama
│   ├── index.css                  # Tema Windows 11 Fluent Dark
│   ├── types/index.ts             # Definisi interface TypeScript
│   ├── components/
│   │   ├── TitleBar.tsx           # Custom draggable Fluent titlebar
│   │   ├── Header.tsx             # Instant search & sync button
│   │   ├── ActiveSessionBanner.tsx# Banner status simulasi & timer
│   │   ├── TabNavigation.tsx      # Tab All, Favorites, History
│   │   ├── GameList.tsx           # Virtualized list
│   │   ├── GameRow.tsx            # Baris game dengan toggle switch
│   │   └── SettingsModal.tsx      # Modal preferensi (Switch Minimize to Tray)
├── package.json
└── vite.config.ts
```

---

## 🔒 Kebijakan Privasi & Keamanan
- 100% lokal di komputer pengguna.
- Tidak ada data pribadi atau token Discord yang diakses maupun dikirim ke server pihak ketiga.
- Hanya berkomunikasi dengan endpoint publik Discord `https://discord.com/api/v9/applications/detectable` untuk memperbarui katalog game.
