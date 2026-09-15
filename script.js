document.addEventListener('DOMContentLoaded', () => {
  // Web Audio API Techno Synthesizer for 2005 MySpace Music Player
  let audioCtx = null;
  let isPlaying = false;
  let currentTrack = 'techno1';
  let timerId = null;
  let step = 0;
  let volumeNode = null;
  let masterVolume = 0.7;

  // DOM Elements - Audio Player
  const btnPlay = document.getElementById('btn-play');
  const btnPause = document.getElementById('btn-pause');
  const btnStop = document.getElementById('btn-stop');
  const eqBars = document.getElementById('eq-bars');
  const timeDisplay = document.getElementById('time-display');
  const trackTitle = document.getElementById('current-track-title');
  const volSlider = document.getElementById('vol-slider');
  const playlistItems = document.querySelectorAll('.playlist-item');

  // DOM Elements - Comment Section
  const commentAuthorInput = document.getElementById('comment-author-input');
  const commentTextInput = document.getElementById('comment-text-input');
  const submitCommentBtn = document.getElementById('submit-comment-btn');
  const commentsList = document.getElementById('comments-list');
  const commentsNum = document.getElementById('comments-num');

  // DOM Elements - Interactive Order Glass Window Widget
  const openOrderBtn = document.getElementById('open-order-btn');
  const closeOrderBtn = document.getElementById('close-order-btn');
  const quickOrderBtn = document.getElementById('quick-order-btn');
  const navOrderLink = document.getElementById('nav-order-link');
  const orderModalOverlay = document.getElementById('order-modal-overlay');

  const glassTypeSelect = document.getElementById('glass-type');
  const glassQtySlider = document.getElementById('glass-quantity');
  const qtyValDisplay = document.getElementById('qty-val');
  const deliveryDropSelect = document.getElementById('delivery-drop');
  const buyerHandleInput = document.getElementById('buyer-handle');
  const subtotalDisplay = document.getElementById('subtotal-price');
  const totalDisplay = document.getElementById('total-price');
  const placeOrderBtn = document.getElementById('place-order-btn');

  const orderFormCard = document.querySelector('.order-grid');
  const orderSuccessCard = document.getElementById('order-success');
  const successMessage = document.getElementById('success-message');
  const resetOrderBtn = document.getElementById('reset-order-btn');

  // Floating Particles Creation
  function createCrystalParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${6 + Math.random() * 6}s`;
      particle.style.width = `${4 + Math.random() * 6}px`;
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  }
  createCrystalParticles();

  // Order Window / Modal Handlers
  function openOrderModal() {
    orderModalOverlay.classList.remove('hidden');
  }

  function closeOrderModal() {
    orderModalOverlay.classList.add('hidden');
  }

  if (openOrderBtn) openOrderBtn.addEventListener('click', openOrderModal);
  if (quickOrderBtn) quickOrderBtn.addEventListener('click', openOrderModal);
  if (navOrderLink) navOrderLink.addEventListener('click', (e) => { e.preventDefault(); openOrderModal(); });
  if (closeOrderBtn) closeOrderBtn.addEventListener('click', closeOrderModal);

  // Close modal when clicking overlay background
  orderModalOverlay.addEventListener('click', (e) => {
    if (e.target === orderModalOverlay) {
      closeOrderModal();
    }
  });

  // Calculate Price in Glass Window Widget
  function updateOrderPrice() {
    if (!glassTypeSelect || !glassQtySlider) return;
    const selectedOption = glassTypeSelect.options[glassTypeSelect.selectedIndex];
    const pricePerOz = parseInt(selectedOption.getAttribute('data-price') || 2000, 10);
    const qtyOz = parseInt(glassQtySlider.value, 10);

    qtyValDisplay.textContent = `${qtyOz} oz`;
    const total = pricePerOz * qtyOz;
    const formattedTotal = `$${total.toLocaleString()}`;

    subtotalDisplay.textContent = formattedTotal;
    totalDisplay.textContent = formattedTotal;
  }

  if (glassTypeSelect) glassTypeSelect.addEventListener('change', updateOrderPrice);
  if (glassQtySlider) glassQtySlider.addEventListener('input', updateOrderPrice);

  // Handle Place Order
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      const buyer = buyerHandleInput.value.trim() || 'Anonymous ABQ Buyer';
      const qtyOz = glassQtySlider.value;
      const productText = glassTypeSelect.options[glassTypeSelect.selectedIndex].text.split('-')[0].trim();
      const dropLocationText = deliveryDropSelect.options[deliveryDropSelect.selectedIndex].text;
      const totalCost = totalDisplay.textContent;

      // Play chime/kick sound if audio context available
      if (audioCtx) {
        initAudio();
        playKick(audioCtx.currentTime);
      }

      // Show success screen
      successMessage.innerHTML = `Yo <strong>${escapeHTML(buyer)}</strong>! Your order for <strong>${qtyOz} oz</strong> of <strong>${escapeHTML(productText)}</strong> (${totalCost}) has been placed!<br><br>Dropoff set for: <em>${escapeHTML(dropLocationText)}</em>.<br>Skinny Pete & Badger are en route. Cash on delivery only yo! 💵⚡`;

      orderFormCard.classList.add('hidden');
      orderSuccessCard.classList.remove('hidden');
    });
  }

  // Reset Order Form
  if (resetOrderBtn) {
    resetOrderBtn.addEventListener('click', () => {
      orderSuccessCard.classList.add('hidden');
      orderFormCard.classList.remove('hidden');
      buyerHandleInput.value = '';
      glassQtySlider.value = 2;
      updateOrderPrice();
    });
  }

  // Initialize Web Audio API context
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      volumeNode = audioCtx.createGain();
      volumeNode.gain.value = masterVolume;
      volumeNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play Kick Drum Sound
  function playKick(time) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.2);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    osc.connect(gain);
    gain.connect(volumeNode);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  // Play Synth Bass Note
  function playBass(time, freq) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.connect(gain);
    gain.connect(volumeNode);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  // Play Hi-Hat
  function playHat(time) {
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.05;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(volumeNode);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.05);
  }

  // Step Sequencer Loop (135 BPM 2005 Rave Beat)
  function audioLoop() {
    if (!isPlaying) return;
    const now = audioCtx.currentTime;

    // Kick on 0, 4, 8, 12 (4/4 beat)
    if (step % 4 === 0) {
      playKick(now);
    }

    // Hi-hats on off-beats
    if (step % 2 === 1) {
      playHat(now);
    }

    // Bassline synth frequencies
    const bassNotes1 = [110, 110, 130.81, 110, 146.83, 110, 130.81, 98.00];
    const bassNotes2 = [87.31, 87.31, 98.00, 110, 130.81, 146.83, 130.81, 110];
    const notes = (currentTrack === 'techno2') ? bassNotes2 : bassNotes1;

    const noteFreq = notes[step % notes.length];
    playBass(now, noteFreq);

    // Update Step
    step = (step + 1) % 16;

    // Update timer display
    const totalSecs = Math.floor(now) % 165;
    const mins = Math.floor(totalSecs / 60);
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    if (timeDisplay) timeDisplay.textContent = `${mins}:${secs} / 2:45`;

    timerId = setTimeout(audioLoop, 110); // ~135 BPM
  }

  // Play Button Handler
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      initAudio();
      if (!isPlaying) {
        isPlaying = true;
        eqBars.classList.add('playing');
        audioLoop();
      }
    });
  }

  // Pause Button Handler
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      isPlaying = false;
      eqBars.classList.remove('playing');
      if (timerId) clearTimeout(timerId);
    });
  }

  // Stop Button Handler
  if (btnStop) {
    btnStop.addEventListener('click', () => {
      isPlaying = false;
      eqBars.classList.remove('playing');
      if (timerId) clearTimeout(timerId);
      step = 0;
      if (timeDisplay) timeDisplay.textContent = '0:00 / 2:45';
    });
  }

  // Volume Slider Handler
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      masterVolume = parseFloat(e.target.value);
      if (volumeNode) {
        volumeNode.gain.value = masterVolume;
      }
    });
  }

  // Playlist Items Click Handler
  playlistItems.forEach((item) => {
    item.addEventListener('click', () => {
      playlistItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentTrack = item.getAttribute('data-src');

      const titles = {
        'techno1': '▶ NOW PLAYING: TwaüghtHammër - Fallacies (Techno Dub Remix 2005)',
        'techno2': '▶ NOW PLAYING: Cap\'n Cook - Chili P Beat Drop (Hard Rave Mix)',
        'techno3': '▶ NOW PLAYING: Albuquerque Underground - Sci-Fi Bass Drop 2005'
      };
      if (trackTitle) trackTitle.textContent = titles[currentTrack] || '▶ NOW PLAYING: Jesse Pinkman - Techno Rave';

      if (isPlaying) {
        step = 0;
      }
    });
  });

  // Comment Posting Handler
  if (submitCommentBtn) {
    submitCommentBtn.addEventListener('click', () => {
      const author = commentAuthorInput.value.trim();
      const text = commentTextInput.value.trim();

      if (!author || !text) {
        alert('Yo bitch! Enter your handle and comment text first!');
        return;
      }

      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      // Create new comment element
      const newComment = document.createElement('div');
      newComment.className = 'comment-item';
      newComment.innerHTML = `
        <div class="comment-author">
          <a href="#">${escapeHTML(author)}</a>
          <img src="images/jesse2.jpg" alt="Avatar">
          <span class="comment-date">${dateStr}</span>
        </div>
        <div class="comment-body">
          <p>${escapeHTML(text)}</p>
        </div>
      `;

      // Prepend to comment list
      commentsList.insertBefore(newComment, commentsList.firstChild);

      // Update count
      const currentNum = parseInt(commentsNum.textContent, 10) || 4;
      commentsNum.textContent = currentNum + 1;

      // Reset inputs
      commentAuthorInput.value = '';
      commentTextInput.value = '';

      alert('Comment posted to gimmethatblueshi\'s page! Church!');
    });
  }

  // Utility to escape HTML
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
