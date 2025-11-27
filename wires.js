console.log("✅ Wires Module Loaded");

window.activeLines = [];

// Функция отрисовки (вызывается из engine.js при загрузке схемы)
window.drawWires = function() {
    // 1. Очищаем старые (на всякий случай)
    window.clearWires();
    
    // 2. Берем текущую схему
    const list = document.getElementById('connectionsList');
    if (!list) return;
    
    // Получаем сырой текст связей из текущего пресета
    // (В engine.js мы не передавали сюда данные, поэтому хитро найдем их)
    // Но лучше всего парсить прямо из DOM списка подключений, который мы уже построили
    
    // Проходимся по всем строчкам в логе подключений
    const rows = list.querySelectorAll('div');
    
    rows.forEach(row => {
        const text = row.innerText;
        
        // Ищем паттерн: [число] ... -> [число]
        // Например: "[1] Sensor -> [2] Logic"
        const matches = [...text.matchAll(/\[(\d+)\]/g)];
        
        if (matches.length >= 2) {
            // Берем первую пару (Откуда -> Куда)
            const fromID = matches[0][1];
            const toID = matches[1][1];
            
            const el1 = document.getElementById(`block-${fromID}`);
            const el2 = document.getElementById(`block-${toID}`);
            
            if (el1 && el2) {
                try {
                    // Рисуем линию
                    const line = new LeaderLine(
                        el1,
                        el2,
                        {
                            color: '#f97316', // Оранжевый (Tailwind orange-500)
                            size: 4,
                            path: 'fluid',    // Плавная кривая
                            startSocket: 'right',
                            endSocket: 'left',
                            startPlug: 'disc', // Точка в начале
                            endPlug: 'arrow3'  // Стрелка в конце
                        }
                    );
                    window.activeLines.push(line);
                } catch (e) {
                    console.error("Wire error:", e);
                }
            }
        }
    });
    
    // Сразу обновляем позицию, чтобы линии встали ровно
    window.updateWires();
};

// Удаление всех линий
window.clearWires = function() {
    window.activeLines.forEach(line => line.remove());
    window.activeLines = [];
};

// Обновление позиций (вызывается при зуме и драге)
window.updateWires = function() {
    window.activeLines.forEach(line => {
        try {
            line.position(); 
        } catch(e) {}
    });
};

// Инициализация (если нужно)
window.initWires = function() {
    // Настройка стилей по умолчанию для всех линий (опционально)
};