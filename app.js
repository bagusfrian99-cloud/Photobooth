const video = document.getElementById('webcam');
const cameraSelect = document.getElementById('cameraSelect');
const filterSelect = document.getElementById('filterSelect');
const modeSelect = document.getElementById('modeSelect');
const timerSelect = document.getElementById('timerSelect');
const chkMirror = document.getElementById('chkMirror');
const btnCapture = document.getElementById('btnCapture');
const btnDownload = document.getElementById('btnDownload');
const btnRetake = document.getElementById('btnRetake');
const videoContainer = document.getElementById('videoContainer');
const resultContainer = document.getElementById('resultContainer');
const cameraControls = document.getElementById('cameraControls');
const resultControls = document.getElementById('resultControls');
const frameStyleControls = document.getElementById('frameStyleControls');
const countdownOverlay = document.getElementById('countdownOverlay');
const flashOverlay = document.getElementById('flashOverlay');
const statusMsg = document.getElementById('statusMsg');
const resultImage = document.getElementById('resultImage');
const renderCanvas = document.getElementById('renderCanvas');

let currentStream = null;
let isStreaming = false;
let capturedPhotos = [];
let selectedFrameColor = '#ffffff';

function showError(msg) { statusMsg.textContent = msg; statusMsg.className = "status-msg error"; }
function clearError() { statusMsg.textContent = ""; statusMsg.className = "status-msg"; }

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    cameraSelect.innerHTML = '';
    if (videoDevices.length === 0) { showError("Kamera tidak ditemukan."); return; }
    videoDevices.forEach((device, idx) => {
      const opt = document.createElement('option');
      opt.value = device.deviceId;
      opt.textContent = device.label || `Kamera ${idx + 1}`;
      cameraSelect.appendChild(opt);
    });
    cameraSelect.disabled = false;
  } catch (err) { showError("Gagal membaca daftar kamera: " + err.message); }
}

async function startCamera(deviceId = null) {
  stopCamera();
  const constraints = {
    video: deviceId ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
                    : { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: false
  };
  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
    isStreaming = true;
    btnCapture.disabled = false;
    clearError();
    await getCameras();
    if (deviceId) cameraSelect.value = deviceId;
  } catch (err) {
    isStreaming = false;
    btnCapture.disabled = true;
    if (err.name === 'NotAllowedError') showError("Izin kamera ditolak.");
    else showError("Gagal membuka kamera: " + err.message);
  }
}

function stopCamera() {
  if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
  video.srcObject = null;
  isStreaming = false;
  btnCapture.disabled = true;
}

chkMirror.addEventListener('change', () => {
  if (chkMirror.checked) video.classList.add('mirror');
  else video.classList.remove('mirror');
});

filterSelect.addEventListener('change', () => { video.style.filter = filterSelect.value; });

function runCountdown(seconds) {
  return new Promise((resolve) => {
    if (seconds <= 0) return resolve();
    let count = seconds;
    countdownOverlay.style.display = 'flex';
    countdownOverlay.textContent = count;
    const timer = setInterval(() => {
      count--;
      if (count > 0) countdownOverlay.textContent = count;
      else { clearInterval(timer); countdownOverlay.style.display = 'none'; resolve(); }
    }, 1000);
  });
}

function triggerFlash() {
  flashOverlay.classList.add('active');
  setTimeout(() => flashOverlay.classList.remove('active'), 200);
}

function grabFrame() {
  const ctx = renderCanvas.getContext('2d');
  const w = video.videoWidth;
  const h = video.videoHeight;
  renderCanvas.width = w; renderCanvas.height = h;
  ctx.save();
  if (chkMirror.checked) { ctx.translate(w, 0); ctx.scale(-1, 1); }
  if (filterSelect.value !== 'none') ctx.filter = filterSelect.value;
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();
  return renderCanvas.toDataURL('image/png');
}

btnCapture.addEventListener('click', async () => {
  if (!isStreaming) return;
  btnCapture.disabled = true;
  capturedPhotos = [];
  const timerSecs = parseInt(timerSelect.value, 10);
  const mode = modeSelect.value;

  if (mode === 'single') {
    await runCountdown(timerSecs);
    triggerFlash();
    const dataUrl = grabFrame();
    capturedPhotos.push(dataUrl);
    renderSingleResult(dataUrl);
  } else if (mode === 'strip4') {
    for (let i = 1; i <= 4; i++) {
      showError(`Foto ${i} dari 4...`);
      await runCountdown(timerSecs);
      triggerFlash();
      const dataUrl = grabFrame();
      capturedPhotos.push(dataUrl);
      await new Promise(r => setTimeout(r, 600));
    }
    clearError();
    renderStripResult();
  }
  btnCapture.disabled = false;
});

function switchToResultView() {
  videoContainer.style.display = 'none';
  resultContainer.style.display = 'flex';
  cameraControls.style.display = 'none';
  resultControls.style.display = 'flex';
}

function switchToCameraView() {
  resultContainer.style.display = 'none';
  videoContainer.style.display = 'flex';
  resultControls.style.display = 'none';
  cameraControls.style.display = 'flex';
}

function renderSingleResult(dataUrl) {
  frameStyleControls.style.display = 'none';
  resultImage.src = dataUrl;
  switchToResultView();
}

function renderStripResult() {
  frameStyleControls.style.display = 'block';
  const ctx = renderCanvas.getContext('2d');
  const photoW = 600; const photoH = 450;
  const padding = 30; const gap = 20; const footerH = 100;
  const stripW = photoW + (padding * 2);
  const stripH = padding + (photoH * 4) + (gap * 3) + footerH;
  renderCanvas.width = stripW; renderCanvas.height = stripH;
  ctx.fillStyle = selectedFrameColor; ctx.fillRect(0, 0, stripW, stripH);

  let loadedCount = 0;
  capturedPhotos.forEach((src, idx) => {
    const img = new Image();
    img.onload = () => {
      const yPos = padding + idx * (photoH + gap);
      ctx.drawImage(img, padding, yPos, photoW, photoH);
      loadedCount++;
      if (loadedCount === 4) {
        ctx.fillStyle = (selectedFrameColor === '#ffffff' || selectedFrameColor === '#fbcfe8' || selectedFrameColor === '#bae6fd' || selectedFrameColor === '#fef08a') ? '#0f172a' : '#ffffff';
        ctx.font = 'bold 24px system-ui, sans-serif'; ctx.textAlign = 'center';
        const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        ctx.fillText('PHOTOBOOTH v1.0', stripW / 2, stripH - 45);
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(dateStr, stripW / 2, stripH - 22);
        resultImage.src = renderCanvas.toDataURL('image/png');
        switchToResultView();
      }
    };
    img.src = src;
  });
}

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    selectedFrameColor = e.target.getAttribute('data-color');
    if (capturedPhotos.length === 4) renderStripResult();
  });
});

btnDownload.addEventListener('click', () => {
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  link.download = `photobooth-v1.0-${timestamp}.png`;
  link.href = resultImage.src;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

btnRetake.addEventListener('click', switchToCameraView);
cameraSelect.addEventListener('change', () => { if (isStreaming) startCamera(cameraSelect.value); });
startCamera();
