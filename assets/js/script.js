// assets/js/script.js
// Inisialisasi Pyodide
let pyodide;

async function loadPyodide() {
    try {
        pyodide = await loadPyodide();
        console.log("Pyodide loaded successfully");
        
        // Setup output redirection
        pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
        sys.stderr = StringIO()
        `);
    } catch (error) {
        console.error("Error loading Pyodide:", error);
    }
}

// Load Pyodide when page is ready
document.addEventListener('DOMContentLoaded', function() {
    loadPyodide();
    
    // Initialize other components
    initMusicControl();
    initProjectModal();
    initContactForm();
    createMatrixEffect();
    
    // Setup scroll animations
    window.addEventListener('scroll', animateSkills);
    window.addEventListener('resize', handleResize);
});

// Music Control
function initMusicControl() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false;

    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-play"></i> Musik';
        } else {
            bgMusic.play().catch(e => {
                console.log("Autoplay prevented:", e);
                // Show play button to let user know they need to interact
            });
            musicToggle.innerHTML = '<i class="fas fa-pause"></i> Musik';
        }
        isPlaying = !isPlaying;
    });
}

// Project Modal
function initProjectModal() {
    const projectModal = document.getElementById('projectModal');
    if (!projectModal) return;

    projectModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const project = button.getAttribute('data-project');
        const title = projectModal.querySelector('.modal-title');
        const codeInput = document.getElementById('codeInput');

        // Set judul berdasarkan proyek
        switch(project) {
            case 'network':
                title.textContent = 'Network Admin Tools - Demo Python';
                codeInput.value = `# Contoh fungsi network scanning
import socket
import subprocess
import platform

def ping_host(host):
    """
    Ping host untuk mengecek konektivitas
    """
    param = "-n" if platform.system().lower() == "windows" else "-c"
    command = ["ping", param, "1", host]
    return subprocess.call(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0

def scan_port(host, port):
    """
    Scan port tertentu pada host
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

# Test konektivitas
host = "google.com"
print(f"Ping {host}: {'Berhasil' if ping_host(host) else 'Gagal'}")

# Test port scanning
host = "example.com"
ports = [80, 443, 22, 21, 53]

print(f"\\nScanning port untuk {host}")
for port in ports:
    if scan_port(host, port):
        print(f"Port {port}: TERBUKA")
    else:
        print(f"Port {port}: tertutup")`;
                break;
            case 'cyberscan':
                title.textContent = 'CyberScan - Demo Python';
                codeInput.value = `# Contoh fungsi cybersecurity scanning
import socket
import subprocess
import platform
from datetime import datetime

def network_scan():
    """
    Simulasi network scanning
    """
    print("Memulai network scan...")
    print("=" * 40)

    # Simulasi hasil scanning
    devices = [
        {"ip": "192.168.1.1", "hostname": "router.local", "status": "active", "ports": [80, 443, 22]},
        {"ip": "192.168.1.10", "hostname": "pc-01.local", "status": "active", "ports": [80, 135, 139, 445]},
        {"ip": "192.168.1.15", "hostname": "server.local", "status": "active", "ports": [21, 22, 80, 443, 3306]},
        {"ip": "192.168.1.20", "hostname": "printer.local", "status": "inactive", "ports": [80, 443]},
    ]

    print(f"{'IP Address':<15} {'Hostname':<15} {'Status':<10} {'Open Ports'}")
    print("-" * 55)

    for device in devices:
        if device['status'] == 'active':
            ports = ', '.join(map(str, device['ports']))
            print(f"{device['ip']:<15} {device['hostname']:<15} {device['status']:<10} {ports}")

    return devices

def check_vulnerabilities(devices):
    """
    Simulasi vulnerability check
    """
    print("\\nMemeriksa kerentanan...")
    print("=" * 40)

    vulnerabilities = []

    for device in devices:
        if device['status'] == 'active':
            # Cek port yang berpotensi rentan
            vulnerable_ports = [port for port in device['ports'] if port in [21, 23, 135, 139, 445]]

            if vulnerable_ports:
                for port in vulnerable_ports:
                    vuln = {
                        "ip": device['ip'],
                        "port": port,
                        "severity": "Medium",
                        "description": f"Port {port} terbuka yang mungkin rentan"
                    }
                    vulnerabilities.append(vuln)

    if vulnerabilities:
        print("Kerentanan ditemukan:")
        print(f"{'IP':<15} {'Port':<5} {'Severity':<10} {'Description'}")
        print("-" * 60)
        for vuln in vulnerabilities:
            print(f"{vuln['ip']:<15} {vuln['port']:<5} {vuln['severity']:<10} {vuln['description']}")
    else:
        print("Tidak ada kerentanan yang ditemukan.")

    return vulnerabilities

# Jalankan scanning
devices = network_scan()
vulnerabilities = check_vulnerabilities(devices)

print("\\nScan selesai pada:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))`;
                break;
            case 'api':
                title.textContent = 'API Integration - Demo Python';
                codeInput.value = `# Contoh integrasi API
import requests
import json

def call_api(url, method='GET', data=None, headers=None):
    """
    Fungsi untuk memanggil API
    """
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            return {"error": "Method tidak valid"}

        # Cek status code
        if response.status_code >= 200 and response.status_code < 300:
            try:
                return response.json()
            except:
                return {"text": response.text, "status_code": response.status_code}
        else:
            return {"error": f"Error {response.status_code}", "details": response.text}

    except Exception as e:
        return {"error": f"Exception: {str(e)}"}

# Contoh penggunaan
print("Contoh Integrasi API")
print("=" * 30)

# Contoh 1: GET request ke API publik
print("\\n1. GET request ke JSONPlaceholder API:")
result = call_api('https://jsonplaceholder.typicode.com/posts/1')
print("Hasil:", json.dumps(result, indent=2))

# Contoh 2: GET request dengan parameter
print("\\n2. GET request dengan parameter:")
result = call_api('https://jsonplaceholder.typicode.com/comments?postId=1')
if 'error' not in result:
    print(f"Jumlah komentar: {len(result)}")
else:
    print("Error:", result['error'])

# Contoh 3: POST request
print("\\n3. POST request:")
data = {
    "title": "Test Title",
    "body": "Test body content",
    "userId": 1
}
result = call_api('https://jsonplaceholder.typicode.com/posts', 'POST', data)
print("Hasil POST:", json.dumps(result, indent=2))

print("\\nDemo integrasi API selesai!")`;
                break;
            default:
                title.textContent = 'Jalankan Kode Python';
                // Kode default sudah di-set di textarea
        }
    });

    // Menjalankan kode Python
    document.getElementById('runButton').addEventListener('click', async function() {
        const code = document.getElementById('codeInput').value;
        const outputElement = document.getElementById('consoleOutput');

        if (!pyodide) {
            outputElement.innerHTML = "Pyodide masih loading, silakan tunggu sebentar...";
            return;
        }

        try {
            // Clear previous output
            outputElement.innerHTML = '<div>Menjalankan kode...</div>';
            
            // Reset stdout and stderr
            pyodide.runPython(`
            sys.stdout = StringIO()
            sys.stderr = StringIO()
            `);

            // Menjalankan kode
            await pyodide.runPythonAsync(code);

            // Mendapatkan output
            const output = pyodide.runPython("sys.stdout.getvalue()");
            const error = pyodide.runPython("sys.stderr.getvalue()");
            
            if (error) {
                outputElement.innerHTML = `<div class="text-danger">${error.replace(/\n/g, '<br>')}</div>`;
            } else {
                outputElement.innerHTML = `<div>${output.replace(/\n/g, '<br>')}</div>`;
            }
        } catch (error) {
            outputElement.innerHTML = `<div class="text-danger">Error: ${error.message}</div>`;
        }
    });
}

// Form kontak
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Terima kasih! Pesan Anda telah dikirim (simulasi).');
        this.reset();
    });
}

// Animasi skill bars saat scroll
function animateSkills() {
    const skillBars = document.querySelectorAll('.progress-bar');
    skillBars.forEach(bar => {
        const rect = bar.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const width = bar.getAttribute('aria-valuenow') || bar.style.width.replace('%', '');
            bar.style.width = width + '%';
        }
    });
}

// Matrix Rain Effect
function createMatrixEffect() {
    const canvas = document.getElementById('matrix');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&!?*';
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for(let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 26, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0'; // Matrix green
        ctx.font = `${fontSize}px monospace`;

        for(let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    setInterval(draw, 33);
}

// Handle window resize
function handleResize() {
    const canvas = document.getElementById('matrix');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
