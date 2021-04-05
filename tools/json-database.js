const path = require('path');
var fs = require('fs');

/**
 * * an json database
 * * it should start width fetAll function, all functions can repeat and change the order
 * * ex: new JsonDatabase('dbname').fetchAll().limit(1,2).remove(1).limit(0,1).get(data => {}).fetAll()...
 */
class JsonDatabase {
  constructor(databaseName) {
    this.dbPath = path.join('db/json', databaseName + '.json');
    this._state = 'init';
    this._stack = Promise.resolve([]);
  }

  toString() {
    let status = 'db file: ' + this.dbPath;
    status += '\nstate: ' + this._state;
    return status;
  }

  /**
   * * read file content and convert to string;
   */
  _readContent () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.dbPath, function (err, data) {
        if (err) { reject(err) };
        resolve(data?.toString?.())
      });
    }).then((data) => {
      return JSON.parse(data || '[]')
    }, error => {
      if (error.errno === -4058) {
        return [];
      }
      throw error;
    });
  }

  /**
   * * wirte content to file
   * @param {string} content 
   */
  _writeContent(content) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.dbPath, content, {flag: 'w', encoding: 'utf-8'}, function (err) {
        if (err) { reject(err); }
        resolve()
      });
    });
  }

  /**
   * * fetch all data
   */
  fetchAll () {
    this._state = 'select';
    this._stack = Promise.resolve().then(() => {
      return this._readContent();
    })
    return this;
  }

  /**
   * * limit data 
   * @param {number} startIndex start index
   * @param {number} number number of data
   */
  limit(startIndex, number) {
    if (this._state === 'init') {
      throw new Error('Not allowed to start width limit funtion')
    }
    this._stack = this._stack.then(allDatas => {
      const endIndex = startIndex + (number || allDatas.length) - 1;
      const result = [];
      if (startIndex >= (allDatas.length - 1)) { return result; }

      for (let index = startIndex; index <= endIndex && allDatas[index]; index++) {
        result.push(allDatas[index]);
      }
      return result;
    });
    return this;
  }

  /**
   * * filter data
   * @param {Object} options ex: { name: 'name',  age: /\d{1,2}/}
   */
  filter (options) {
    if (this._state === 'init') {
      throw new Error('Not allowed to start width filter funtion')
    }
    if (options.id) { options.id = parseInt(options.id, 10);}
    this._stack = this._stack.then(allDatas => {
      return allDatas.filter(d => {
        for (const key in options) {
          if (options[key] instanceof RegExp) {
            if (!options[key].test(d[key])) {
              return false;
            }
          } else if (options[key] !== d[key]) {
            return false;
          }
        }
        return true;
      })
    });
    return this;
  }

  /**
   * * get data by callback
   * @param {Function} success
   * @param {Function} fail
   */
  get (success, fail) {
    this._stack.then(data => {
      success(data);
      return data;
    }, fail);
    return this;
  }

  /**
   * * edit data
   * @param {Function} action edit function
   * @param {Boolean} force force do the action whitout select
   */
  _edit(action, force) {
    if (this._state !== 'edit' && !force && this._state !== 'select') {
      throw new Error('You have to select some data fetAll(), or set param force true');
    }
    this._state = 'edit';
    this._stack = this._stack.then(allDatas => {
      return action(allDatas);
    });

    return this;
  }

  /**
   * * add data
   * @param {Object} data
   * @param {Boolean} force force do this function
   */
  add(data, force) {
    return this._edit(allDatas => {
      const lastData = allDatas[allDatas.length - 1] || {id: -1};
      data.id = lastData.id + 1;
      allDatas.push(data);
      return allDatas;
    }, force);
  }

  /**
   * * remove data by data id
   * @param {number} id 
   * @param {Boolean} force force do this function
   */
  remove(id, force) {
    id = parseInt(id, 10);
    return this._edit(allDatas => {
      return allDatas.filter(d => d.id !== id);
    }, force);
  }

  /**
   * * update data which has same id
   * @param {Object} newData 
   * @param {Boolean} force force do this function
   */
  update(data, force) {
    data.id = parseInt(data.id, 10);
    return this._edit(allDatas => {
      for (let i = 0; i < allDatas.length; i++) {
        if (allDatas[i].id === data.id) {
          for (const key in data) {
            allDatas[i][key] = data[key];
          }
          break;
        }
      }
      return allDatas;
    }, force);
  }

  /**
   * * overwrite the data(which in stack) to json database
   * @param {Function} success 
   * @param {Function} fail
   * @param {Boolean} force force do this function, it may clear all data
   */
  send(success, fail, force) {
    if (this._state === 'send') { return; }
    if (!force && this._state === 'init') {
      throw new Error('Not allowed to start width send funtion, or set param force true(clear all data)')
    }

    this._state = 'send';
    this._stack.then(allDatas => {
      return this._writeContent(JSON.stringify(allDatas));
    }).then(data => {
      success && success(data);
      return data;
    }, fail);
    return this;
  }
}

module.exports = JsonDatabase;