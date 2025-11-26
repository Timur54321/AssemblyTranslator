import { incrementHex } from "./hexHandler";
import { handleError, isConvertibleToInteger, isValidMetkaName } from "./utils";

export class CommandHandler {
    handleNoMetka(line, commandLine, config) {
        let commandSize = parseInt(commandLine[2]);
        let size;
        let stringToReturn;

        switch(commandSize) {
            case 1:
                // 1) Check if there is no operand
                if (line[1]) {
                    handleError(`Указан лишний операнд ${line[1]}`);
                    return -1;
                }
                size = parseInt(commandLine[1])*4;
                stringToReturn = `T ${config.ip} 01 ${size.toString(16).padStart(2, '0')}`;
                config.ip = incrementHex(config.ip, 1);
                if (config.ip == -1) {
                    return -1;
                }

                return stringToReturn;
            case 2:
                // 1) Check if both operands are Registers
                // 1.1) or there is only one operand integer (0-255)

                if (config.RtoVal[line[1]] && config.RtoVal[line[2]]) {
                    if (line[3]) {
                        handleError(`Указан лишний операнд ${line[3]}`);
                        return -1;
                    }
                    size = parseInt(commandLine[1])*4;
                    stringToReturn = `T ${config.ip} 02 ${size.toString(16).padStart(2, '0')} ${config.RtoVal[line[1]]} ${config.RtoVal[line[2]]}`;
                    config.ip = incrementHex(config.ip, 2);
                    if (config.ip == -1) {
                        return -1;
                    }
                } else if (Number.isInteger(isConvertibleToInteger(line[1]))) {
                    if (line[2]) {
                        handleError(`Указан лишний операнд ${line[2]}`);
                        return -1;
                    }
                    if (isConvertibleToInteger(line[1]) > 255) {
                        handleError(`Произошло переполнение памяти. Некорректно указан операнд ${line[1]}`);
                        return -1;
                    }
                    size = parseInt(commandLine[1])*4;
                    stringToReturn = `T ${config.ip} 02 ${size.toString(16).padStart(2, '0')} ${isConvertibleToInteger(line[1]).toString(16).padStart(2, '0')}`;
                    config.ip = incrementHex(config.ip, 2);
                    if (config.ip == -1) {
                        return -1;
                    }
                }
                else {
                    handleError(`Некорректно задана операндная часть в строке ${line}`);
                    return -1;
                }

                return stringToReturn;
            case 4:
                // 1) Check if operand is metka
                // 1.1) or operand is integer (0-16777254)
                if (line[2]) {
                    handleError(`Указан лишний операнд ${line[2]}`);
                }

                if (isValidMetkaName(line[1], config)) {
                    size = parseInt(commandLine[1])*4+1;
                    stringToReturn = `T ${config.ip} 04 ${size.toString(16).padStart(2, '0')} METKA${line[1]}`;
                    config.ip = incrementHex(config.ip, 4);
                    if (config.ip == -1) {
                        return -1;
                    }
                    if (config.ip == -1) {
                        return -1;
                    }
                } else if (Number.isInteger(isConvertibleToInteger(line[1]))) {
                    if (isConvertibleToInteger(line[1]) > 16777215) {
                        handleError(`Произошло переполнение памяти. Некорректно указан операнд ${line[1]}`);
                        return -1;
                    }
                    size = parseInt(commandLine[1])*4;
                    stringToReturn = `T ${config.ip} 04 ${size.toString(16).padStart(2, '0')} ${isConvertibleToInteger(line[1]).toString(16).padStart(6, '0')}`;
                    config.ip = incrementHex(config.ip, 4);
                    if (config.ip == -1) {
                        return -1;
                    }
                } else {
                    handleError(`Некореектно задана операндная часть в строке ${line}`);
                    return -1;
                }

                return stringToReturn;
            default:
                return -1;
        }
    }

