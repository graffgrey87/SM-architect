// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
const library = { 
    blocks: window.SM_BLOCKS || {}, 
    wiki: window.SM_WIKI || {}, 
    presets: window.SM_PRESETS || {} 
};

// Координаты (центр экрана)
let scale = 1, pointX = window.innerWidth/2, pointY = window.innerHeight/2;
let isDragging = false, startX, startY, currentCategory = null, lastTouchDist = 0;
const viewport = document.getElementById('viewport');
const container = document.getElementById('canvas-container');
const categoryMap = { 'input': ['input', 'sensor'], 'logic': ['logic', 'math'], 'output': ['output'], 'util': ['util'] };

// --- ИНИЦИАЛИЗАЦИЯ ---
function init() { 
    setupZoomPan(); 
    // Авто-центровка при повороте экрана
    window.addEventListener('resize', () => { 
        pointX = window.innerWidth/2; 
        pointY = window.innerHeight/2; 
        updateTransform(); 
    });
    
    if (typeof initWires === 'function') initWires();
    console.log("✅ Engine v6.1 (Modular & Centered) Loaded"); 
}

// --- НАВИГАЦИЯ ---
window.clearScreen = () => { 
    document.getElementById('canvas-content').innerHTML = '<div id="placeholder" class="text-gray-600 text-center pointer-events-none select-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><div class="text-6xl mb-4 opacity-20">🛠</div><div class="text-lg">Выберите категорию</div></div>'; 
    document.getElementById('topPanel').classList.add('hidden'); 
    document.getElementById('connectionsList').innerHTML = '<div class="text-center opacity-50 mt-4">Нет активной схемы</div>'; 
    
    if (window.clearWires) window.clearWires();
    
    // Сброс в центр
    scale = 1; pointX = window.innerWidth/2; pointY = window.innerHeight/2; updateTransform();
    if(window.innerWidth<1024) toggleInspector(false); 
}

window.filterCategory = (catName) => {
    const drawer = document.getElementById('blockDrawer');
    if (currentCategory === catName) { 
        drawer.classList.add('hidden'); 
        currentCategory = null; 
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); 
    } else { 
        drawer.classList.remove('hidden'); 
        currentCategory = catName; 
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); 
        document.getElementById(`nav-${catName}`).classList.add('active'); 
        document.getElementById('drawerTitle').innerText = catName === 'output' ? 'Механика' : catName === 'util' ? 'Утилиты' : catName.toUpperCase(); 
        renderFilteredList(categoryMap[catName]); 
    }
}

function renderFilteredList(allowedTypes) {
    const list = document.getElementById('menuList'); list.innerHTML = '';
    const keys = Object.keys(library.blocks).filter(k => { const b = library.blocks[k]; return b.type !== 'hidden' && allowedTypes.includes(b.type); });
    if (keys.length === 0) { list.innerHTML = '<div class="text-gray-500 text-xs text-center mt-4">Пусто</div>'; return; }
    keys.forEach(key => {
        const b = library.blocks[key];
        const hasPreset = library.presets[key] && library.presets[key].length > 0;
        const div = document.createElement('div');
        div.className = 'flex items-center gap-3 p-3 rounded hover:bg-[#222] cursor-pointer transition group mb-1';
        if (hasPreset) div.classList.add('bg-[#1a1a1a]', 'border-l-2', 'border-orange-500/50');
        div.onclick = () => { if(hasPreset) window.showPresets(key); else alert("Схем пока нет."); if(window.innerWidth < 1024) window.closeDrawer(); };
        let icon = b.img ? `<img src="${b.img}" class="w-8 h-8 object-contain" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="text-xl hidden">${b.icon}</span>` : `<span class="text-xl">${b.icon}</span>`;
        div.innerHTML = `${icon}<div class="flex-1 min-w-0"><div class="text-sm font-bold text-gray-300 truncate group-hover:text-white">${b.name}</div>${hasPreset ? '<div class="text-[10px] text-orange-500">Есть схемы</div>' : ''}</div>`;
        list.appendChild(div);
    });
}
window.closeDrawer = () => { document.getElementById('blockDrawer').classList.add('hidden'); document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); currentCategory = null; }
window.closeDrawerMobile = () => { if(window.innerWidth < 1024) window.closeDrawer(); }

// --- ЗАГРУЗКА СХЕМ ---
window.showPresets = (targetKey) => {
    const presets = library.presets[targetKey];
    document.getElementById('topPanel').classList.add('hidden');
    document.getElementById('connectionsList').innerHTML = '';
    
    if (window.clearWires) window.clearWires();

    if (!presets) return;
    if (presets.length === 1) { loadPreset(targetKey, 0); return; }
    
    const content = document.getElementById('canvas-content');
    content.innerHTML = '<div class="flex flex-wrap gap-12 justify-center items-center w-[1000px] p-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>';
    const wrapper = content.firstChild;
    
    presets.forEach((p, idx) => { wrapper.innerHTML += `<button onclick="loadPreset('${targetKey}', ${idx})" class="p-6 bg-[#222] border border-[#444] rounded hover:border-orange-500 text-gray-200 pointer-events-auto transition hover:scale-105 shadow-xl text-lg font-bold">${p.name}</button>`; });
    setTimeout(autoFitView, 50);
}

