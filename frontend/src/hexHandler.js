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