export const wait = (delay) =>
  new Promise((resolve) => setInterval(resolve, delay));

//#region data store

// pseudo-SQL database
export class DataStore {
  static SELECT_REGEX = /^SELECT\s+((?:\w|,\s*)+)(?:\s+WHERE\s+(.+))?$/im;
  static INSERT_REGEX =
    /^INSERT\s+((?:\w|,\s*)+)\s+VALUES\s+((?:(?:'[^']*'|\d+)(?:,\s*|\s*(?=$)))+)$/im;
  static UPDATE_REGEX =
    /^UPDATE\s+((?:\w|,\s*)+)\s+SET\s+((?:(?:'[^']*'|\d+)(?:,\s*|\s*(?=$|\sWHERE)))+)(?:\s+WHERE\s+(.+))?$/im;

  /**
   * @type {object[]}
   */
  #data;
  constructor() {
    this.#data = [];
    this.busy = false;
  }

  /**
   * @param {DataStore} dataStore
   */
  async syncify(dataStore) {
    await wait(200);
    dataStore.#data = this.#data.map((x) => ({ ...x }));
  }

  waitUntilNotBusy() {
    return new Promise((resolve) => {
      function check() {
        if (this.busy) {
          setImmediate(check.bind(this));
        } else {
          resolve();
        }
      }
      check.bind(this)();
    });
  }

  /**
   * Executes a SQL-like query.
   * @param {string} queryString
   * @returns {object[] | undefined}
   */
  async executeQuery(queryString) {
    await this.waitUntilNotBusy();

    try {
      this.busy = true;
      queryString = queryString.trim().replace("\n", " ");

      let matches = queryString.match(DataStore.SELECT_REGEX);

      if (matches) {
        const selected = matches[1].split(",").map((x) => x.trim());
        const filters = matches[2]
          ? matches[2]
              .split("AND")
              .map((x) => x.split("=").map((x) => x.trim()))
              .map((x) => {
                if (x[1].startsWith("'") && x[1].endsWith("'")) {
                  return [x[0], x[1].substring(1, x[1].length - 1)];
                }
                return x;
              })
              .filter((x) => x.length === 2)
          : [];
        await wait(50);
        return this.#data
          .filter((x) => filters.every((f) => x[f[0]] === f[1]))
          .map((x) =>
            Object.fromEntries(
              Object.entries(x).filter((y) => selected.includes(y[0]))
            )
          );
      }

      matches = queryString.match(DataStore.INSERT_REGEX);
      if (matches) {
        const keys = matches[1].split(",").map((x) => x.trim());
        const values = matches[2]
          .split(",")
          .map((x) => x.trim())
          .map((x) => {
            if (x.startsWith("'") && x.endsWith("'")) {
              return x.substring(1, x.length - 1);
            }
            return x;
          });
        if (keys.length !== values.length) {
          throw new Error("fail");
        }
        await wait(3000);
        this.#data.push(Object.fromEntries(keys.map((x, i) => [x, values[i]])));
        return;
      }

      matches = queryString.match(DataStore.UPDATE_REGEX);
      if (matches) {
        const keys = matches[1].split(",").map((x) => x.trim());
        const values = matches[2]
          .split(",")
          .map((x) => x.trim())
          .map((x) => {
            if (x.startsWith("'") && x.endsWith("'")) {
              return x.substring(1, x.length - 1);
            }
            return x;
          });
        const filters = matches[3]
          ? matches[3]
              .split("AND")
              .map((x) => x.split("=").map((x) => x.trim()))
              .map((x) => {
                if (x[1].startsWith("'") && x[1].endsWith("'")) {
                  return [x[0], x[1].substring(1, x[1].length - 1)];
                }
                return x;
              })
              .filter((x) => x.length === 2)
          : [];
        if (keys.length !== values.length) {
          throw new Error("fail");
        }
        await wait(3000);
        this.#data.forEach((row) => {
          if (filters.every((f) => row[f[0]] === f[1])) {
            keys.forEach((k, i) => {
              row[k] = values[i];
            });
          }
        });
        return;
      }
    } finally {
      this.busy = false;
    }
  }
}
//#endregion data store

export class CommandModel {
  constructor(dataStore, synchronizedDataStores = []) {
    /**
     * @type {DataStore}
     */
    this.dataStore = dataStore;
    /**
     * @type {DataStore[]}
     */
    this.synchronizedDataStores = synchronizedDataStores;
  }
  async updateUser(id, name, role) {
    await this.dataStore.executeQuery(
      `UPDATE name, role SET '${name}', '${role}' WHERE id = '${id}'`
    );
    await this.synchronizeDataStores();
  }
  async createUser(name, role) {
    await this.dataStore.executeQuery(
      `INSERT id, name, role, type VALUES ${Math.floor(
        Math.random() * Number.MAX_SAFE_INTEGER
      )}, '${name}', '${role}', 'user'`
    );
    await this.synchronizeDataStores();
  }

  async synchronizeDataStores() {
    for (const dataStore of this.synchronizedDataStores) {
      await this.dataStore.syncify(dataStore);
    }
  }
}

export class QueryModel {
  constructor(dataStore) {
    /**
     * @type {DataStore}
     */
    this.dataStore = dataStore;
  }
  async getUser(id) {
    return this.dataStore.executeQuery(
      `SELECT id, name, role WHERE id = ${id}`
    );
  }
  async getUsers() {
    return this.dataStore.executeQuery(
      "SELECT id, name, role WHERE type = 'user'"
    );
  }
}