    handleWithMetka(line, commandLine, config) {
        let commandSize = parseInt(commandLine[2]);
        let size;
        let stringToReturn;

        if (!isValidMetkaName(line[0], config)) {
            handleError(`Некорректно указана метка ${line[0]}`);
            return -1;
        }

        if (config.currentTsiNames.some(el => el[0] == line[0])) {
            handleError(`Метка ${line[0]} уже была объявлена`);
            return -1;
        }
        config.currentTsiNames.push([line[0], config.ip]);

        switch(commandSize) {
            case 1:
                // 1) Check if there is no operand
                if (line[2]) {
                    handleError(`Указан лишний операнд ${line[2]}`);
                    return -1;
                }
                size = parseInt(commandLine[1])*4;
                stringToReturn = `T ${config.ip} 01 ${size.toString(16).padStart(2, '0')}`;
                config.ip = incrementHex(config.ip, 1);
                if (config.ip == -1) {
                    return -1;
                }

                return stringToReturn;
            case 2:
                // 1) Check if both operands are Registers
                // 1.1) or there is only one operand integer (0-255)

                if (config.RtoVal[line[2]] && config.RtoVal[line[3]]) {
                    if (line[4]) {
                        handleError(`Указан лишний операнд ${line[4]}`);
                        return -1;
                    }
                    size = parseInt(commandLine[1])*4;
                    stringToReturn = `T ${config.ip} 02 ${size.toString(16).padStart(2, '0')} ${config.RtoVal[line[2]]} ${config.RtoVal[line[3]]}`;
                    config.ip = incrementHex(config.ip, size);
                    if (config.ip == -1) {
                        return -1;
                    }
                } else if (Number.isInteger(isConvertibleToInteger(line[2]))) {
                    if (line[3]) {
                        handleError(`Указан лишний операнд ${line[3]}`);
                        return -1;
                    }
                    if (isConvertibleToInteger(line[2]) > 255) {
                        handleError(`Произошло переполнение памяти. Некорректно указан операнд ${line[2]}`);
                        return -1;
                    }
                    size = parseInt(commandLine[1])*4;
                    stringToReturn = `T ${config.ip} 02 ${size.toString(16).padStart(2, '0')} ${isConvertibleToInteger(line[2]).toString(16).padStart(2, '0')}`;
                    config.ip = incrementHex(config.ip, 2);
                    if (config.ip == -1) {
                        return -1;
                    }
                }
                else {
                    handleError(`Некорректно задана операндная часть в строке ${line}`);
                    return -1;
                }

                return stringToReturn;
            case 4:
                // 1) Check if operand is metka
                // 1.1) or operand is integer (0-16777254)
                if (line[3]) {
                    handleError(`Указан лишний операнд ${line[3]}`);
                }

                if (isValidMetkaName(line[2], config)) {
                    size = parseInt(commandLine[1])*4+1;
                    stringToReturn = `T ${config.ip} 04 ${size.toString(16).padStart(2, '0')} METKA${line[2]}`;
                    config.ip = incrementHex(config.ip, 4);
                    if (config.ip == -1) {
                        return -1;
                    }
                } else if (Integer.isInteger(isConvertibleToInteger(line[2]))) {
                    if (isConvertibleToInteger(line[2]) > 16777215) {
                        handleError(`Произошло переполнение памяти. Некорректно указан операнд ${line[2]}`);
                        return -1;
                    }
                    size = parseInt(commandLine[1])*4;
                    stringToReturn = `T ${config.ip} 04 ${size.toString(16).padStart(2, '0')} ${isConvertibleToInteger(line[2]).toString(16).padStart(6, '0')}`;
                    config.ip = incrementHex(config.ip, 4);
                    if (config.ip == -1) {
                        return -1;
                    }
                } else {
                    handleError(`Некореектно задана операндная часть в строке ${line}`);
                    return -1;
                }

                return stringToReturn;
            default:
                return -1;
        }
    }
}