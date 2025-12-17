import './style.css';
import './app.css';
import { AssemblerConfig } from './header';
import { TablesReader } from './tablesReader';
import { RowHandler } from './rowHandler';
import { OutputHandler } from './outputHandler';
import { clearTables, handleError } from './utils';

const config = new AssemblerConfig();
const tableReader = new TablesReader();
const rowHandler = new RowHandler();
const outputHandler = new OutputHandler();
document.querySelector("#user_code_input").value = config.defaultStringExample;

config.firstButton.addEventListener("click", () => {
    config.currentUserCode = tableReader.readUserCode();
    config.currentOperTable = tableReader.raedCommandTable(config);
    if (config.currentUserCode == -1 || config.currentOperTable == -1) {
        return;
    }

    let result = executeLine();
    if (result == -1) {
        config.finished = true;
    }
});

config.secondButton.addEventListener("click", () => {
    config.reset();
    outputHandler.reset();
    clearTables(config);
});

config.circle.addEventListener("click", () => {
    config.reset();
    outputHandler.reset();
    clearTables(config);
    config.currentUserCode = tableReader.readUserCode();
    config.currentOperTable = tableReader.raedCommandTable(config);

    if (config.currentUserCode == -1 || config.currentOperTable == -1) {
        return;
    }
    
    while (!config.finished) {
        let result = executeLine();
        if (result == -1) {
            config.finished = true;
        }
        console.log("executing line...");
    }
});

config.menu.addEventListener("change", function() {
    config.mode = parseInt(this.value);
    switch(config.mode) {
        case 1:
            document.querySelector("#user_code_input").value = config.defaultStringExample;
            break;
        case 2:
            document.querySelector("#user_code_input").value = config.defaultStringExampleOtn;
            break;
        case 3:
            document.querySelector("#user_code_input").value = config.defaultStringExampleSmeh;
            break;
        default:
            break;
    }
});

function executeLine() {
    if (config.finished) {
        return;
    }
    if (config.counter == 0) {
        clearTables(config);
        let result = rowHandler.isValidStartLine(config);
        if (result == -1) {
            config.reset();
            outputHandler.reset();
            return -1;
        }
        // TODO: Write current line to the output box
        outputHandler.pushFirstLine(config.programName, config.programStart);

        config.counter++;
    }
    else {
        if (config.counter >= config.currentUserCode.length) {
            handleError('Не найдена директива END');
            config.reset();
            outputHandler.reset();
            return -1;
        }
        if (config.currentUserCode[config.counter][0]?.toUpperCase() == "END") {
            let result = outputHandler.checkStats(config.currentTsiNames, config.currentExtDefs);
            if (result == -1) {
                config.reset();
                outputHandler.reset();
                return -1;
            }

            outputHandler.pushLastLine(config);
            config.finished = true;
        }
        else {
            let result = rowHandler.handle(config);
            if (result == -1) {
                config.reset();
                outputHandler.reset();
                return -1;
            }

            // TODO: Write ouput handler 
            if (result.split(" ")[1].toUpperCase() == "CSECT") {
                let statsGood = outputHandler.checkStats(config.currentTsiNames, config.currentExtDefs);
                if (statsGood == -1) {
                    config.reset();
                    outputHandler.reset();
                    return -1;
                }
                if (config.usedProgramNames.some(el => el == result.split(" ")[0])) {
                    handleError(`Имена секций должны быть уникальными, проверьте ${result.split(" ")[0]}`);
                    return -1;
                }
                config.programName = result.split(" ")[0];
                config.usedProgramNames.push(config.programName);
                outputHandler.pushLastLine(config);
                outputHandler.pushFirstLine(config.programName, config.programStart);
                config.subtleReset();
                outputHandler.subtleReset();

            } else {
                outputHandler.printTsiTable(config);
                outputHandler.pushLine(result, config);
                outputHandler.printTsiTable(config);
            }

            config.counter++;
        }
    }
    // rowHandler.handle(config, line);
}

