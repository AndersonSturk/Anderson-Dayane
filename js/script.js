/* =============================================
   ANDERSON & DAYANE — script.js
   ============================================= */

// === BACKGROUND MUSIC CONTROL ===
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-control');
const musicIcon = document.getElementById('music-icon');
let isMusicPlaying = false;

function playAudio() {
    if (bgMusic && bgMusic.paused) {
        bgMusic.volume = 0.5; // Ajusta o volume inicial para 50%
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            if (musicBtn) musicBtn.classList.add('playing');
            if (musicIcon) musicIcon.textContent = '🎵';
        }).catch(err => {
            console.log("Aguardando interação do usuário para reproduzir áudio: ", err);
        });
    }
}

function pauseAudio() {
    if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        isMusicPlaying = false;
        if (musicBtn) musicBtn.classList.remove('playing');
        if (musicIcon) musicIcon.textContent = '🔇';
    }
}

// 1. Tenta reproduzir imediatamente ao carregar a página
playAudio();

// 2. Se o navegador bloqueou por padrão, toca no primeiro clique, toque ou scroll
function initAudioOnInteraction() {
    playAudio();
    document.removeEventListener('click', initAudioOnInteraction);
    document.removeEventListener('touchstart', initAudioOnInteraction);
    document.removeEventListener('scroll', initAudioOnInteraction);
}

document.addEventListener('click', initAudioOnInteraction);
document.addEventListener('touchstart', initAudioOnInteraction);
document.addEventListener('scroll', initAudioOnInteraction);

if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMusicPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });
}
// === PETALS ===
const PETALS = ['🌸', '🌹', '❤️', '💕', '🌺', '💗', '🌷', '✨', '🍂'];

function spawnPetal() {
    const el = document.createElement('div');
    el.className = 'petal';
    el.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
    el.style.left     = Math.random() * 100 + 'vw';
    el.style.fontSize = (10 + Math.random() * 14) + 'px';
    el.style.opacity  = (.3 + Math.random() * .45).toFixed(2);
    const dur = 5 + Math.random() * 7;
    el.style.animationDuration = dur + 's';
    el.style.animationDelay   = (Math.random() * 2) + 's';
    document.getElementById('petals-container').appendChild(el);
    setTimeout(() => el.remove(), (dur + 2) * 1000);
}

setInterval(spawnPetal, 700);

// === COUNTER ===
const START = new Date('2026-03-18T00:00:00');

function calcTime(start, now) {
    let years   = now.getFullYear()  - start.getFullYear();
    let months  = now.getMonth()     - start.getMonth();
    let days    = now.getDate()      - start.getDate();
    let hours   = now.getHours()     - start.getHours();
    let minutes = now.getMinutes()   - start.getMinutes();
    let seconds = now.getSeconds()   - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--;   }
    if (hours   < 0) { hours   += 24; days--;    }
    if (days    < 0) {
        const prev = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += prev; months--;
    }
    if (months  < 0) { months  += 12; years--;   }

    return { years, months, days, hours, minutes, seconds };
}

function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
    const t = calcTime(START, new Date());
    document.getElementById('c-years').textContent   = pad(t.years);
    document.getElementById('c-months').textContent  = pad(t.months);
    document.getElementById('c-days').textContent    = pad(t.days);
    document.getElementById('c-hours').textContent   = pad(t.hours);
    document.getElementById('c-minutes').textContent = pad(t.minutes);
    document.getElementById('c-seconds').textContent = pad(t.seconds);
}

tick();
setInterval(tick, 1000);

// === GALLERY — broken image detection ===
document.querySelectorAll('.pol-img').forEach(img => {
    function markBroken() {
        img.closest('.pol-photo').classList.add('broken');
        img.closest('.polaroid').style.cursor = 'default';
    }
    img.addEventListener('error', markBroken);
    if (img.complete && !img.naturalWidth) markBroken();
});

// === LIGHTBOX ===
function openLightbox(src, caption) {
    const probe = new Image();
    probe.onload = () => {
        document.getElementById('lb-img').src     = src;
        document.getElementById('lb-caption').textContent = caption || '';
        document.getElementById('lightbox').classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    probe.src = src;
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});

// Polaroid click delegation
document.querySelectorAll('.polaroid').forEach(pol => {
    pol.addEventListener('click', () => {
        if (pol.querySelector('.pol-photo.broken')) return;
        const src     = pol.getAttribute('data-src');
        const caption = pol.querySelector('.pol-caption').textContent;
        if (src) openLightbox(src, caption);
    });
});

// === MURAL ===
const COLORS   = ['yellow', 'pink', 'blue', 'green', 'purple'];
const ROTS     = [-5, 3, -2, 4, -3, 2, -4, 5, -1, 3];
const STORE_KEY = 'dayane_mural_v2';

const noteInput = document.getElementById('note-input');
const charCount = document.getElementById('char-count');

