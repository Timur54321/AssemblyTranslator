import { decrementHex, hexSubtract, to3ByteHex } from "./hexHandler";
import { handleError, isValidMetkaName } from "./utils";

export class OutputHandler {

    constructor() {
        this.suspiciousValues = [];
        this.currentLine = 0;
        this.allLines = [];
        this.used = [];
        this.mks = [];
        this.localStart = 0;
        this.tsiOld = "";
    }

    reset() {
        this.suspiciousValues = [];
        this.currentLine = 0;
        this.allLines = [];
        this.used = [];
        this.mks = [];
        this.localStart = 0;
        this.tsiOld = "";
    }

    subtleReset() {
        this.suspiciousValues = [];
        this.used = [];
        this.mks = [];
    }

    printTsiTable(config) {
        let resultString = this.tsiOld;
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
            if (config.currentExtRefs.some(el => el == config.currentTsiNames[i][0])) continue;
            let toAdd = "";
            if (config.currentExtDefs.some(el => el == config.currentTsiNames[i][0])) toAdd = "ВИ";
            resultString += `${config.currentTsiNames[i][0].padEnd(6, ' ')} ${toAdd.padEnd(6, ' ')} ${config.currentTsiNames[i][1].padEnd(10, ' ')} ${config.programName.padEnd(6, ' ')}\n`;

            if (i+1 == config.currentTsiNames.length) {
                startPos = i+1;
            }
        }

        for (let i = 0; i < config.toDisplay.length; i++) {
            // document.querySelector(`.tsi_cell_${i+1+startPos}_1`).value = config.toDisplay[i][0];
            // document.querySelector(`.tsi_cell_${i+1+startPos}_2`).value = config.toDisplay[i][1];
            // document.querySelector(`.tsi_cell_${i+1+startPos}_3`).value = config.toDisplay[i][2];
            let toAdd = "";
            if (config.currentExtDefs.some(el => el == config.toDisplay[i][0])) toAdd = "ВИ";
            if (config.currentExtRefs.some(el => el == config.toDisplay[i][0])) toAdd = "ВС";
            resultString += `${config.toDisplay[i][0].padEnd(6, ' ')} ${toAdd.padEnd(6, ' ')} ${config.toDisplay[i][1].padEnd(10, ' ')} ${config.toDisplay[i][2].padEnd(6, ' ')} ${config.toDisplay[i][3] ? config.toDisplay[i][3].padEnd(6, ' ') : ""}\n`;
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
                this.mks.push([printLine[1], config.currentExtRefs.find(el => el == splitLine)]);
            }

            if (!search) {
                if (mode == 1) {
                    this.suspiciousValues.push({
                        ind: this.currentLine,
                        value: splitLine
                    });
                    config.toDisplay.push([splitLine, "FFFFFF", config.programName, printLine[1]]);
                    
                } else {
                    this.suspiciousValues.push({
                        ind: this.currentLine,
                        value: splitLine.substring(1, splitLine.length-1),
                        ip: printLine[1],
                    });
                    config.toDisplay.push([splitLine.substring(1, splitLine.length-1), "FFFFFF", config.programName, printLine[1]]);
                    
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

        if (line.startsWith("D ")) {
            this.used.push(line.split(" ")[1]);
            this.suspiciousValues.push({
                ind: this.currentLine,
                value: line.split(" ")[1]
            });
            console.log([line.split(" ")[1], "FFFFFF", config.programName]);
            config.toDisplay.push([line.split(" ")[1], "FFFFFF", config.programName]);
        }
        else if (line.startsWith("R ")) {
            console.log([line.split(" ")[1], "FFFFFF", config.programName]);
            config.toDisplay.push([line.split(" ")[1], "", config.programName]);
        } else {
            config.order = "CODE";
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

    checkStats(currentTsiNames, currentExtDefs) {
        let ourValue = this.used.find(el => !currentTsiNames.some(val => val[0] == el))
        if (ourValue) {
            console.log(ourValue);
            if (currentExtDefs.includes(ourValue)) {
                handleError(`Для внешнего имени ${ourValue} не было определения`);
            } else {
                handleError(`Не для всех меток было присвоено значение. Проверьте ${ourValue}`);
            }
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
            this.allLines.push(['M', `${this.mks[i][0]} ${this.mks[i][1] ? this.mks[i][1] : ""}`]);
            this.currentLine++;
        }
        this.allLines.push(['E', `${config.programStart.toString(16).padStart(6, '0')}\n`]);
        this.currentLine+=1;
        this.tsiOld = config.tsiBlock.value;
        let size = decrementHex(config.ip, config.programStart);
        this.allLines[this.localStart].push(size.toString(16).padStart(6, '0'));
        this.localStart = this.currentLine;
        this.printLines();
    }
}