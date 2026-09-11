(() => {
  const TOTAL_TARGETS = 20;
  const scene = document.querySelector('#ar-scene');
  const startBtn = document.querySelector('#start-btn');
  const startScreen = document.querySelector('#start-screen');
  const topStatus = document.querySelector('#top-status');
  const statusPill = document.querySelector('#status-pill');
  const scanGuide = document.querySelector('#scan-guide');
  const audioPanel = document.querySelector('#audio-panel');
  const audioTitle = document.querySelector('#audio-title');
  const audioState = document.querySelector('#audio-state');
  const replayBtn = document.querySelector('#replay-btn');

  let arSystem = null;
  let audioContext = null;
  let currentSource = null;
  let currentIndex = null;
  let activeTarget = null;
  const audioBuffers = new Map();
  const loadingBuffers = new Map();

  const audioUrl = (index) => `./audio/KBARA_AUDIO_${String(index + 1).padStart(2, '0')}.mp3`;
  const displayNumber = (index) => String(index + 1).padStart(2, '0');

  scene.addEventListener('loaded', () => {
    arSystem = scene.systems['mindar-image-system'];
  });

  scene.addEventListener('arReady', () => {
    statusPill.textContent = 'AR sedia';
    scanGuide.classList.remove('hidden');
    window.setTimeout(() => {
      if (activeTarget === null) statusPill.textContent = 'Cari gambar K-BaRa';
    }, 1000);
  });

  scene.addEventListener('arError', () => {
    statusPill.textContent = 'Kamera tidak dapat dimulakan';
    alert('AR tidak dapat dimulakan. Pastikan kamera dibenarkan dan laman dibuka melalui HTTPS.');
  });

  async function ensureAudioContext() {
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('Web Audio API tidak disokong.');
      audioContext = new AC();
    }
    if (audioContext.state === 'suspended') await audioContext.resume();
  }

  async function getBuffer(index) {
    if (audioBuffers.has(index)) return audioBuffers.get(index);
    if (loadingBuffers.has(index)) return loadingBuffers.get(index);

    const promise = fetch(audioUrl(index), { cache: 'force-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`Audio ${displayNumber(index)} gagal dimuatkan (${r.status})`);
        return r.arrayBuffer();
      })
      .then((data) => audioContext.decodeAudioData(data.slice(0)))
      .then((buffer) => {
        audioBuffers.set(index, buffer);
        loadingBuffers.delete(index);
        return buffer;
      })
      .catch((err) => {
        loadingBuffers.delete(index);
        throw err;
      });

    loadingBuffers.set(index, promise);
    return promise;
  }

  function stopAudio() {
    if (currentSource) {
      try { currentSource.stop(); } catch (_) {}
      currentSource.disconnect();
      currentSource = null;
    }
  }

  async function playAudio(index, restart = true) {
    currentIndex = index;
    audioTitle.textContent = `K-BaRa Audio ${displayNumber(index)}`;
    audioState.textContent = 'Memuatkan audio…';
    audioPanel.classList.remove('hidden');

    try {
      await ensureAudioContext();
      const buffer = await getBuffer(index);
      if (currentIndex !== index) return;
      if (restart) stopAudio();

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        if (currentSource === source) {
          currentSource = null;
          audioState.textContent = 'Audio selesai — tekan Ulang untuk dengar semula';
        }
      };
      currentSource = source;
      source.start(0);
      audioState.textContent = 'Sedang dimainkan';
    } catch (err) {
      console.error(err);
      audioState.textContent = 'Audio gagal dimainkan';
    }
  }

  document.querySelectorAll('.kb-target').forEach((el) => {
    const index = Number(el.dataset.index);

    el.addEventListener('targetFound', () => {
      activeTarget = index;
      scanGuide.classList.add('hidden');
      statusPill.textContent = `Gambar ${displayNumber(index)} dikesan`;
      playAudio(index, true);
    });

    el.addEventListener('targetLost', () => {
      if (activeTarget !== index) return;
      activeTarget = null;
      statusPill.textContent = 'Cari gambar K-BaRa';
      scanGuide.classList.remove('hidden');
      // Audio terus dimainkan walaupun kamera bergerak sedikit.
      // Jika mahu audio berhenti apabila imej hilang, nyahkomen baris berikut:
      // stopAudio();
    });
  });

  replayBtn.addEventListener('click', async () => {
    if (currentIndex === null) return;
    await ensureAudioContext();
    playAudio(currentIndex, true);
  });

  startBtn.addEventListener('click', async () => {
    try {
      await ensureAudioContext();
      startBtn.disabled = true;
      startBtn.textContent = 'MEMULAKAN…';
      topStatus.classList.remove('hidden');
      statusPill.textContent = 'Meminta akses kamera…';

      if (!arSystem) {
        await new Promise((resolve) => scene.addEventListener('loaded', resolve, { once: true }));
        arSystem = scene.systems['mindar-image-system'];
      }

      await arSystem.start();
      startScreen.classList.add('hidden');

      // Mulakan cache beberapa audio pertama tanpa melambatkan kamera.
      [0,1,2].forEach((i) => getBuffer(i).catch(() => {}));
    } catch (err) {
      console.error(err);
      startBtn.disabled = false;
      startBtn.textContent = 'CUBA LAGI';
      statusPill.textContent = 'Gagal memulakan AR';
      alert('Tidak dapat memulakan AR. Pastikan akses kamera dibenarkan dan laman menggunakan HTTPS.');
    }
  });
})();
