export class AssemblerConfig {
    directives = ["START", "END", "RESW", "RESB"];
    dataTypes = ["WORD", "BYTE"];
    defaultStringExample = 
`PROG START
H2 BYTE 2
JMP L1
A1 RESB 10
A2 RESW 20
B1 WORD 4096
B3 BYTE C"Hello!"
B4 BYTE 128
L1 LOADR1 B1
LOADR2 B4
ADD R1 R2
SUB R1 R2
SAVER1 B1
INT 200
NOP
END`;
    defaultStringExampleOtn = 
`PROG START
H2 BYTE 2
JMP [L1]
A1 RESB 10
A2 RESW 20
B1 WORD 4096
B3 BYTE C"Hello!"
B4 BYTE 128
L1 LOADR1 [B1]
LOADR2 [B4]
ADD R1 R2
SUB R1 R2
SAVER1 [B1]
INT 200
NOP
END`;
    defaultStringExampleSmeh = 
`PROG START
H2 BYTE 2
JMP [L1]
A1 RESB 10
A2 RESW 20
B1 WORD 4096
B3 BYTE C"Hello!"
B4 BYTE 128
L1 LOADR1 B1
LOADR2 B4
ADD R1 R2
SUB R1 R2
SAVER1 [B1]
INT 200
NOP
END`;
    firstButton = document.querySelector(".firstButton");
    secondButton = document.querySelector("#second_gothrough");
    circle = document.querySelector(".circle");
    menu = document.querySelector("#adressFormat");

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
        this.currentUserCode = null;
        this.currentOperTable = null;
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
        this.currentOperTable = null;
        this.toDisplay = [];
        this.finished = false;
        this.nastroikiText = "";
    }

}