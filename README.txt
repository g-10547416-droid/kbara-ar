K-BaRa WebAR Audio
==================

Kandungan:
- index.html              Laman utama WebAR
- style.css               Reka bentuk antaramuka
- app.js                  Logik AR + pemetaan 20 audio
- targets.mind            Pangkalan data 20 trigger MindAR
- audio/                  20 fail MP3 K-BaRa

Pemetaan:
Target 0  -> KBARA_AUDIO_01.mp3
Target 1  -> KBARA_AUDIO_02.mp3
...
Target 19 -> KBARA_AUDIO_20.mp3

Cara guna:
1. Hos keseluruhan folder ini pada laman HTTPS (contoh: GitHub Pages, Netlify atau hosting sekolah).
2. Buka URL pada telefon.
3. Tekan MULA AR.
4. Benarkan akses kamera.
5. Halakan kamera pada salah satu daripada 20 trigger K-BaRa.
6. Audio yang sepadan akan dimainkan.

Nota penting:
- Jangan ubah urutan/targets.mind melainkan trigger dikompil semula.
- Jika targets.mind dikompil semula dengan urutan lain, pemetaan targetIndex dalam index.html mesti diselaraskan.
- Audio kini diletakkan bersama laman WebAR supaya playback lebih stabil berbanding pautan preview Google Drive.
- Simpan salinan induk MP3 anda di Google Drive seperti sedia ada.
- Kamera web pada telefon biasanya memerlukan HTTPS (atau localhost untuk ujian pembangunan).
