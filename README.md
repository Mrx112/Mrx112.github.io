# Portofolio Adi Susilo

Portofolio web modern dengan tema cyberpunk yang menampilkan proyek-proyek pengembangan perangkat lunak.

## 🚀 Fitur Utama

### ✨ Python Code Demonstration
- **Live Python Execution**: Jalankan kode Python langsung di browser menggunakan Pyodide
- **Interactive Console**: Terminal Python interaktif dengan output real-time
- **Project-Specific Demos**: Demo kode khusus untuk setiap proyek Python
- **GitHub Integration**: Load kode langsung dari repository GitHub

### 🎮 Proyek Yang Dapat Didemonstrasikan

1. **Network Admin Tools** - Tools administrasi jaringan dengan GUI
2. **CyberScan** - Tools keamanan jaringan untuk scanning dan deteksi kerentanan
3. **API Integration Tool** - Tool untuk integrasi dengan berbagai API RESTful
4. **Python Mini Games** - Koleksi game sederhana (tebak angka, kalkulator)

### 🎨 Desain Cyberpunk
- Matrix rain effect
- Neon glow effects
- Responsive design
- Dark theme dengan aksen cyber

## 🛠️ Teknologi Yang Digunakan

- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Python Runtime**: Pyodide (WebAssembly)
- **Icons**: Font Awesome
- **Animations**: CSS Animations & JavaScript

## 📁 Struktur Proyek

```
Mrx112.github.io/
├── index.html          # Halaman utama
├── assets/
│   ├── css/
│   │   └── style.css   # Styling cyberpunk
│   ├── js/
│   │   └── script.js   # JavaScript & Pyodide integration
│   ├── audio/
│   │   └── cyber-spnk-223448.mp3  # Musik latar
│   └── img/
│       └── profile/
│           └── adi2.jpg # Foto profil
```

## 🚀 Cara Menjalankan

### Opsi 1: GitHub Pages (Production)
Situs ini di-host di GitHub Pages dan dapat diakses di: `https://mrx112.github.io`

### Opsi 2: Local Development
```bash
# Clone repository
git clone https://github.com/Mrx112/Mrx112.github.io.git

# Masuk ke direktori
cd Mrx112.github.io

# Jalankan server lokal
python -m http.server 8000

# Buka browser dan akses http://localhost:8000
```

## 🎯 Cara Menggunakan Demo Python

1. **Klik tombol "Demo Kode"** pada kartu proyek Python
2. **Pilih opsi**:
   - **Jalankan Kode**: Menjalankan kode yang ada di textarea
   - **Load dari GitHub**: Memuat kode langsung dari repository GitHub
   - **Reset Kode**: Mengembalikan ke kode demo default
3. **Lihat output** di console bawah textarea

## 🔧 Kustomisasi

### Menambah Proyek Python Baru

1. **Tambahkan kartu proyek** di `index.html` bagian projects:
```html
<div class="col-md-6 col-lg-4">
    <div class="project-card card cyber-card">
        <!-- Isi kartu proyek -->
        <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#projectModal" data-project="nama-proyek">
            <i class="fas fa-code me-1"></i>Demo Kode
        </button>
    </div>
</div>
```

2. **Tambahkan case di `script.js`** untuk demo kode:
```javascript
case 'nama-proyek':
    title.textContent = 'Nama Proyek - Demo Python';
    codeInput.value = `# Kode demo Python Anda di sini`;
    break;
```

3. **Tambahkan di fungsi resetCode** dengan kode yang sama

### Mengubah Styling
Edit file `assets/css/style.css` untuk mengubah tampilan cyberpunk.

## 📞 Kontak

- **Instagram**: [@ru_all12](https://instagram.com/ru_all12)
- **Email**: Via form kontak di website

## 📝 Lisensi

Proyek ini dibuat untuk tujuan portofolio dan demonstrasi teknologi web modern.

---

**Dikembangkan dengan ❤️ oleh Adi Susilo**