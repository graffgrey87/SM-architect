console.log("✅ Wires Module Loaded");

// Хранилище активных линий
window.activeLines = [];

// 1. Функция отрисовки (вызывается при загрузке схемы)
window.drawWires = function() {
    // Сначала удаляем старые, чтобы не было дублей
    window.clearWires();
    
    const list = document.getElementById('connectionsList');
    if (!list) return;
    
    // Ищем все строчки в списке подключений
    // Они выглядят как HTML элементы внутри списка
    // Текст внутри: "[1] Sensor -> [2] Logic"
    const rows = list.querySelectorAll('div');
    
    rows.forEach(row => {
        const text = row.innerText;
        
        // Магия RegEx: Ищем пары чисел в скобках [1] ... [2]
        // matchAll возвращает итератор, превращаем в массив
        const matches = [...text.matchAll(/\[(\d+)\]/g)];
        
        // Если нашли хотя бы две метки (Откуда и Куда)
        if (matches.length >= 2) {
            const fromID = matches[0][1]; // Первое число (например "1")
            const toID = matches[1][1];   // Второе число (например "2")
            
            // Ищем эти блоки на холсте
            const el1 = document.getElementById(`block-${fromID}`);
            const el2 = document.getElementById(`block-${toID}`);
            
            if (el1 && el2) {
                try {
                    // Создаем линию
                    const line = new LeaderLine(
                        el1,
                        el2,
                        {
                            color: '#f97316', // Оранжевый (Tailwind orange-500)
                            size: 4,          // Толщина
                            path: 'fluid',    // Плавный изгиб
                            startSocket: 'right', // Выходит справа
                            endSocket: 'left',    // Входит слева
                            startPlug: 'disc',    // Точка на старте
                            endPlug: 'arrow3',    // Стрелка в конце
                            dropShadow: false,    // Тень (выкл для скорости)
                            hide: true            // Сначала скрываем, пока не позиционируем
                        }
                    );
                    
                    // Сохраняем в память
                    window.activeLines.push(line);
                    
                    // Показываем линию
                    line.show('draw', {duration: 300, timing: 'ease-out'});
                    
                } catch (e) {
                    console.warn("Wire error:", e);
                }
            }
        }
    });
    
    // Принудительно обновляем позицию сразу после создания
    window.updateWires();
};

// 2. Функция очистки (вызывается перед загрузкой новой схемы)
window.clearWires = function() {
    window.activeLines.forEach(line => {
        try {
            line.remove(); // Удаляем SVG из DOM
        } catch(e) {}
    });
    window.activeLines = [];
};

// 3. Функция обновления (вызывается Движком при каждом кадре зума/драга)
window.updateWires = function() {
    window.activeLines.forEach(line => {
        try {
            // Самая важная команда: пересчитать координаты
            line.position(); 
        } catch(e) {}
    });
};

// 4. Инициализация (заглушка, если нужна будет в будущем)
window.initWires = function() {
    // Можно задать глобальные настройки LeaderLine здесь
};