window.loadPreset = (targetKey, idx) => {
    const preset = library.presets[targetKey][idx];
    document.getElementById('infoTitle').innerText = preset.name;
    document.getElementById('infoDesc').innerHTML = preset.desc || "";
    document.getElementById('topPanel').classList.remove('hidden');
    
    const content = document.getElementById('canvas-content');
    content.innerHTML = ''; 

    let chainObjects = [];
    if (preset.chain) { preset.chain.forEach((key, i) => { let b = library.blocks[key] || { name: "UNKNOWN", icon: "?", type: "hidden" }; chainObjects.push({ ...b, key: key, idx: i + 1 }); }); }
    
    // РАССТАНОВКА ОТ ЦЕНТРА
    const totalWidth = (chainObjects.length * 120) - 20; 
    const startX = -totalWidth / 2;

    chainObjects.forEach((b, i) => {
        const el = document.createElement('div');
        el.className = 'sm-block node-wrapper animate-[popIn_0.2s_ease-out] cursor-help';
        // Абсолютные координаты
        el.style.left = `${startX + (i * 120)}px`;
        el.style.top = `-50px`; 
        el.setAttribute('onclick', `event.stopPropagation(); openWikiKey('${b.key}')`);
        el.id = `block-${b.idx}`;

        let imgContent = b.img ? `<img src="${b.img}" class="img-layer" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="emoji-layer hidden">${b.icon}</div>` : `<div class="emoji-layer">${b.icon}</div>`;
        el.innerHTML = `<div class="block-idx">${b.idx}</div><div class="icon-container">${imgContent}</div><div class="sm-block-title">${b.name}</div>`;
        content.appendChild(el);
    });

    const connList = document.getElementById('connectionsList');
    if(preset.connections) {
        connList.innerHTML = preset.connections.map(text => {
            let interactiveText = text.replace(/\[(\d+)\]/g, (match, id) => `<span class="text-orange-400 font-bold cursor-pointer underline bg-orange-900/30 px-1 rounded" onclick="highlightBlock(${id})" onmouseenter="window.hi(${id})" onmouseleave="window.lo(${id})">[${id}]</span>`);
            return `<div class="p-3 bg-[#222] rounded border-l-2 border-orange-500 mb-2 hover:bg-[#2a2a2a] transition text-sm">${interactiveText}</div>`;
        }).join('');
    }
    
    // Рисуем провода (если есть модуль)
    if (window.drawWires && preset.connections) setTimeout(() => window.drawWires(), 100);

    // Центруем и показываем инспектор
    setTimeout(autoFitView, 50); 
    if(window.innerWidth < 1024) window.toggleInspector(true);
}

// --- ЦЕНТРОВКА И ЗУМ ---
window.autoFitView = () => {
    const blocks = document.querySelectorAll('.sm-block');
    if (blocks.length === 0) { scale = 1; pointX = window.innerWidth/2; pointY = window.innerHeight/2; updateTransform(); return; }

    requestAnimationFrame(() => {
        const vpW = viewport.offsetWidth;
        const vpH = viewport.offsetHeight;
        
        // Ширина контента (блоки в ряд)
        const contentW = blocks.length * 120 + 100;
        
        // Считаем зум
        const scaleX = vpW / contentW;
        scale = Math.min(Math.max(scaleX, 0.4), 1.2);
        
        // Ставим в центр
        pointX = vpW / 2;
        pointY = vpH / 2;

        updateTransform();
        if (window.updateWires) window.updateWires();
    });
}

window.highlightBlock = (id) => { if(window.innerWidth < 1024) window.toggleInspector(false); window.hi(id); setTimeout(() => window.lo(id), 2000); }
window.hi = (id) => { const el = document.getElementById(`block-${id}`); if(el) el.classList.add('active-highlight'); }
window.lo = (id) => { const el = document.getElementById(`block-${id}`); if(el) el.classList.remove('active-highlight'); }

window.resetView = () => window.autoFitView();

