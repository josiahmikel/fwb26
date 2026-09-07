/* ============================================================
   RADIO.JS - Main radio player logic
   ============================================================ */

export function initRadio() {
    // ----- PLAYLIST -----
    const PLAYLIST = [
        '/assets/h3g45d5f4g/118-creaturethief.mp3',
        '/assets/h3g45d5f4g/1214-creaturethief.mp3',
        '/assets/h3g45d5f4g/148-creaturethief.mp3',
        '/assets/h3g45d5f4g/DAMN-april_fridae.mp3',
        '/assets/h3g45d5f4g/GNL-patricio_portales.mp3',
        '/assets/h3g45d5f4g/always-quas.mp3',
        '/assets/h3g45d5f4g/b_side-fridae_thief.mp3',
        '/assets/h3g45d5f4g/backtrack-fridae_thief.mp3',
        '/assets/h3g45d5f4g/bizzare-fridae_thief.mp3',
        '/assets/h3g45d5f4g/braziw-april_fridae.mp3',
        '/assets/h3g45d5f4g/clocks_cut_out_or_switch-luvly.mp3',
        '/assets/h3g45d5f4g/down_and_loading-luvly.mp3',
        '/assets/h3g45d5f4g/eurovision-creaturethief.mp3',
        '/assets/h3g45d5f4g/follow-creaturethief.mp3',
        '/assets/h3g45d5f4g/fortune_cookie-fridae_thief.mp3',
        '/assets/h3g45d5f4g/gfdgdfgdfgfdfgd-april_fridae.mp3',
        '/assets/h3g45d5f4g/good4-luvly.mp3',
        '/assets/h3g45d5f4g/inagaki-milk.mp3',
        '/assets/h3g45d5f4g/lingering_w:_sana-luvly.mp3',
        '/assets/h3g45d5f4g/memory-creaturethief.mp3',
        '/assets/h3g45d5f4g/redi-creaturethief.mp3',
        '/assets/h3g45d5f4g/reef-milk.mp3',
        '/assets/h3g45d5f4g/sep4-creaturethief.mp3',
        '/assets/h3g45d5f4g/tube-creaturethief.mp3',
        '/assets/h3g45d5f4g/walle-fridae_thief.mp3'
    ];

    // ----- TRACK DURATIONS -----
    const TRACK_DURATIONS = {
        '118-creaturethief.mp3': 65.149400,
        '1214-creaturethief.mp3': 42.666667,
        '148-creaturethief.mp3': 81.136300,
        'DAMN-april_fridae.mp3': 119.142857,
        'GNL-patricio_portales.mp3': 46.672109,
        'always-quas.mp3': 109.766525,
        'b_side-fridae:thief.mp3': 50.535011,
        'backtrack-fridae:thief.mp3': 115.282404,
        'bizzare-fridae:thief.mp3': 17.777800,
        'braziw-april_fridae.mp3': 154.221156,
        'clocks_cut_out_or_switch-luvly.mp3': 163.176000,
        'down_and_loading-luvly.mp3': 63.048000,
        'eurovision-creaturethief.mp3': 169.613050,
        'follow-creaturethief.mp3': 30.511000,
        'fortune_cookie-fridae:thief.mp3': 147.296871,
        'gfdgdfgdfgfdfgd-april_fridae.mp3': 29.769229,
        'good4-luvly.mp3': 61.080000,
        'inagaki-milk.mp3': 69.224458,
        'lingering_w:_sana-luvly.mp3': 76.617125,
        'memory-creaturethief.mp3': 151.764172,
        'redi-creaturethief.mp3': 75.702850,
        'reef-milk.mp3': 46.497950,
        'sep4-creaturethief.mp3': 59.402425,
        'tube-creaturethief.mp3': 47.264218,
        'walle-fridae:thief.mp3': 84.857143
    };

    // ----- ARTIST LINKS -----
    const ARTIST_LINKS = {
        'creaturethief': 'https://www.instagram.com/creaturethief',
        'april fridae': 'https://www.instagram.com/aprilfridae',
        'eliesriot': 'https://www.instagram.com/eliesriot',
        'zayok': 'https://www.instagram.com/zayoklove'
    };

    // ----- DOM ELEMENTS -----
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const nowPlayingEl = document.getElementById('nowPlaying');
    const playerHeader = document.getElementById('playerHeader');

    if (!playBtn || !playIcon || !nowPlayingEl || !playerHeader) {
        console.warn('Radio elements not found on this page');
        return;
    }

    // ----- STATE -----
    let isPlaying = false;
    let isInitialized = false;
    let radioStarted = false;
    let audioContext = null;
    let compressorNode = null;
    let masterGainNode = null;
    let audioProcessingSetup = false;
    const players = [new Audio(), new Audio()];
    let sources = [];
    let gains = [];
    let activePlayerIndex = 0;
    let currentTrackIndex = -1;
    let nextTrackIndex = -1;
    let isCrossfading = false;
    let crossfadeTimeout = null;
    let crossfadePrepared = false;

    // ----- HELPERS -----
    function getArtistLink(artistName) {
        const key = artistName.toLowerCase().trim();
        return ARTIST_LINKS[key] || null;
    }

    function parseTrackInfo(filename) {
        const name = filename.replace(/\.[^.]+$/, '');
        const parts = name.split('-');
        let song = name;
        let artist = '';
        if (parts.length >= 2) {
            song = parts.slice(0, parts.length - 1).join('-');
            artist = parts[parts.length - 1];
        }
        song = song.replace(/_/g, ' ');
        artist = artist.replace(/_/g, ' ');
        artist = artist.replace(/:/g, ' / ');
        return { song: song.trim(), artist: artist.trim() };
    }

    function getDisplayName(trackIndex) {
        if (trackIndex < 0 || trackIndex >= shuffledPlaylist.length) return null;
        const filename = shuffledPlaylist[trackIndex].split('/').pop();
        return parseTrackInfo(filename);
    }

    function updateNowPlaying() {
        const info = getDisplayName(currentTrackIndex);
        const el = document.getElementById('nowPlaying');
        if (!info) {
            el.innerHTML = `<span class="status-msg">Track unavailable</span>`;
            return;
        }
        const artistLink = getArtistLink(info.artist);
        const artistHtml = artistLink ?
            `<a href="${artistLink}" target="_blank">${info.artist}</a>` :
            info.artist;
        if (info.artist) {
            el.innerHTML =
                `<span class="song-title">${info.song}</span><span class="separator">·</span><span class="artist-name">${artistHtml}</span>`;
        } else {
            el.innerHTML = `<span class="song-title">${info.song}</span>`;
        }
        el.classList.remove('loading');
    }

    function showStatus(msg, isError) {
        const el = document.getElementById('nowPlaying');
        el.innerHTML = `<span class="status-msg" style="${isError ? 'color:#cc3333;' : ''}">${msg}</span>`;
        el.classList.add('loading');
    }

    // ----- UPDATE PLAYING CLASS -----
    function updatePlayingState(playing) {
        const mainHeader = document.getElementById('playerHeader');
        const overlayHeader = document.getElementById('overlayPlayerHeader');

        if (mainHeader) {
            if (playing) {
                mainHeader.classList.add('playing');
            } else {
                mainHeader.classList.remove('playing');
            }
        }

        if (overlayHeader) {
            if (playing) {
                overlayHeader.classList.add('playing');
            } else {
                overlayHeader.classList.remove('playing');
            }
        }
    }

    // ----- DAILY SHUFFLE -----
    function getDailyShuffledIndices() {
        const now = new Date();
        const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        const indices = [...Array(PLAYLIST.length).keys()];

        function mulberry32(a) {
            return function() {
                a |= 0;
                a = a + 0x6D2B79F5 | 0;
                let t = Math.imul(a ^ a >>> 15, 1 | a);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }

        const rng = mulberry32(seed);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }

    let shuffledIndices = getDailyShuffledIndices();
    let shuffledPlaylist = shuffledIndices.map(i => PLAYLIST[i]);
    let shuffledDurations = shuffledIndices.map(i => TRACK_DURATIONS[PLAYLIST[i].split('/').pop()] || 180);
    let totalDuration = shuffledDurations.reduce((a, b) => a + b, 0);

    // ----- AUDIO SETUP -----
    function setupAudio() {
        if (audioProcessingSetup) return;
        try {
            audioContext = new(window.AudioContext || window.webkitAudioContext)();

            compressorNode = audioContext.createDynamicsCompressor();
            compressorNode.threshold.value = -6;
            compressorNode.knee.value = 0;
            compressorNode.ratio.value = 20;
            compressorNode.attack.value = 0.001;
            compressorNode.release.value = 0.05;

            masterGainNode = audioContext.createGain();
            masterGainNode.gain.value = 0;

            sources[0] = audioContext.createMediaElementSource(players[0]);
            sources[1] = audioContext.createMediaElementSource(players[1]);

            gains[0] = audioContext.createGain();
            gains[1] = audioContext.createGain();

            gains[0].gain.value = 1.0;
            gains[1].gain.value = 0.0;

            sources[0].connect(gains[0]);
            gains[0].connect(compressorNode);
            sources[1].connect(gains[1]);
            gains[1].connect(compressorNode);
            compressorNode.connect(masterGainNode);
            masterGainNode.connect(audioContext.destination);

            audioProcessingSetup = true;
            console.log('🔊 Audio setup complete');
        } catch (e) {
            console.warn('Audio setup failed:', e);
            audioProcessingSetup = true;
        }
    }

    async function resumeAudioContext() {
        if (audioContext && audioContext.state === 'suspended') {
            try {
                await audioContext.resume();
                console.log('🔊 AudioContext resumed');
                return true;
            } catch (e) {
                console.warn('Could not resume AudioContext', e);
                return false;
            }
        }
        return true;
    }

    // ----- CROSSFADE -----
    function executeCrossfade() {
        const nextPlayerIndex = 1 - activePlayerIndex;
        const nextTrackIdx = (currentTrackIndex + 1) % shuffledPlaylist.length;

        const startTime = audioContext.currentTime;
        const fadeDuration = 3.0;

        gains[activePlayerIndex].gain.setValueAtTime(gains[activePlayerIndex].gain.value, startTime);
        gains[activePlayerIndex].gain.linearRampToValueAtTime(0, startTime + fadeDuration);

        gains[nextPlayerIndex].gain.setValueAtTime(0, startTime);
        gains[nextPlayerIndex].gain.linearRampToValueAtTime(1, startTime + fadeDuration);

        if (crossfadeTimeout) {
            clearTimeout(crossfadeTimeout);
            crossfadeTimeout = null;
        }

        crossfadeTimeout = setTimeout(() => {
            players[activePlayerIndex].pause();
            activePlayerIndex = nextPlayerIndex;
            currentTrackIndex = nextTrackIdx;
            nextTrackIndex = (nextTrackIdx + 1) % shuffledPlaylist.length;
            updateNowPlaying();
            isCrossfading = false;
            crossfadePrepared = false;
            crossfadeTimeout = null;

            const preloadNextIdx = 1 - activePlayerIndex;
            const preloadTrack = shuffledPlaylist[(currentTrackIndex + 1) % shuffledPlaylist.length];
            players[preloadNextIdx].src = preloadTrack;
            players[preloadNextIdx].load();
        }, fadeDuration * 1000 + 50);
    }

    function prepareCrossfade() {
        if (isCrossfading || crossfadePrepared) return;
        crossfadePrepared = true;
        isCrossfading = true;

        const nextPlayerIndex = 1 - activePlayerIndex;
        const nextTrackIdx = (currentTrackIndex + 1) % shuffledPlaylist.length;
        const nextSrc = shuffledPlaylist[nextTrackIdx];

        players[nextPlayerIndex].src = nextSrc;
        players[nextPlayerIndex].currentTime = 0;
        players[nextPlayerIndex].load();

        const playPromise = players[nextPlayerIndex].play();
        if (playPromise) {
            playPromise.catch(() => {});
        }

        const onCanPlay = () => executeCrossfade();
        const onPlaying = () => executeCrossfade();
        const onError = () => executeCrossfade();

        players[nextPlayerIndex].addEventListener('canplaythrough', onCanPlay, { once: true });
        players[nextPlayerIndex].addEventListener('playing', onPlaying, { once: true });
        players[nextPlayerIndex].addEventListener('error', onError, { once: true });

        setTimeout(() => {
            if (isCrossfading && !crossfadeTimeout) executeCrossfade();
        }, 2000);
    }

    // ----- START SYNCED PLAYBACK -----
    function startSyncedPlayback() {
        if (isInitialized) return;
        isInitialized = true;

        console.log('🎵 Starting synced playback...');

        const newIndices = getDailyShuffledIndices();
        if (newIndices.join(',') !== shuffledIndices.join(',')) {
            shuffledIndices = newIndices;
            shuffledPlaylist = shuffledIndices.map(i => PLAYLIST[i]);
            shuffledDurations = shuffledIndices.map(i => TRACK_DURATIONS[PLAYLIST[i].split('/').pop()] || 180);
            totalDuration = shuffledDurations.reduce((a, b) => a + b, 0);
        }

        const now = new Date();
        const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        let remaining = secondsSinceMidnight % totalDuration;
        let trackIndex = 0;
        let offset = 0;
        for (let i = 0; i < shuffledDurations.length; i++) {
            const dur = shuffledDurations[i] || 180;
            if (remaining < dur) {
                trackIndex = i;
                offset = remaining;
                break;
            }
            remaining -= dur;
            trackIndex = i + 1;
        }
        if (trackIndex >= shuffledPlaylist.length) {
            trackIndex = shuffledPlaylist.length - 1;
            offset = shuffledDurations[trackIndex] || 180;
        }

        const currentSrc = shuffledPlaylist[trackIndex];
        const nextSrc = shuffledPlaylist[(trackIndex + 1) % shuffledPlaylist.length];

        players[0].src = currentSrc;
        players[0].currentTime = offset;
        players[1].src = nextSrc;
        players[1].currentTime = 0;

        gains[0].gain.value = 1.0;
        gains[1].gain.value = 0.0;

        activePlayerIndex = 0;
        currentTrackIndex = trackIndex;
        nextTrackIndex = (trackIndex + 1) % shuffledPlaylist.length;

        players[0].load();
        players[1].load();

        const info = getDisplayName(trackIndex);
        console.log(
            `⏱️ Time-synced track (shuffled): #${trackIndex+1} - ${info ? info.song + ' · ' + info.artist : 'unknown'}`);

        updateNowPlaying();

        setInterval(() => {
            if (!radioStarted) return;

            const activePlayer = players[activePlayerIndex];
            if (activePlayer.paused) {
                if (!isCrossfading) activePlayer.play().catch(() => {});
                return;
            }

            const currentTime = activePlayer.currentTime || 0;
            const duration = shuffledDurations[currentTrackIndex] || 180;

            if (currentTime >= duration - 5 && !crossfadePrepared) {
                prepareCrossfade();
            }

            if (currentTime >= duration && !crossfadePrepared) {
                prepareCrossfade();
            }
        }, 250);

        players[0].addEventListener('error', function(e) {
            console.warn('Player 0 error:', e);
            if (!isInitialized) return;
            if (!crossfadePrepared && radioStarted) {
                prepareCrossfade();
            }
        });
        players[1].addEventListener('error', function(e) {
            console.warn('Player 1 error:', e);
            if (!isInitialized) return;
            if (!crossfadePrepared && radioStarted) {
                prepareCrossfade();
            }
        });

        isPlaying = false;
        playIcon.textContent = '▶';
        updatePlayingState(false);
        nowPlayingEl.classList.remove('loading');

        console.log('🎵 Radio ready, click play to start');
    }

    // ----- TOGGLE PLAY -----
    async function togglePlay() {
        console.log('🎵 Toggle play called, isInitialized:', isInitialized);

        if (!isInitialized) {
            if (PLAYLIST.length === 0) {
                showStatus('No tracks – add files to the PLAYLIST array', true);
                return;
            }
            setupAudio();
            await resumeAudioContext();
            startSyncedPlayback();
        }

        if (!audioProcessingSetup) {
            setupAudio();
        }
        await resumeAudioContext();

        if (isPlaying) {
            // PAUSE
            if (masterGainNode) {
                masterGainNode.gain.setValueAtTime(0, audioContext.currentTime);
            }
            isPlaying = false;
            playIcon.textContent = '▶';
            updatePlayingState(false);
            console.log('🔊 Radio paused');
        } else {
            // PLAY
            if (!radioStarted) {
                try {
                    console.log('🔊 Attempting to start playback...');
                    await players[activePlayerIndex].play();
                    radioStarted = true;
                    console.log('🔊 Radio playback started successfully');
                } catch (err) {
                    console.error('Playback failed:', err);
                    showStatus('Playback error – click again', true);
                    return;
                }
            }

            if (masterGainNode) {
                masterGainNode.gain.setValueAtTime(1, audioContext.currentTime);
            }
            isPlaying = true;
            playIcon.textContent = '❚❚';
            updatePlayingState(true);
            updateNowPlaying();
            console.log('🔊 Radio playing');
        }
    }

    // ----- EVENT LISTENERS -----
    playBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('👆 Play button clicked');
        togglePlay();
    });

    document.addEventListener('keydown', function(e) {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            console.log('⌨️ Spacebar pressed');
            togglePlay();
        }
    });

    // ----- START -----
    if (PLAYLIST.length === 0) {
        showStatus('No tracks – add files to the PLAYLIST array', true);
    } else {
        console.log('🎵 Initializing radio...');
        setupAudio();
        startSyncedPlayback();
        console.log('🎵 Radio initialized successfully');

        document.addEventListener('click', function() {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('🔊 AudioContext resumed via user interaction');
                });
            }
        }, { once: false });
    }
}
