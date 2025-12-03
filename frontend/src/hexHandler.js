import { handleError } from "./utils";

export function incrementHex(hexString, increment) {
    if (typeof hexString !== 'string' || !/^[0-9A-Fa-f]+$/.test(hexString)) {
        handleError("Некорректно задан адрес начала программы");
        return -1;
    }
    
    const decimalValue = parseInt(hexString, 16);
    
    const maxSafeValue = 0xFFFFFF; 
    if (decimalValue > maxSafeValue) {
        handleError("Переполнение памяти!");
        return -1;
    }
    
    if (decimalValue + increment > maxSafeValue) {
        handleError("Переполнение памяти!");
        return -1;
    }
    
    if (decimalValue + increment < 0) {
        handleError("Переполнение памяти!");
        return -1;
    }
    
    const result = decimalValue + increment;
    return result.toString(16).toUpperCase().padStart(6, '0');
}

export function stringToAsciiHex(inputString) {
    return Array.from(inputString)
        .map(char => char.charCodeAt(0).toString(16).toUpperCase())
        .join('');
}

export function decrementHex(hexString, decrement) {
    const decimal = parseInt(hexString, 16) - decrement;
    return decimal.toString(16).toUpperCase().padStart(6, '0');
}

export function hexSubtract(a, b, c) {
    // Преобразуем шестнадцатеричные строки в числа
    const numA = parseInt(a, 16);
    const numB = parseInt(b, 16);
    const numC = parseInt(c, 16);
    
    // Вычисляем c - (a + b)
    const result = numC - (numA + numB);
    
    return result;
}

export function to3ByteHex(number) {
    // Проверяем, что входное значение - целое число
    if (!Number.isInteger(number)) {
        throw new Error('Input must be an integer');
    }
    
    // Преобразуем число в 32-битное представление (для работы с отрицательными числами)
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setInt32(0, number, false); // big-endian
    
    // Получаем 4 байта
    const byte1 = view.getUint8(0);
    const byte2 = view.getUint8(1);
    const byte3 = view.getUint8(2);
    const byte4 = view.getUint8(3);
    
    const result = ((byte2 << 16) | (byte3 << 8) | byte4) >>> 0;
    
    return result.toString(16).toUpperCase().padStart(6, '0');
}