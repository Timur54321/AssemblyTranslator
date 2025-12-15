import { decrementHex, hexSubtract, to3ByteHex } from "./hexHandler";
import { handleError, isValidMetkaName } from "./utils";

export class OutputHandler {

    constructor() {
        this.suspiciousValues = [];
        this.currentLine = 0;
        this.allLines = [];
        this.used = [];
        this.mks = [];
    }

    reset() {
        this.suspiciousValues = [];
        this.currentLine = 0;
        this.allLines = [];
        this.used = [];
        this.mks = [];
    }

    printTsiTable(config) {
        let resultString = "";
        for (let i = 0; i < 21; i++) {
            for(let j = 0; j < 3; j++) {
                // document.querySelector(`.tsi_cell_${i+1}_${j+1}`).value = "";
                config.tsiBlock.value = "";
            }
        }
        let startPos = 0;
        for (let i = 0; i < config.currentTsiNames.length; i++) {
            // document.querySelector(`.tsi_cell_${i+1}_1`).value = config.currentTsiNames[i][0];
            // document.querySelector(`.tsi_cell_${i+1}_2`).value = config.currentTsiNames[i][1];
            resultString += `${config.currentTsiNames[i][0].padEnd(8, ' ')} ${config.currentTsiNames[i][1].padEnd(8, ' ')}\n`;

            if (i+1 == config.currentTsiNames.length) {
                startPos = i+1;
            }
        }

        for (let i = 0; i < config.toDisplay.length; i++) {
            // document.querySelector(`.tsi_cell_${i+1+startPos}_1`).value = config.toDisplay[i][0];
            // document.querySelector(`.tsi_cell_${i+1+startPos}_2`).value = config.toDisplay[i][1];
            // document.querySelector(`.tsi_cell_${i+1+startPos}_3`).value = config.toDisplay[i][2];
            resultString += `${config.toDisplay[i][0].padEnd(8, ' ')} ${config.toDisplay[i][1].padEnd(8, ' ')} ${config.toDisplay[i][2].padEnd(8, ' ')}\n`;
        }

        config.tsiBlock.value = resultString;
    }

    checkSuspicious(config) {
        for (let i = 0; i < this.suspiciousValues.length; i++) {
            let mode = 1;
            let ip;
            let foundElement = config.currentTsiNames.find(el => {
                if (el[0] == this.suspiciousValues[i].value) {
                    if (this.suspiciousValues[i].ip) {
                        mode = 2;
                        ip = this.suspiciousValues[i].ip;
                    }
                    return true;
                }
            });
            if (foundElement) {
                config.toDisplay = config.toDisplay.filter(el => el[0] != foundElement[0]);
                let ind = this.suspiciousValues[i].ind;
                if (mode == 1) {
                    this.allLines[ind][this.allLines[ind].length-1] = foundElement[1];
                } else {
                    this.allLines[ind][this.allLines[ind].length-1] = to3ByteHex(hexSubtract(ip, "4", foundElement[1]));
                }
            }
        }
    }

    pushLine(line, config) {
        let printLine = line.split(' ');
        let splitLine = line.split(" ").reverse()[0];
        if (splitLine.startsWith("METKA")) {
            let mode = 1;
            let search;
            splitLine = splitLine.substring(5);

            if (splitLine[0]=="[") {
                mode = 2;
                this.used.push(splitLine.substring(1, splitLine.length-1));
                search = config.currentTsiNames.find(el => el[0] == splitLine.substring(1, splitLine.length-1));
            }
            else {
                this.used.push(splitLine);
                search = config.currentTsiNames.find(el => el[0] == splitLine);
                this.mks.push(printLine[1]);
            }

            if (!search) {
                if (mode == 1) {
                    this.suspiciousValues.push({
                        ind: this.currentLine,
                        value: splitLine
                    });
                    config.toDisplay.push([splitLine, "FFFFFF", printLine[1]]);
                    
                } else {
                    this.suspiciousValues.push({
                        ind: this.currentLine,
                        value: splitLine.substring(1, splitLine.length-1),
                        ip: printLine[1],
                    });
                    config.toDisplay.push([splitLine.substring(1, splitLine.length-1), "FFFFFF", printLine[1]]);
                    
                }

                printLine = line.split(' ');
                printLine.pop();
                printLine.push("FFFFFF");
            }
            else {
                printLine = line.split(' ');
                printLine.pop();

                if (mode == 1) {
                    printLine.push(search[1]);
                } else {
                    printLine.push(to3ByteHex(hexSubtract(printLine[1], "4", search[1])));
                }
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
        for (let i = 0; i < this.mks.length; i++) {
            this.allLines.push(['M', `${this.mks[i]}`]);
        }
        this.allLines.push(['E', `${config.programStart.toString(16).padStart(6, '0')}`]);
        let size = decrementHex(config.ip, config.programStart);
        this.allLines[0].push(size.toString(16).padStart(6, '0'));
        this.printLines();
    }
}