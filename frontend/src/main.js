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

    executeLine();
});

config.secondButton.addEventListener("click", () => {
    config.reset();
    outputHandler.reset();
    clearTables();
})

function executeLine() {
    if (config.finished) {
        return;
    }
    if (config.counter == 0) {
        clearTables();
        let result = rowHandler.isValidStartLine(config);
        console.log(result);
        if (result == -1) {
            config.reset();
            outputHandler.reset();
            return;
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
            return;
        }
        if (config.currentUserCode[config.counter][0]?.toUpperCase() == "END") {
            let result = outputHandler.checkStats(config.currentTsiNames);
            if (result == -1) {
                config.reset();
                outputHandler.reset();
                return;
            }

            outputHandler.pushLastLine(config);
            config.finished = true;
        }
        else {
            let result = rowHandler.handle(config);
            if (result == -1) {
                config.reset();
                outputHandler.reset();
                return;
            }

            // TODO: Write ouput handler 
            outputHandler.printTsiTable(config);
            outputHandler.pushLine(result, config);

            config.counter++;
        }
    }
    // rowHandler.handle(config, line);
}

