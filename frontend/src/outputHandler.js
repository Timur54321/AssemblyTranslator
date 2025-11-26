import { decrementHex } from "./hexHandler";
import { handleError, isValidMetkaName } from "./utils";

export class OutputHandler {

    constructor() {
        this.suspiciousValues = [];
        this.currentLine = 0;
        this.allLines = [];
        this.used = [];
    }

    reset() {
        this.suspiciousValues = [];
        this.currentLine = 0;
        this.allLines = [];
        this.used = [];
    }

    printTsiTable(config) {
        for (let i = 0; i < config.currentTsiNames.length; i++) {
            document.querySelector(`.tsi_cell_${i+1}_1`).value = config.currentTsiNames[i][0];
            document.querySelector(`.tsi_cell_${i+1}_2`).value = config.currentTsiNames[i][1];
        }
    }

    checkSuspicious(config) {
        for (let i = 0; i < this.suspiciousValues.length; i++) {
            let foundElement = config.currentTsiNames.find(el => el[0] == this.suspiciousValues[i].value);
            if (foundElement) {
                let ind = this.suspiciousValues[i].ind
                this.allLines[ind][this.allLines[ind].length-1] = foundElement[1];
            }
        }
    }

    pushLine(line, config) {
        console.log(line);
        let printLine = line.split(' ');
        let splitLine = line.split(" ").reverse()[0];
        if (splitLine.startsWith("METKA")) {
            splitLine = splitLine.substring(5);
            this.used.push(splitLine);
            let search = config.currentTsiNames.find(el => el[0] == splitLine);
            if (!search) {
                this.suspiciousValues.push({
                    ind: this.currentLine,
                    value: splitLine
                });
                printLine = line.split(' ');
                printLine.pop();
                printLine.push("FFFFFF");
            }
            else {
                printLine = line.split(' ');
                printLine.pop();
                printLine.push(search[1]);
            }
        }
        this.checkSuspicious(config);
        this.allLines.push(printLine);
        this.printLines();
        this.currentLine++;
    }

    printLines() {
        let resultString = "";
        for (let i = 0; i < this.allLines.length; i++) {
            resultString += this.allLines[i].join(' ') + "\n";
        }

        document.querySelector("#final_code").value = resultString;
    }

    checkStats(currentTsiNames) {
        if (this.used.some(el => !currentTsiNames.some(val => val[0] == el))) {
            handleError("Не для всех меток было присвоено значение");
            return -1;
        }
        return "success";
    }

    pushFirstLine(programName, programStart) {
        this.allLines.push(['H', programName, `${programStart.toString(16).padStart(6, '0')}`]);
        this.printLines();
        this.currentLine++;
    }

    pushLastLine(config) {
        this.allLines.push(['E', `${config.programStart.toString(16).padStart(6, '0')}`]);
        let size = decrementHex(config.ip, config.programStart);
        this.allLines[0].push(size.toString(16).padStart(6, '0'));
        this.printLines();
    }
}