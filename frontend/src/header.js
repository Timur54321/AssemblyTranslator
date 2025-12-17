export class AssemblerConfig {
    directives = ["START", "END", "RESW", "RESB", "CSECT", "EXTDEF", "EXTREF"];
    dataTypes = ["WORD", "BYTE"];
    defaultStringExample = 
`PROG START
EXTDEF A1
EXTDEF A2
EXTREF B1
EXTREF B2
JMP A1
RESB 20
RESW 10
A1 JMP B2
L1 LOADR1 A2
A2 BYTE C"Hello!"
ADD R1 R2
SAVER1 B1
INT 200

PROG1 CSECT
EXTDEF C1
EXTREF D2
JMP C1
C1 LOADR1 D2
ADD R1 R2
SAVER1 D2
INT 200
END`;
    defaultStringExampleOtn = 
`PROG START
EXTDEF A1
EXTDEF A2
JMP [A1]
B1 RESB 20
B2 RESW 10
A1 JMP [B2]
L1 LOADR1 [A2]
A2 BYTE C"Hello!"
ADD R1 R2
SAVER1 [B1]
INT 200

PROG1 CSECT
EXTDEF C1
JMP [C1]
D2 RESW 20
ADD R1 R2
C1 SAVER1 [D2]
INT 200
END`;
    defaultStringExampleSmeh = 
`PROG START
EXTDEF A1
EXTDEF A2
EXTREF B1
EXTREF B2
JMP [A1]
RESB 20
RESW 10
A1 JMP B2
L1 LOADR1 A2
A2 BYTE C"Hello!"
ADD R1 R2
SAVER1 B1
INT 200

PROG1 CSECT
EXTDEF C1
EXTREF D2
L3 RESW 20
JMP C1
C1 LOADR1 D2
ADD R1 R2
SAVER1 [L3]
INT 200
END`;
    firstButton = document.querySelector(".firstButton");
    secondButton = document.querySelector("#second_gothrough");
    circle = document.querySelector(".circle");
    menu = document.querySelector("#adressFormat");
    tsiBlock = document.querySelector("#tsiText");

    RtoVal = {
        "R1": "0",
        "R2": "1",
        "R3": "2",
        "R4": "3",
        "R5": "4",
        "R6": "5",
        "R7": "6",
        "R8": "7",
        "R9": "8",
        "R10": "9",
        "R11": "A",
        "R12": "B",
        "R13": "C",
        "R14": "D",
        "R15": "E",
        "R16": "F",
    };

    constructor() {
        this.programName = "";
        this.programStart = null;
        this.nastroikiText = "";
        this.ip = 0;
        this.counter = 0;            // lines been read
        this.tsiCounter = 0;
        this.currentTsiNames = [];
        this.ocell_counter = 15;
        this.toDisplay = [];
        this.order = "EXTDEF";
        this.currentUserCode = null;
        this.currentExtDefs = [];
        this.usedProgramNames = [];
        this.currentExtRefs = [];
        this.currentOperTable = [];
        this.finished = false;
        this.mode = 1;                  // 1-прямая; 2-относительная; 3-смешанная
        this.defaultOperations = [
            ["JMP", "1", "4"],
            ["LOADR1", "2", "4"],
            ["LOADR2", "3", "4"],
            ["ADD", "4", "2"],
            ["SAVER1", "5", "4"],
            ["NOP", "6", "1"],
            ["INT", "7", "2"],
            ["SUB", "8", "2"],
        ];

        for (let i = 0; i < this.defaultOperations.length; i++) {
            for (let j = 0; j < 3; j++) {
                document.querySelector(`.ocell_${i+1}_${j+1}`).value = this.defaultOperations[i][j];
            }
        }
        document.querySelector("#user_code_input").addEventListener("keydown", function(e) {
            if (e.key === 'Tab') {
                    e.preventDefault();
                    
                    const start = this.selectionStart;
                    const end = this.selectionEnd;
                    
                    this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                    
                    this.selectionStart = this.selectionEnd = start + 4;
                }
        });
    }

    reset() {
        this.programName = "";
        this.programStart = null;
        this.ip = 0;
        this.counter = 0;            // lines been read
        this.tsiCounter = null;
        this.currentTsiNames = [];
        this.ocell_counter = 15;
        this.currentUserCode = null;
        this.currentOperTable = [];
        this.toDisplay = [];
        this.finished = false;
        this.nastroikiText = "";
        this.usedProgramNames = [];
        this.currentExtDefs = [];
        this.order = "EXTDEF";
        this.currentExtRefs = [];
    }

    subtleReset() {
        this.programStart = 0;
        this.ip = "000000";
        this.currentTsiNames = [];
        this.toDisplay = [];
        this.finished = false;
        this.currentExtDefs = [];
        this.order = "EXTDEF";
        this.currentExtRefs = [];
    }

}