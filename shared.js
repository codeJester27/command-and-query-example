export const wait = (delay) => new Promise((resolve) => setInterval(resolve, delay))

//#region data store
// mock version of a SQL database
class DataStore {
    static SELECT_REGEX = /^SELECT\s+((?:\w|,\s*)+)(?:\s+WHERE\s+(.+))?$/im;
    static INSERT_REGEX = /^INSERT\s+((?:\w|,\s*)+)\s+VALUES\s+((?:(?:'[^']*'|\d+)(?:,\s*|\s*(?=$)))+)$/im
    static UPDATE_REGEX = /^UPDATE\s+((?:\w|,\s*)+)\s+SET\s+((?:(?:'[^']*'|\d+)(?:,\s*|\s*(?=$|\sWHERE)))+)(?:\s+WHERE\s+(.+))?$/im

    /**
     * @type {object[]}
    */
    #data;
    constructor() {
        this.#data = [];
        this.busy = false;
    }

    /**
     * Executes a SQL-like query.
     * @param {string} queryString
     * @returns {object[] | undefined}
     */
    executeQuery(queryString) {
        try {
            busy = true;
            queryString = queryString.trim().replace("\n", " ");

            let matches = queryString.match(DataStore.SELECT_REGEX);

            if (matches) {
                const selected = matches[1].split(",").map(x => x.trim());
                
            }
        }
        finally {
            busy = false;
        }
    }
}
//#endregion data store