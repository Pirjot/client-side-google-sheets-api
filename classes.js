//classes.js, Developed by Pirjot Atwal
//JS Class files for backend.js running

class Sheet {
    /** Sheet constructor
     * The sheet is an object that represents a Google Sheet and
     * has attributes and methods that allow a simplified interaction
     * with the Google Sheet. On construction, the Sheet object will also
     * initialize its rows, displaying all the info to the user 
     * (currently hooked up to the pre object found in backend.js.) 
     * The current attributes/methods are as follows:
     * 
     * URL, api_key, client_id, token: Defined through parameter declaration
     * Variables: 
     * loaded, rows, numOfRows, maxRow
     * Methods:
     * init, normalizeRows, readAll, addRow, addCol, updateAll
     * 
     * @param {string} URL 
     * @param {string} api_key 
     * @param {string} client_id 
     * @param {JSON Obj} token 
     */
    constructor(URL, api_key, client_id, token) {
        if (typeof (URL) == "string" && URL.length > 0) {
            this.URL = URL;
        } else {
            this.URL = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit";
        }
        this.id = new RegExp("\\/d\\/(.*?)(\\/|$)").exec(this.URL)[1];
        this.api = api_key;
        this.client_id = client_id;
        this.token = token;
        this.loaded = false;
        this.init();
    }
    /** init()
     * Initializes by requesting response from Google Sheets and storing
     * response in this.contents.
     * Parses variables and fills Sheet object with rows, cols, 
     * numOfRows/Cols
     */
    init() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: this.id,
            range: 'A1:Z',
        }).then(response => {
            this.contents = response;
            //Set Rows and find maxRow Length
            this.rows = this.contents.result.values;
            this.numOfRows = this.rows.length;
            this.maxRow = 0;
            for (var row of this.rows) {
                this.maxRow = Math.max(this.maxRow, row.length);
            }
            this.normalizeRows(this.rows)
            this.loaded = true;
            this.readAll();
        }, response => {
            console.log('Error Occured: ' + response.result.error.message);
        });
    }
    /**
     * Normalize row lengths by adding empty strings at end.
     * @param Array rows - Array: 
     * Takes: [["A1", "B1", "C1"], ["A2", "B2"], ["A3", "B3", "C3"]]
     * Mutates to: [["A1", "B1", "C1"], ["A2", "B2", ""], ["A3", "B3", "C3"]]
     */
    normalizeRows(rows) {
        for (var row of rows) {
            for (var i = this.maxRow - row.length; i > 0; i--) {
                row.push("");
            }
        }
    }
    /** readAll()
     * Takes all info from this.rows and print to Pre.
     */
    readAll() {
        clearPre();
        appendPre("Info:");
        for (var row of this.rows) {
            var line = "";
            for (var elem of row) {
                line += elem + ", ";
            }
            appendPre(line);
        }
        this.initCells();
    }

    /**
     * Will fill the inputTable form on screen
     * with cells resembling the spreadsheet.
     * (Add Row and Col function can be implemented)
     */
    initCells() {
        var grids = "1fr ".repeat(this.maxRow);
        var form = document.getElementById("inputTable");
        form.innerHTML = ""; 
        form.setAttribute("style", "width:50%; display:grid; grid-template-columns:" + grids + ";");
        for(var row of this.rows) {
            for (var elem of row) {
                var newElem = document.createElement("input");
                newElem.value = elem;
                form.appendChild(newElem);
            }
        }
    }

    /**
     * Will take all input nodes found in the 
     * inputTable form on screen, and update
     * them into the spreadsheet.
     */
    submitTable() {
        var count = 0;
        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.rows[0].length;j++) {
                var form = document.getElementById("inputTable");
                var input = form.getElementsByTagName("input")[count];
                this.rows[i][j] = input.value;
                count++;
            }
        }
        this.updateAll()
    }

    /** 
     * Takes current rows from sheet and updates sheet
     * with those values.
     * @param {bool} byRows 
     */
    updateAll() {
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.id,
            range: "A1:Z",
            valueInputOption: "RAW",
        }, {
            values: this.rows
        }).then((response) => {
            var result = response.result;
            console.log(result, "Values Updated.")
            this.init();
        }, response => {
            console.log('Error Occured: ' + response.result.error.message);
            console.log(response);
        });
    }

    /** addRow(newRow) and addCol(addCol)
     * Adds new row/col to next available spot at the bottom of the 
     * spreadsheet
     * 
     * Possible options to add (possibly requires Range String Manipulation):
     * Horizontal Offset (Number of spaces to skip on left)
     * Vertical Offset (Number of rows to skip after last row)
     * 
     * @param {Array} newRow - Array of type ["Content", "Content"]
     */
    addRow(newRow) {
        sheet.rows.push(newRow);
        sheet.updateAll();
    }

    addCol(newCol) {
        for(var i = 0; i < newCol.length; i++) {
            sheet.rows[i].push(newCol[i]);
        }
        sheet.updateAll();
    }
}