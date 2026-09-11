(() => {
  const TOTAL_TARGETS = 20;

  const startScreen = document.getElementById("start-screen");
  const startButton = document.getElementById("start-button");
  const statusText = document.getElementById("status-text");
  const replayButton = document.getElementById("replay-button");
  const scene = document.querySelector("a-scene");

  let currentAudio = null;
  let currentTarget = null;
  let arStarted = false;

  // MP3 files are stored directly in the repository root.
  const audioFiles = Array.from(
    { length: TOTAL_TARGETS },
    (_, i) =>
      `KBARA_AUDIO_${String(i + 1).padStart(2, "0")}.mp3`
  );

  // Prepare all 20 audio files.
  const audios = audioFiles.map((src) => {
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
  });

  function setStatus(message) {
    if (statusText) {
      statusText.textContent = message;
    }
  }

  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = null;
  }

  async function playTargetAudio(index) {
    if (index < 0 || index >= TOTAL_TARGETS) {
      return;
    }

    stopCurrentAudio();

    currentTarget = index;
    currentAudio = audios[index];
    currentAudio.currentTime = 0;

    setStatus(
      `Gambar K-BaRa ${String(index + 1).padStart(2, "0")} dikesan. Audio sedang dimainkan.`
    );

    try {
      await currentAudio.play();
    } catch (error) {
      console.error("Audio playback failed:", error);

      setStatus(
        "Gambar dikesan. Tekan ULANG AUDIO untuk memainkan audio."
      );
    }
  }

  function attachTargetEvents() {
    for (let i = 0; i < TOTAL_TARGETS; i++) {

      const target = document.querySelector(
        `[mindar-image-target="targetIndex: ${i}"]`
      );

      if (!target) {
        console.warn(`Target entity ${i} not found.`);
        continue;
      }

      target.addEventListener("targetFound", () => {
        playTargetAudio(i);
      });

      target.addEventListener("targetLost", () => {

        if (currentTarget === i) {
          stopCurrentAudio();
          currentTarget = null;

          setStatus(
            "Halakan kamera pada gambar K-BaRa."
          );
        }
      });
    }
  }

  async function startAR() {

    if (arStarted) {
      return;
    }

    arStarted = true;

    /*
      Unlock audio playback.
      Mobile browsers normally require the pupil
      to tap something before audio can play.
      The MULA AR button provides that interaction.
    */

    try {

      const unlock = audios[0];

      unlock.muted = true;

      await unlock.play();

      unlock.pause();
      unlock.currentTime = 0;
      unlock.muted = false;

    } catch (error) {
      console.log("Audio unlock:", error);
    }

    if (startScreen) {
      startScreen.style.display = "none";
    }

    setStatus("Memulakan kamera...");

    try {

      const mindarSystem =
        scene.systems["mindar-image-system"];

      if (
        mindarSystem &&
        typeof mindarSystem.start === "function"
      ) {
        await mindarSystem.start();
      }

      setStatus(
        "Halakan kamera pada gambar K-BaRa."
      );

    } catch (error) {

      console.error(
        "Unable to start AR:",
        error
      );

      arStarted = false;

      if (startScreen) {
        startScreen.style.display = "";
      }

      setStatus(
        "Kamera tidak dapat dimulakan. Benarkan akses kamera dan cuba lagi."
      );
    }
  }

  if (startButton) {
    startButton.addEventListener(
      "click",
      startAR
    );
  }

  if (replayButton) {

    replayButton.addEventListener(
      "click",
      () => {

        if (currentTarget !== null) {

          playTargetAudio(
            currentTarget
          );

        } else {

          setStatus(
            "Halakan kamera pada gambar K-BaRa terlebih dahulu."
          );
        }
      }
    );
  }

  if (scene.hasLoaded) {

    attachTargetEvents();

  } else {

    scene.addEventListener(
      "loaded",
      attachTargetEvents,
      { once: true }
    );
  }
})();
