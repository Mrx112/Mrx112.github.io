const ProjectDemo = (() => {
  let pyodide = null;
  let pyodideReady = false;
  let currentProject = '';

  const projectSamples = {
    network: {
      title: 'Network Admin Tools - Demo Python',
      description: 'Simulasi fungsi network admin untuk ping, port scan, dan pemeriksaan device. Konten ini didasarkan pada proyek Network Admin Tools di portofolio.',
      code: `# Contoh fungsi network scan sederhana
import random

hosts = [
    '192.168.1.1',
    '192.168.1.10',
    '192.168.1.15'
]
ports = [22, 80, 443, 8080]

print('=== SIMULASI NETWORK SCAN ===')
for host in hosts:
    status = random.choice(['active', 'inactive'])
    print(f'Host: {host} - Status: {status}')
    if status == 'active':
        for port in ports:
            port_status = random.choice(['open', 'closed'])
            print(f'  Port {port}: {port_status}')
print('\nDemo Network Admin Tools selesai.')`
    },
    cyberscan: {
      title: 'CyberScan Suite - Demo Python',
      description: 'Simulasi analisis keamanan jaringan dengan laporan port dan kerentanan. Konten ini mengambil inspirasi dari CyberScan Suite di portofolio.',
      code: `# Contoh deteksi kerentanan sederhana
def analyze_device(ip, ports):
    print(f'Device: {ip}')
    vulnerable_ports = [port for port in ports if port in [21, 23, 135, 139, 445]]
    if vulnerable_ports:
        print('  Potensi kerentanan ditemukan pada port:', ', '.join(str(p) for p in vulnerable_ports))
    else:
        print('  Tidak ada port berisiko terdeteksi')

print('=== SIMULASI CYBERSCAN ===')

devices = [
    {'ip': '192.168.1.10', 'ports': [22, 80, 443]},
    {'ip': '192.168.1.15', 'ports': [21, 139, 445]},
    {'ip': '192.168.1.20', 'ports': [80, 8080]}
]

for device in devices:
    analyze_device(device['ip'], device['ports'])
print('\nAnalisis selesai.')`
    },
    api: {
      title: 'API Integration Tool - Demo Python',
      description: 'Contoh penggunaan API sederhana untuk mempersiapkan integrasi RESTful. Dasar ini cocok bagi proyek integrasi API di portofolio.',
      code: `# Contoh pemanggilan API menggunakan modul built-in
import json
from urllib import request

print('=== DEMO API INTEGRATION ===')
url = 'https://api.github.com'
try:
    with request.urlopen(url) as response:
        data = response.read().decode('utf-8')
        parsed = json.loads(data)
        print('GitHub API status:', parsed.get('current_user_url', 'OK'))
except Exception as ex:
    print('Terjadi error saat memanggil API:', ex)
print('\nDemo API Integration selesai.')`
    }
  };

  const githubBase = {
    network: 'https://raw.githubusercontent.com/Mrx112/Network_admin_tools/main/',
    cyberscan: 'https://raw.githubusercontent.com/Mrx112/cyberscan/main/',
    api: 'https://raw.githubusercontent.com/Mrx112/Network_admin_tools/main/'
  };

  const githubFiles = ['main.py', 'app.py', 'network_admin.py', 'cyberscan.py', 'script.py'];

  function getElement(id) {
    return document.getElementById(id);
  }

  function setRunState() {
    const runButton = getElement('runButton');
    if (!runButton) return;
    runButton.disabled = !pyodideReady;
    const consoleOutput = getElement('consoleOutput');
    if (consoleOutput) {
      consoleOutput.innerHTML = pyodideReady ? 'Pyodide siap. Klik Jalankan Kode.' : '<div class="text-warning">Pyodide sedang dimuat…</div>';
    }
  }

  async function initPyodide() {
    try {
      const consoleOutput = getElement('consoleOutput');
      if (consoleOutput) {
        consoleOutput.innerHTML = '<div class="text-warning">Memuat Pyodide, mohon tunggu...</div>';
      }
      pyodide = await loadPyodide();
      pyodideReady = true;
      pyodide.runPython(`import sys\nfrom io import StringIO\nsys.stdout = StringIO()\nsys.stderr = StringIO()`);
      setRunState();
      if (consoleOutput) {
        consoleOutput.innerHTML = '<div class="text-success">Pyodide siap. Pilih demo proyek lalu Jalankan Kode.</div>';
      }
    } catch (error) {
      pyodideReady = false;
      const output = getElement('consoleOutput');
      if (output) {
        output.innerHTML = `<div class="text-danger">Gagal memuat Pyodide: ${error.message}</div>`;
      }
      setRunState();
    }
  }

  function openModal() {
    const modal = getElement('projectDemoModal');
    const backdrop = getElement('projectDemoBackdrop');
    if (!modal || !backdrop) return;
    modal.classList.add('open');
    backdrop.style.opacity = '1';
    backdrop.style.visibility = 'visible';
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    const modal = getElement('projectDemoModal');
    const backdrop = getElement('projectDemoBackdrop');
    if (!modal || !backdrop) return;
    modal.classList.remove('open');
    backdrop.style.opacity = '0';
    backdrop.style.visibility = 'hidden';
    modal.setAttribute('aria-hidden', 'true');
  }

  function updateModalContent(projectKey) {
    const title = getElement('projectDemoDescription');
    const codeInput = getElement('codeInput');
    const modalTitle = document.querySelector('.demo-modal-title');
    const sample = projectSamples[projectKey];
    if (!sample || !codeInput || !modalTitle || !title) return;
    currentProject = projectKey;
    modalTitle.textContent = sample.title;
    title.textContent = sample.description;
    codeInput.value = sample.code;
    setRunState();
  }

  async function runCode() {
    const outputElement = getElement('consoleOutput');
    const codeInput = getElement('codeInput');
    if (!pyodideReady || !outputElement || !codeInput) return;
    outputElement.innerHTML = '<div>Menjalankan kode...</div>';
    try {
      pyodide.runPython(`import sys\nfrom io import StringIO\nsys.stdout = StringIO()\nsys.stderr = StringIO()`);
      await pyodide.runPythonAsync(codeInput.value);
      const output = pyodide.runPython('sys.stdout.getvalue()');
      const error = pyodide.runPython('sys.stderr.getvalue()');
      outputElement.innerHTML = error ? `<div class="text-danger">${error.replace(/\n/g, '<br>')}</div>` : `<div>${output.replace(/\n/g, '<br>')}</div>`;
    } catch (error) {
      outputElement.innerHTML = `<div class="text-danger">Error: ${error.message}</div>`;
    }
  }

  async function loadGithubCode() {
    const outputElement = getElement('consoleOutput');
    const codeInput = getElement('codeInput');
    if (!outputElement || !codeInput || !currentProject) return;
    outputElement.innerHTML = 'Memuat kode dari GitHub...';
    const base = githubBase[currentProject];
    if (!base) {
      outputElement.innerHTML = '<div class="text-warning">Tidak ada repositori GitHub untuk proyek ini.</div>';
      return;
    }
    let loaded = false;
    for (const file of githubFiles) {
      try {
        const response = await fetch(base + file);
        if (response.ok) {
          const code = await response.text();
          codeInput.value = code;
          outputElement.innerHTML = `<div class="text-success">Kode ${file} berhasil dimuat.</div>`;
          loaded = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }
    if (!loaded) {
      outputElement.innerHTML = '<div class="text-warning">Tidak dapat menemukan file Python utama di repositori.</div>';
    }
  }

  function resetCode() {
    if (!currentProject) return;
    updateModalContent(currentProject);
  }

  function copyCode() {
    const codeInput = getElement('codeInput');
    const outputElement = getElement('consoleOutput');
    if (!codeInput || !outputElement) return;
    navigator.clipboard.writeText(codeInput.value)
      .then(() => {
        outputElement.innerHTML = '<div class="text-success">Kode disalin ke clipboard.</div>';
      })
      .catch((err) => {
        outputElement.innerHTML = `<div class="text-danger">Gagal menyalin: ${err.message}</div>`;
      });
  }

  function init() {
    const buttons = document.querySelectorAll('.proj-demo-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        const projectKey = event.currentTarget.getAttribute('data-project');
        updateModalContent(projectKey);
        openModal();
      });
    });

    const closeModalBtn = getElement('closeDemoModal');
    const backdrop = getElement('projectDemoBackdrop');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    const runButton = getElement('runButton');
    if (runButton) runButton.addEventListener('click', runCode);

    const loadFromGithub = getElement('loadFromGithub');
    if (loadFromGithub) loadFromGithub.addEventListener('click', loadGithubCode);

    const resetButton = getElement('resetCode');
    if (resetButton) resetButton.addEventListener('click', resetCode);

    const copyButton = getElement('copyCode');
    if (copyButton) copyButton.addEventListener('click', copyCode);

    setRunState();
    initPyodide();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ProjectDemo.init();
});
