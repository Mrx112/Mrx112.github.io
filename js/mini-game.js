/* MINI GAME — TERMINAL BREACH CHALLENGE */
(function(){
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  /* ---------- GAME STATE ---------- */
  const state = {
    step: 0, // 0=start, 1=scanned, 2=connected, 3=won
    progress: 0
  };

  const steps = [
    {
      id: 'scan',
      help: 'Ketik <b class="cmd-text">scan</b> untuk memindai port yang terbuka.',
      success: () => ({
        lines: [
          { type:'out', text:'> Inisialisasi network scanner...' },
          { type:'info', text:'Memindai subnet 10.10.10.0/24 ...' },
          { type:'ok', text:'PORT 80/tcp   open  http     Apache 2.4' },
          { type:'ok', text:'PORT 2222/tcp open  ssh      OpenSSH 8.9' },
          { type:'warn', text:'PORT 4444/tcp filtered  backdoor-filtered' },
          { type:'out', text:'Scan selesai. 1 port terbuka, 1 port tersaring.' },
          { type:'info', text:'Petunjuk: port 2222 terlihat tidak biasa untuk SSH...' }
        ],
        next: 1
      })
    },
    {
      id: 'connect',
      help: 'Ketik <b class="cmd-text">connect 2222</b> untuk mencoba terhubung ke port tersebut.',
      success: () => ({
        lines: [
          { type:'out', text:'> Menghubungkan ke 10.10.10.5:2222 ...' },
          { type:'ok', text:'Koneksi berhasil! Terautentikasi sebagai guest.' },
          { type:'warn', text:'Akses terbatas. Cari file flag.txt di direktori saat ini.' },
          { type:'info', text:'Petunjuk: gunakan perintah baca file standar...' }
        ],
        next: 2
      })
    },
    {
      id: 'flag',
      help: 'Ketik <b class="cmd-text">cat flag.txt</b> untuk membaca file flag.',
      success: () => ({
        lines: [
          { type:'out', text:'> Membaca /home/guest/flag.txt ...' },
          { type:'flag', text:'\n╔══════════════════════════════════════╗' },
          { type:'flag', text:'║  FLAG{br34ch_4uth_2026_success}  ║' },
          { type:'flag', text:'╚══════════════════════════════════════╝\n' },
          { type:'ok', text:'Selamat! Anda berhasil membobol sistem.' },
          { type:'info', text:'Ingin tantangan lain? Tutup game dan lihat portofolio.' }
        ],
        next: 3
      })
    }
  ];

  /* ---------- DOM ---------- */
  const backdrop = document.getElementById('gameBackdrop');
  const modal = document.getElementById('gameModal');
  const body = document.getElementById('gameBody');
  const input = document.getElementById('gameInput');
  const closeBtn = document.getElementById('gameClose');
  const progressBar = document.getElementById('gameProgressBar');
  const scoreEl = document.getElementById('gameScore');

  function open(){
    backdrop.classList.add('open');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    input.value = '';
    input.focus();
    if(state.step === 0 && body.innerHTML === ''){
      printLine({ type:'info', text:'\n\n>> Mini CTF Challenge: Terminal Breach <<' });
      printLine({ type:'info', text:'Tugas: bobol sistem dengan mengetik perintah yang benar.' });
      printLine({ type:'info', text:'Ketik <b class="cmd-text">help</b> untuk melihat perintah yang tersedia.\n' });
    }
  }

  function close(){
    backdrop.classList.remove('open');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  function reset(){
    state.step = 0;
    state.progress = 0;
    state.closed = false;
    updateProgress();
    body.innerHTML = '';
  }

  function updateProgress(){
    const pct = Math.min(100, Math.round((state.step / steps.length) * 100));
    progressBar.style.width = pct + '%';
    scoreEl.textContent = 'PROGRESS: ' + state.step + ' / ' + steps.length;
  }

  function printLine(line){
    const div = document.createElement('div');
    div.className = 'game-line';
    let html = '';
    if(line.type === 'prompt'){
      html = '<span class="prompt">guest@portfolio:~$</span> <span class="cmd">' + escapeHtml(line.text) + '</span>';
    } else if(line.type === 'out'){
      html = '<span class="out">' + line.text + '</span>';
    } else if(line.type === 'ok'){
      html = '<span class="ok">' + line.text + '</span>';
    } else if(line.type === 'err'){
      html = '<span class="err">' + line.text + '</span>';
    } else if(line.type === 'warn'){
      html = '<span class="warn">' + line.text + '</span>';
    } else if(line.type === 'info'){
      html = '<span class="info">' + line.text + '</span>';
    } else if(line.type === 'flag'){
      html = '<span class="flag">' + line.text + '</span>';
      div.classList.add('flag-line');
    }
    div.innerHTML = html;
    body.appendChild(div);
    if(!reduce){
      requestAnimationFrame(() => {
        div.classList.add('show');
        body.scrollTop = body.scrollHeight;
      });
    } else {
      div.classList.add('show');
    }
    return div;
  }

  function typePrompt(cmd){
    const div = document.createElement('div');
    div.className = 'game-line show';
    div.innerHTML = '<span class="prompt">guest@portfolio:~$</span> <span class="cmd">' + escapeHtml(cmd) + '</span>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(str){
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ---------- GAME LOGIC ---------- */
  function handleCommand(cmdRaw){
    const cmd = cmdRaw.trim().toLowerCase();
    const parts = cmd.split(/\s+/);
    const base = parts[0];
    const arg = parts[1] || '';

    typePrompt(cmdRaw.trim());

    if(state.step >= steps.length){
      printLine({ type:'info', text:'\n[Game selesai] Ketik reset untuk main lagi, atau close untuk keluar.' });
      return;
    }

    const current = steps[state.step];

    if(cmd === 'help'){
      printLine({ type:'info', text:'\nPerintah yang tersedia:' });
      printLine({ type:'out', text:'  scan            — Pindai port yang terbuka di target.' });
      printLine({ type:'out', text:'  connect [port]  — Hubungkan ke port tertentu.' });
      printLine({ type:'out', text:'  cat [file]      — Baca isi file di sistem.' });
      printLine({ type:'out', text:'  clear           — Bersihkan layar terminal.' });
      printLine({ type:'out', text:'  reset           — Reset tantangan dari awal.' });
      printLine({ type:'out', text:'  close / exit    — Keluar dari mini game.\n' });
      return;
    }

    if(cmd === 'clear'){
      body.innerHTML = '';
      return;
    }

    if(cmd === 'reset'){
      reset();
      printLine({ type:'info', text:'\n[Tantangan direset] Ketik help untuk mulai lagi.\n' });
      return;
    }

    if(cmd === 'close' || cmd === 'exit'){
      close();
      return;
    }

    if(current.id === 'scan'){
      if(base === 'scan'){
        const result = current.success();
        result.lines.forEach((line, i) => {
          setTimeout(() => printLine(line), i * 180);
        });
        setTimeout(() => {
          state.step = result.next;
          updateProgress();
        }, result.lines.length * 180 + 100);
      } else if(base === 'connect'){
        printLine({ type:'err', text:'\nError: kamu belum memindai port. Ketik scan terlebih dahulu.\n' });
      } else if(base === 'cat'){
        printLine({ type:'err', text:'\nError: kamu belum terhubung ke sistem. Tidak ada akses file.\n' });
      } else {
        printLine({ type:'err', text:'\nPerintah tidak dikenali. Ketik help untuk melihat perintah.\n' });
      }
      return;
    }

    if(current.id === 'connect'){
      if(base === 'connect'){
        if(arg === '2222'){
          const result = current.success();
          result.lines.forEach((line, i) => {
            setTimeout(() => printLine(line), i * 180);
          });
          setTimeout(() => {
            state.step = result.next;
            updateProgress();
          }, result.lines.length * 180 + 100);
        } else {
          printLine({ type:'err', text:'\nKoneksi ditolak. Port ' + (arg || 'tidak disebut') + ' tidak membuka akses.\n' });
        }
      } else if(base === 'scan'){
        printLine({ type:'warn', text:'\nScan sudah dilakukan. Lihat hasil sebelumnya di atas.\n' });
      } else if(base === 'cat'){
        printLine({ type:'err', text:'\nError: kamu belum terhubung ke sistem. Tidak ada akses file.\n' });
      } else {
        printLine({ type:'err', text:'\nPerintah tidak dikenali. Ketik help untuk melihat perintah.\n' });
      }
      return;
    }

    if(current.id === 'flag'){
      if(base === 'cat'){
        if(arg === 'flag.txt'){
          const result = current.success();
          result.lines.forEach((line, i) => {
            setTimeout(() => printLine(line), i * 220);
          });
          setTimeout(() => {
            state.step = result.next;
            updateProgress();
            if(hasGsap && !reduce){
              gsap.to(progressBar, { width:'100%', duration:.6, ease:'power2.out' });
            }
          }, result.lines.length * 220 + 100);
        } else {
          printLine({ type:'err', text:'\nFile tidak ditemukan: ' + (arg || '(tidak disebut)') + '\n' });
        }
      } else {
        printLine({ type:'err', text:'\nKamu sudah terhubung. Cari file flag.txt dengan perintah cat.\n' });
      }
      return;
    }
  }

  /* ---------- EVENTS ---------- */
  function init(){
    // Open from hero terminal
    const termWindow = document.getElementById('termWindow');
    if(termWindow){
      termWindow.addEventListener('click', open);
      termWindow.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); }
      });
    }

    // Close handlers
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && modal.classList.contains('open')) close();
    });

    // Input handler
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter'){
        const val = input.value.trim();
        if(val){
          input.value = '';
          handleCommand(val);
        }
      }
    });
  }

  window.MiniGame = { init, open, close };
})();