function updateTransform() { container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`; }

function setupZoomPan() {
    // Мышь
    viewport.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX - pointX; startY = e.clientY - pointY; });
    window.addEventListener('mousemove', e => { if(!isDragging) return; e.preventDefault(); pointX = e.clientX - startX; pointY = e.clientY - startY; updateTransform(); if(window.updateWires) window.updateWires(); });
    window.addEventListener('mouseup', () => isDragging = false);
    viewport.addEventListener('wheel', e => { e.preventDefault(); 
        const zoomSpeed = 0.1;
        const newScale = e.deltaY > 0 ? scale - zoomSpeed : scale + zoomSpeed;
        scale = Math.min(Math.max(0.2, newScale), 3);
        updateTransform(); 
        if(window.updateWires) window.updateWires();
    });
    
    // Тач (Мобильный)
    viewport.addEventListener('touchstart', e => {
        if(e.touches.length === 1) { isDragging=true; startX=e.touches[0].clientX-pointX; startY=e.touches[0].clientY-pointY; }
        if(e.touches.length === 2) { isDragging=false; lastTouchDist = getTouchDist(e); }
    }, { passive: false });
    viewport.addEventListener('touchmove', e => {
        e.preventDefault();
        if(isDragging && e.touches.length === 1) { pointX=e.touches[0].clientX-startX; pointY=e.touches[0].clientY-startY; updateTransform(); if(window.updateWires) window.updateWires(); }
        if(e.touches.length === 2) {
            const dist = getTouchDist(e);
            if(lastTouchDist) {
                const delta = dist / lastTouchDist;
                scale = Math.min(Math.max(0.2, scale * delta), 3);
                updateTransform();
                if(window.updateWires) window.updateWires();
            }
            lastTouchDist = dist;
        }
    }, { passive: false });
    viewport.addEventListener('touchend', () => {isDragging=false;lastTouchDist=0;});
}
function getTouchDist(e) { return Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); }

// --- МОДАЛКИ ---
window.openWiki = () => { renderWiki(); document.getElementById('wikiModal').classList.remove('hidden'); }
window.openWikiKey = (key) => { openWiki(); setTimeout(() => { const el = document.getElementById(`wiki-${key}`); if(el) { el.scrollIntoView({behavior:'smooth', block:'center'}); el.classList.add('ring-2', 'ring-orange-500'); } }, 100); }
window.closeWiki = () => document.getElementById('wikiModal').classList.add('hidden');
window.openAdmin = () => document.getElementById('adminModal').classList.remove('hidden');
window.closeAdmin = () => document.getElementById('adminModal').classList.add('hidden');

window.toggleInspector = (forceOpen) => {
    const panel = document.getElementById('connectionsPanel');
    const btnMobile = document.getElementById('inspectorBtnMobile');
    const btnPC = document.getElementById('inspectorBtnPC');
    
    if (forceOpen === true) { 
        panel.classList.remove('translate-y-full', 'lg:translate-x-full'); 
        btnMobile.classList.add('hidden'); 
        btnPC.innerText = "▶"; 
    } else if (forceOpen === false) { 
        panel.classList.add('translate-y-full', 'lg:translate-x-full'); 
        btnMobile.classList.remove('hidden'); 
        btnPC.innerText = "◀"; 
    } else { 
        panel.classList.toggle('translate-y-full'); 
        panel.classList.toggle('lg:translate-x-full'); 
        const isOpen = !panel.classList.contains('translate-y-full');
        if(isOpen) { btnMobile.classList.add('hidden'); btnPC.innerText = "▶"; } 
        else { btnMobile.classList.remove('hidden'); btnPC.innerText = "◀"; } 
    }
}

function renderWiki() { const c = document.getElementById('wikiContent'); if(c.innerHTML !== "") return; const categories = { "Input": [], "Logic": [], "Math/Util": [], "Output": [], "Misc": [], "Fant Mod": [] }; for (const [k, i] of Object.entries(library.wiki)) { let cat = i.category || "Misc"; if (cat.includes("Fant")) cat = "Fant Mod"; if(!categories[cat]) categories[cat] = []; let iconHTML = i.img ? `<div class="w-16 h-16 flex items-center justify-center bg-[#111] rounded border border-[#333] shrink-0"><img src="${i.img}" class="w-full h-full object-contain"></div>` : `<span class="text-4xl">${i.icon || '🔹'}</span>`; categories[cat].push(`<div id="wiki-${k}" class="bg-[#222] p-6 rounded-xl border border-[#333] mb-4 transition hover:border-orange-500/50"><div class="flex gap-6 items-start">${iconHTML}<div><h3 class="text-xl font-bold text-orange-400 mb-2">${i.title}</h3><p class="text-gray-300 text-base leading-relaxed">${i.text}</p></div></div></div>`); } for (const [catName, items] of Object.entries(categories)) { if(items.length > 0) { c.innerHTML += `<div class="text-orange-500 font-bold uppercase tracking-widest text-sm border-b border-[#333] pb-2 mb-6 mt-10">${catName}</div>`; c.innerHTML += items.join(''); } } }
window.copyKeys = () => { navigator.clipboard.writeText(Object.keys(library.blocks).join(', ')); document.getElementById('adminLog').innerText = "Скопировано!"; }
window.universalMerge = () => { alert("Используйте GitHub!"); }

// ЗАПУСК
init();