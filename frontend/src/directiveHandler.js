import { incrementHex } from "./hexHandler";
import { handleError, isConvertibleToInteger, isValidMetkaName } from "./utils";

export class DirectiveHandler {
    handle(line, config) {
        let splitLine = line;
        let currentDirective;
        let size, stringToReturn;
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