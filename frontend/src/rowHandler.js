import { CommandHandler } from "./commandHandler";
import { DataTypeHandler } from "./dataTypeHandler";
import { DirectiveHandler } from "./directiveHandler";
import { isValidMetkaName } from "./utils";
import { handleError } from "./utils";
import { isConvertibleToInteger } from "./utils";

export class RowHandler {

    constructor() {
        this.commandHandler = new CommandHandler();
        this.directiveHandler = new DirectiveHandler();
        this.dataTypeHandler = new DataTypeHandler();
    }

    isValidStartLine(config) {
        let line = config.currentUserCode[0];

        // 1) Check if first item exists and is valid metka name
        if (!isValidMetkaName(line[0], config)) {
            handleError("Некорректно задано имя программы");
            return -1;
        }

        // 2) Check if second value exists and equals to START
        if (line[1]?.toUpperCase() != "START") {
            handleError("Не найдена директива START");
            return -1;
        }

        // 3) Check if third value exists and equals to Integer (0-16777542)
        let programStart = isConvertibleToInteger(line[2]);
        if (programStart && programStart <= 16777215) {
            config.programStart = programStart;
        }
        else {
            handleError("Некорректно задан адрес начала программы");
            return -1;
        }

        config.programName = line[0];
        config.ip = programStart.toString(16).padStart(6, '0');
        return `H ${line[0]} ${programStart}`;
    }

    handle(config) {
        let line = config.currentUserCode[config.counter];
        if (line[0]?.toUpperCase() == "START" || line[1]?.toUpperCase() == "START") {
            handleError(`Директива START была указана более одного раза`);
            return -1;
        }

        let commandAsFirstValue = config.currentOperTable.find(el => el[0] == line[0]);
        if (commandAsFirstValue) {
            return this.commandHandler.handleNoMetka(line, commandAsFirstValue, config);
        }

        let commandAsSecondValue = config.currentOperTable.find(el => el[0] == line[1]);
        if (commandAsSecondValue) {
            return this.commandHandler.handleWithMetka(line, commandAsSecondValue, config);
        }

        let directiveAsValue = config.directives.some(el => line[0] == el || line[1] == el);
        if (directiveAsValue) {
            return this.directiveHandler.handle(line, config);
        }

        let datatypeAsValue = config.dataTypes.some(el => el == line[1]);
        if (datatypeAsValue) {
            return this.dataTypeHandler.handle(line, config);
        }
    }
}