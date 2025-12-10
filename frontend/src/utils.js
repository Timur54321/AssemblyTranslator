import { incrementHex, stringToAsciiHex } from "./hexHandler";

export function isValidMetkaName(str, config) {
    if (str[0] == "$") return false;
    if (typeof str !== 'string' || str.trim() === '') {
        return false;
    }
    
    const name = str.trim();    
    
    if (config.RtoVal[name] || config.directives.includes(name.toUpperCase()) || config.dataTypes.includes(name.toUpperCase())) {
        return false;
    }
    
    const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    
    return identifierRegex.test(name);
}

export function handleError(message, second = false) {
    if (second) {
        document.querySelector("#errors_block_2").value = message;
        document.querySelector("#errors_block_2").classList.add('error-animation');

        setTimeout(() => {
            document.querySelector("#errors_block_2").classList.remove('error-animation');
        }, 500)
    }
    else {
        document.querySelector("#errors_block_1").value = message;
        document.querySelector("#errors_block_1").classList.add('error-animation');

        setTimeout(() => {
            document.querySelector("#errors_block_1").classList.remove('error-animation');
        }, 500);
    }
}

export function clearTables() {
    for (let i = 0; i < 11; i++) {
        for(let j = 0; j < 2; j++) {
            document.querySelector(`.tsi_cell_${i+1}_${j+1}`).value = "";
        }
    }

    document.querySelector("#errors_block_1").value = "";
    document.querySelector("#final_code").value = "";
    document.querySelector("#nastroiki").value = "";
}

export function isConvertibleToInteger(str) {
    if (typeof str !== 'string' || str.trim() === '') {
        return false;
    }
    
    const trimmed = str.trim();
    let number;
    
    if (/^0x[\da-fA-F]+$/.test(trimmed)) {
        number = parseInt(trimmed, 16);
    } else if (/^[\da-fA-F]+h$/.test(trimmed)) {
        number = parseInt(trimmed.slice(0, -1), 16);
    } else if (/^[01]+b$/.test(trimmed)) {
        number = parseInt(trimmed.slice(0, -1), 2);
    } else if (/^\d+$/.test(trimmed)) {
        number = parseInt(trimmed, 10);
    } else {
        return false;
    }
    
    return Number.isInteger(number) ? number : false;
}

export function handleString(line, config) {
    let asInt = Number.isInteger(isConvertibleToInteger(line[2]));
    let combinedFields = "";
    for (let i = 2; i < line.length; i++) {
        combinedFields += line[i] + " ";
    }
    
    line[2] = combinedFields.trim();
    if (asInt) {
        asInt = isConvertibleToInteger(line[2]);
        if (asInt >= 0 && asInt <= 255) {
            let stringToReturn = `T ${config.ip} 01 ${asInt.toString(16).padStart(2, '0')}`;
            config.ip = incrementHex(config.ip, 1);
            return stringToReturn;
        }

        handleError("Переполнение памяти");
        return -1;
    } else {
        if (line[2][0] == "C") {
            if (line[2].length < 4) {
                handleError(`Некорректно задана операндная часть ${line[2]}`);
                return -1;
            }
            if (
                (line[2][1] == '"' && line[2][line[2].length-1] == '"')
                ||
                ((line[2][1] == "'" && line[2][line[2].length-1] == "'"))            
            ) {
                let size = line[2].length-3;
                let stringToReturn = `T ${config.ip} ${size.toString(16).padStart(2, '0')} ${stringToAsciiHex(line[2].substring(2, line[2].length-1))}`
                config.ip = incrementHex(config.ip, size);
                return stringToReturn;
            }
        }
        if (line[2][0] == "X") {
            if (line[2].length < 4) {
                handleError(`Некорректно задана операндная часть ${line[2]}`);
                return -1;
            }
            if ((line[2].length - 3)%2 != 0) {
                handleError(`Некорректно задана операндная часть, количество символов в строке X"" должно быть четным`);
                return -1;
            }
            if (
                (line[2][1] == '"' && line[2][line[2].length-1] == '"')
                ||
                ((line[2][1] == "'" && line[2][line[2].length-1] == "'"))            
            ) {
                if (line[2].includes(" ")) {
                    handleError(`Некорректный операнд ${line[2]}`);
                    return -1;
                }
                let size = Math.ceil((line[2].length-3)/2);
                let stringToReturn = `T ${config.ip} ${size.toString(16).padStart(2, '0')} ${line[2].substring(2, line[2].length-1)}`;
                config.ip = incrementHex(config.ip, size);
                return stringToReturn;
            }
        }
        if (line[2].length < 3) {
            handleError(`Некорректно задана операндная часть ${line[2]}`);
            return -1;
        }
        // if (
        //     (line[2][0] == '"' && line[2][line[2].length-1] == '"')
        //     ||
        //     (line[2][0] == "'" && line[2][line[2].length-1] == "'")
        // ) {
        //     return {
        //         size: line[2].length-2,
        //         commandLine: [line[1], line[2]]
        //     }
        // }

        handleError(`Некорректный операнд ${line[2]}`);
        return -1;
    }
}