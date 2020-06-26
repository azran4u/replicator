import { Command } from 'commander';

interface CLI {
    rowsToAddBbox1: number;
    rowsToAddBbox2: number;
    searchBbox1: boolean;
    searchBbox2: boolean;
    deleteBbox1: boolean;
    deleteBbox2: boolean;
    printNumberOfRows: boolean;
    deleteAll: boolean;
    sendLog: boolean;
    fileToUploadToS3: string;
}

export function cli(): CLI {
    const res: CLI = {
        rowsToAddBbox1: 0,
        rowsToAddBbox2: 0,
        searchBbox1: false,
        searchBbox2: false,
        deleteBbox1: false,
        deleteBbox2: false,
        printNumberOfRows: false,
        deleteAll: false,        
        sendLog: false,
        fileToUploadToS3: ''
    };
    const program = new Command();
    program.version('0.0.1');

    program
        .option('-m, --number-of-rows-to-add-bbox1 <number>', 'number of rows to add to the db in bbox1')
        .option('-n, --number-of-rows-to-add-bbox2 <number>', 'number of rows to add to the db in bbox2')
        .option('-s, --geo-search-bbox1', 'print geo count in bbox1')
        .option('-e, --geo-search-bbox2', 'print geo count in bbox2')
        .option('-x, --delete-bbox1', 'delete all rows in bbox1')
        .option('-r, --delete-bbox2', 'delete all rows in bbox2')
        .option('-l, --send-log', 'send log and perf to s3')
        .option('-f, --file-to-upload <string>', 'upload file to s3')
        .option('-p, --print-current-number-of-rows', 'print current number of rows')                
        .option('-d, --delete-all', 'delete all rows in db');

    program.parse(process.argv);

    
    if (program.numberOfRowsToAddBbox1) {res.rowsToAddBbox1 = program.numberOfRowsToAddBbox1};
    if (program.numberOfRowsToAddBbox2) {res.rowsToAddBbox2 = program.numberOfRowsToAddBbox2};

    if (program.geoSearchBbox1) {res.searchBbox1 = true};
    if (program.geoSearchBbox2) {res.searchBbox2 = true};

    if (program.deleteBbox1) {res.deleteBbox1 = true};
    if (program.deleteBbox2) {res.deleteBbox2 = true};

    if (program.sendLog) {res.sendLog = true};
    if (program.fileToUpload) {res.fileToUploadToS3 = program.fileToUpload};
    if (program.printCurrentNumberOfRows) {res.printNumberOfRows = true};
    if (program.deleteAll) {res.deleteAll = true};

    return res;
}
