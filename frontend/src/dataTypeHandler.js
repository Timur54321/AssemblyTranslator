import { incrementHex } from "./hexHandler";
import { handleError, handleString, isConvertibleToInteger, isValidMetkaName } from "./utils";

export class DataTypeHandler {
    handle(line, config) {
        if (!isValidMetkaName(line[0], config)) {
            handleError(`Некорректно задано имя метки ${line[0]}`);
            return -1;
        }

        if (config.currentTsiNames.some(el => el[0] == line[0])) {
            handleError(`Метка ${line[0]} уже была объявлена`);
            return -1;
        }
        config.currentTsiNames.push([line[0], config.ip]);

        if (line[1].toUpperCase() == "BYTE") {
            return handleString(line, config);
        }

        if (line[1].toUpperCase() == "WORD") {
            if (!Number.isInteger(isConvertibleToInteger(line[2]))) {
                handleError(`Некорректно указан операнд ${line[2]}`);
                return -1;
            }

            if (isConvertibleToInteger(line[2]) > 16777215) {
                handleError(`Переполнение памяти, некорректно указан операнд ${line[2]}`);
                return -1;
            }

            if (line[3]) {
                handleError(`Указан лишний операнд ${line[3]}`);
                return -1;
            }

            let stringToReturn = `T ${config.ip} 03 ${isConvertibleToInteger(line[2]).toString(16).padStart(6, '0')}`;
            config.ip = incrementHex(config.ip, 3);
            return stringToReturn;
        }
    }
}