noteInput.addEventListener('input', () => {
    charCount.textContent = noteInput.value.length + '/180';
});

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function renderNote(note) {
    const el = document.createElement('div');
    el.className = `sticky ${note.color}`;
    el.style.setProperty('--rot', note.rot + 'deg');
    el.dataset.id = note.id;
    el.innerHTML = `
        <span class="sticky-pin">📌</span>
        <p class="sticky-from">— Dayane 💌</p>
        <p>${escHtml(note.text)}</p>
        <button class="del-btn" title="Apagar recado" onclick="deleteNote(${note.id}, event)">×</button>
    `;
    document.getElementById('dynamic-notes').appendChild(el);
}

function loadNotes() {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    saved.forEach(renderNote);
}

function pinNote() {
    const text = noteInput.value.trim();
    if (!text) return;

    const note = {
        id:    Date.now(),
        text,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot:   ROTS[Math.floor(Math.random() * ROTS.length)],
    };

    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    saved.push(note);
    localStorage.setItem(STORE_KEY, JSON.stringify(saved));

    renderNote(note);
    noteInput.value = '';
    charCount.textContent = '0/180';

    document.getElementById('mural').scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function deleteNote(id, event) {
    event.stopPropagation();
    const saved   = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    const updated = saved.filter(n => n.id !== id);
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    document.querySelector(`[data-id="${id}"]`).remove();
}

loadNotes();

// === PROPOSAL ===
const PROPOSAL_KEY = 'dayane_proposal_answer_v1';
const NO_MESSAGES = [
    'Não', 'Tem certeza?', 'Pensa bem...', 'Só clicando no Sim 😏',
    'Foge não', 'Ei, volta aqui', 'Impossível', 'Só isso não',
    'Está certa disso?', 'Repensa aí', 'Não vale', 'Quase!',
    'Tenta de novo', 'Essa não', 'Sério mesmo?', 'Deixa eu fugir',
    'Aqui não', 'Cadê o Sim?', 'Muda de ideia', 'Só se for brincadeira',
    'Não existe essa opção', 'Clica no Sim, vai', 'Essa não vai rolar',
    'Some daqui', 'Não tem chance', 'Insiste no Sim', 'Ihh, escapei',
    'Bora tentar de novo', 'Só o Sim que fica quieto', 'Reconsidera?',
    'Vish, fugiu de novo', 'Nem pensar'
];
let noMsgIndex = 0;

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh, pad) {
    return ax < bx + bw + pad && ax + aw + pad > bx &&
           ay < by + bh + pad && ay + ah + pad > by;
}

function dodgeNo() {
    const btn  = document.getElementById('btn-no');
    const yes  = document.getElementById('btn-yes');
    const wrap = document.getElementById('proposal-buttons');
    if (!btn || !wrap) return;

    const wrapRect = wrap.getBoundingClientRect();
    const btnRect  = btn.getBoundingClientRect();
    const maxX = Math.max(wrapRect.width  - btnRect.width,  0);
    const maxY = Math.max(wrapRect.height - btnRect.height, 0);

    let yesBox = null;
    if (yes) {
        const yesRect = yes.getBoundingClientRect();
        yesBox = {
            x: yesRect.left - wrapRect.left,
            y: yesRect.top  - wrapRect.top,
            w: yesRect.width,
            h: yesRect.height
        };
    }

    let x = Math.random() * maxX;
    let y = Math.random() * maxY;
    let attempts = 0;
    while (yesBox && attempts < 30 &&
           rectsOverlap(x, y, btnRect.width, btnRect.height, yesBox.x, yesBox.y, yesBox.w, yesBox.h, 12)) {
        x = Math.random() * maxX;
        y = Math.random() * maxY;
        attempts++;
    }

    if (yesBox && rectsOverlap(x, y, btnRect.width, btnRect.height, yesBox.x, yesBox.y, yesBox.w, yesBox.h, 12)) {
        const yesCenterX = yesBox.x + yesBox.w / 2;
        const yesCenterY = yesBox.y + yesBox.h / 2;
        x = yesCenterX < wrapRect.width / 2 ? maxX : 0;
        y = yesCenterY < wrapRect.height / 2 ? maxY : 0;
    }

    btn.style.position = 'absolute';
    btn.style.left = x + 'px';
    btn.style.top  = y + 'px';

    noMsgIndex = (noMsgIndex + 1) % NO_MESSAGES.length;
    btn.textContent = NO_MESSAGES[noMsgIndex];
}

function formatDatePt(date) {
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function showCelebration(date, burst) {
    const question     = document.getElementById('proposal-question');
    const celebration   = document.getElementById('proposal-celebration');
    const dateEl        = document.getElementById('celebration-date');

    if (question)    question.style.display = 'none';
    if (celebration)  celebration.classList.add('show');
    if (dateEl)        dateEl.textContent = formatDatePt(date);

    if (burst) {
        for (let i = 0; i < 40; i++) setTimeout(spawnPetal, i * 40);
    }
}

function sayYes() {
    localStorage.setItem(PROPOSAL_KEY, JSON.stringify({ answered: true, date: new Date().toISOString() }));
    showCelebration(new Date(), true);
}

(function restoreProposal() {
    const saved = JSON.parse(localStorage.getItem(PROPOSAL_KEY) || 'null');
    if (saved && saved.answered) showCelebration(new Date(saved.date), false);
})();

// === SCROLL REVEAL ===
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
