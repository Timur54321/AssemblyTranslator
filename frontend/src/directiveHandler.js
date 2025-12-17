import { incrementHex } from "./hexHandler";
import { handleError, isConvertibleToInteger, isValidMetkaName } from "./utils";

export class DirectiveHandler {
    handle(line, config) {
        let splitLine = line;
        let currentDirective;
        let size, stringToReturn;

        if (splitLine[0].toUpperCase() == "EXTDEF") {
            if (config.order != "EXTDEF") {
                handleError("Нарушена структура кода. Пожалуйста придерживайтесь правила EXTDEF -> EXTREF -> основной код");
                return -1;
            }
            if (!isValidMetkaName(splitLine[1], config)) {
                handleError(`Некорректно задана метка ${splitLine[1]}`);
                return -1;
            }

            if (splitLine[2]) {
                handleError(`Указан лишний операнд ${splitLine[2]}`);
                return -1;
            }

            if (config.currentExtDefs.includes(splitLine[1])) {
                handleError(`Метка ${splitLine[1]} уже помечено как внешнее имя`);
                return -1;
            }

            config.currentExtDefs.push(splitLine[1]);
            return `D ${splitLine[1]} FFFFFF`;
        }

        if (splitLine[0].toUpperCase() == "EXTREF") {
            if (config.order == "CODE") {
                handleError("Нарушена структура кода. Пожалуйста придерживайтесь правила EXTDEF -> EXTREF -> основной код");
                return -1;
            }
            config.order = "EXTREF";
            if (!isValidMetkaName(splitLine[1], config)) {
                handleError(`Некорректно задана метка ${splitLine[1]}`);
                return -1;
            }

            if (splitLine[2]) {
                handleError(`Указан лишний операнд ${splitLine[2]}`);
                return -1;
            }

            if (config.currentExtDefs.includes(splitLine[1])) {
                handleError(`Не допускаются одинаковые имена внешних имен и внешних ссылок, проверьте ${splitLine[1]}`);
                return -1;
            }
            if (config.currentExtRefs.includes(splitLine[1])) {
                handleError(`Внешняя ссылка ${splitLine[1]} уже была объявлена`);
                return -1;
            }

            config.currentExtRefs.push(splitLine[1]);
            config.currentTsiNames.push([splitLine[1], "000000"]);
            return `R ${splitLine[1]}`;
        }

        if (splitLine[0]?.toUpperCase() == "RESB" || splitLine[1]?.toUpperCase() == "RESB") currentDirective = "RESB";
        else currentDirective = "RESW";

        if (splitLine[1]?.toUpperCase() == currentDirective) {
            if (!isValidMetkaName(splitLine[0], config)) {
                handleError(`Некорректно задано имя метки ${splitLine[0]}`);
                return -1;
            }

            if (config.currentTsiNames.some(el => el[0] == splitLine[0])) {
                handleError(`Метка ${splitLine[0]} уже была объявлена`);
                return -1;
            }
            config.currentTsiNames.push([splitLine[0], config.ip]);
            config.tsiCounter++;

            if (!isConvertibleToInteger(splitLine[2])) {
                handleError(`Некорректно задана операндная часть ${splitLine[2]}`);
                return -1;
            }
            if (currentDirective == "RESW") {
                size = isConvertibleToInteger(splitLine[2])*3;
            } else {
                size = isConvertibleToInteger(splitLine[2]);
            }
            stringToReturn = `T ${config.ip} ${size.toString(16).padStart(2, '0')}`;
            config.ip = incrementHex(config.ip, size);
        } else {
            if (!isConvertibleToInteger(splitLine[1])) {
                handleError(`Некорректно задана операндная часть ${splitLine[1]}`);
                return -1;
            }
            if (currentDirective == "RESW") {
                size = isConvertibleToInteger(splitLine[1])*3;
            } else {
                size = isConvertibleToInteger(splitLine[1]);
            }
            stringToReturn = `T ${config.ip} ${size.toString(16).padStart(2, '0')}`;
            config.ip = incrementHex(config.ip, size);
        }
        return stringToReturn;
    }
}