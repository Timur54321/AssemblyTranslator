import { handleError, isValidMetkaName } from "./utils";
import { isConvertibleToInteger } from "./utils";

export class TablesReader {
    readUserCode() {
        const code = document.querySelector("#user_code_input").value.split("\n")
            .map(el => this.#trimSpacesOutsideQuotes(el.trim()))
            .filter(el => el != "")
            .map(el => el.split(" "));

        return code;
    }

    raedCommandTable(conf) {
        let commandTable = [];
        let foundCommands = new Set();
        let foundOperationCodes = new Set();
        for (let i = 0; i < conf.ocell_counter-1; i++) {
            let [first, second, third] = [document.querySelector(`.ocell_${i+1}_1`).value, document.querySelector(`.ocell_${i+1}_2`).value, document.querySelector(`.ocell_${i+1}_3`).value];
            if (first == "") continue;
            if (!isValidMetkaName(first, conf)) {
                handleError(`Некорректно задано имя команды ${first}`);
                return -1;
            }
            if (second.trim() == "" || third.trim() == "") {
                handleError("Неверно задана таблица кодов операций");
                return -1;
            }

            if (!isConvertibleToInteger(second)) {
                handleError(`Неверно задан код операции ${second}`);
                return -1;
            }

            if (isConvertibleToInteger(second) > 255) {
                handleError(`Неверно задан код операции ${second}`);
                return -1;
            }

            foundCommands.add(first.toUpperCase());
            foundOperationCodes.add(isConvertibleToInteger(second));

            if (!["1", "2", "4"].includes(third.trim())) {
                handleError("Длины команд могут быть 1, 2 или 4");
                return -1;
            }

            commandTable.push([first,second,third]);
        }

        if (commandTable.length != foundCommands.size) {
            handleError("Не допускаются дупликаты операций в таблице кодов операций");
            return -1
        }
        if (commandTable.length != foundOperationCodes.size) {
            handleError("Не допускаются дупликаты кодов операций");
            return -1;
        }
        return commandTable;
    }

    #trimSpacesOutsideQuotes(str) {
        let currentQuotes = undefined;
        let numberIndexes = [];
        if (str.indexOf('"') == -1 && str.indexOf("'") == -1) {
            currentQuotes = undefined;
        }else {
            if (str.indexOf('"') == -1) {
                currentQuotes = "'";
            }
            else if (str.indexOf("'") == -1) {
                currentQuotes = '"';
            }
            else if (str.indexOf('"') < str.indexOf("'")) {
                currentQuotes = '"';
            }
            else {
                currentQuotes = "'";
            }
        }

        for (let i = 0; i < str.length; i++) {
            if (str[i] == currentQuotes) {
                numberIndexes.push(i);
            }
        }
        let result;
        if (numberIndexes.length < 2) {
            result = str.replace(/ +/g, " ");
        }
        else {
            result = str.substring(0, numberIndexes[0]).replace(/ +/g, " ") + str.substring(numberIndexes[0], numberIndexes[numberIndexes.length-1]) + str.substring(numberIndexes[numberIndexes.length-1]).replace(/ +/g, " ");
        }

        return result;
    
    }
}