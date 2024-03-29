﻿// сортировка строк в "естественном" порядке. Параметры:
// 		array - массив строк или объектов
//      extractor - функция преобразования объекта в строковый ключ
function naturalSort(array, extractor) {
    "use strict";
    // преобразуем исходный массив в массив сплиттеров
    var splitters = array.map(makeSplitter);
    // сортируем сплиттеры
    var sorted = insertionSort(splitters, compareSplitters);
    // возвращаем исходные данные в новом порядке
    return sorted.map(function (splitter) {
        return splitter.item;
    });
    // обёртка конструктора сплиттера
    function makeSplitter(item) {
        return new Splitter(item);
    }
    // конструктор сплиттера
    //		сплиттер разделяет строку на фрагменты "ленивым" способом
    function Splitter(item) {
        var index = 0; 					// индекс для прохода по строке	
        var from = 0; 					// начальный индекс для фрагмента
        var parts = []; 				// массив фрагментов
        var completed = false; 			// разобрана ли строка полностью
        // исходный объект
        this.item = item;
        // ключ - строка
        var key = (typeof (extractor) === 'function') ?
			extractor(item) :
			item;
        if (typeof(key) === 'string') {
            key = trim(key);
        } else {
            throw new TypeError('Key should be String');
        }
        this.key = key;
        // количество найденных фрагментов
        this.count = function () {
            return parts.length;
        };
        // пустой ли ключ
        this.isEmpty = function () {
            return (key === '');
        }
        // фрагмент по индексу (по возможности из parts[])
        this.part = function (i) {
            while (parts.length <= i && !completed) {
                next(); 	// разбираем строку дальше
            }
            return (i < parts.length) ? parts[i] : null;
        };
        // разбор строки до следующего фрагмента
        function next() {
            // строка ещё не закончилась
            if (index < key.length) {
                // перебираем символы до границы между нецифровыми символами и цифрами
                while (++index) {
                    var currentIsDigit = isDigit(key.charAt(index - 1));
                    var nextChar = key.charAt(index);
                    var currentIsLast = (index === key.length);
                    // граница - если символ последний,
                    // или если текущий и следующий символы разнотипные (цифра / не цифра)
                    var isBorder = currentIsLast ||
						xor(currentIsDigit, isDigit(nextChar));
                    if (isBorder) {
                        // формируем фрагмент и добавляем его в parts[]
                        var partStr = key.slice(from, index);
                        parts.push(new Part(partStr, currentIsDigit));
                        from = index;
                        break;
                    } // end if
                } // end while
                // строка уже закончилась
            } else {
                completed = true;
            } // end if
        } // end next
        // конструктор фрагмента
        function Part(text, isNumber) {
            this.isNumber = isNumber;
            this.value = isNumber ? Number(text) : text;
        }
        // убирает пробельные символы в начале и конце строки
        function trim(str) {
            return str.replace(/^\s+|\s+$/, "");
        }
    }
    // сравнение сплиттеров
    function compareSplitters(sp1, sp2) {
        // пустые строки должны быть в конце
        if (sp1.isEmpty()) {
            return 1;
        } else if (sp2.isEmpty()) {
            return -1;
        }
        // перебираем фрагменты
        var i = 0;
        do {
            var first = sp1.part(i);
            var second = sp2.part(i);
            // если оба фрагмента существуют ...
            if (null !== first && null !== second) {
                // фрагменты разных типов (цифры либо нецифровые символы)	
                if (xor(first.isNumber, second.isNumber)) {
                    // цифры всегда "меньше"			
                    return first.isNumber ? -1 : 1;
                    // фрагменты одного типа  можно просто сравнить
                } else {
                    var comp = compare(first.value, second.value);
                    if (comp != 0) {
                        return comp;
                    }
                } // end if
                // ... если же одна из строк закончилась - то она "меньше"
            } else {
                return compare(sp1.count(), sp2.count());
            }
        } while (++i);
        // обычное сравнение строк или чисел
        function compare(a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        };
    };
    // логическое исключающее "или"
    function xor(a, b) {
        return a ? !b : b;
    };
    // проверка: является ли символ цифрой
    function isDigit(chr) {
        var code = charCode(chr);
        return (code >= charCode('0')) && (code <= charCode('9'));
        function charCode(c) {
            return c.charCodeAt(0);
        };
    };
    // сортировка вставками
    function insertionSort(arr, comparer) {
        for (var i = 0, j, tmp; i < arr.length; ++i) {
            tmp = arr[i];
            for (j = i - 1; j >= 0 && comparer(arr[j], tmp) >= 0; --j)
                arr[j + 1] = arr[j];
            arr[j + 1] = tmp;
        }
        return arr;    
    }
}