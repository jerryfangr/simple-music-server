const path = require('path');
var fs = require('fs');
const { all } = require('../routes');

class JsonDatabase {
  constructor(databaseName) {
    this.dbName = databaseName;
    this.dbPath = path.join('db/json', databaseName + '.json');
    this._state = 'init';
    this._content = undefined;
    this._stack = Promise.resolve();
  }

  /**
   * * read file content and convert to string;
   */
  _readContent () {
    const promise =  new Promise((resolve, reject) => {
      fs.readFile(this.dbPath, function (err, data) {
        if (err) { reject(err) };
        resolve(data?.toString?.())
      });
    }).then((data) => {
      data = data || '[]';
      this._content = data;
    }, error => {
      this._content = '[]';
    });
    return promise;
  }

  /**
   * * wirte content to file
   * @param {string} content 
   */
  _writeContent(content) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.dbPath, content, {flag: 'w', encoding: 'utf-8'}, function (err) {
        if (err) { 
          console.log('error happen');
          reject(err); 
        }
        resolve()
      });
    });
  }

  _reset() {
    this._state = 'init';
    this._content = undefined;
    this._stack = Promise.resolve();
  }

  _checkContent () {
    if (this._state === 'init') {
      this.fetchAll();
    }
  }

  toString () {
    return this._content;
  }

  toObject () {
    return JSON.parse(this._content);
  }

  /**
   * * push fetch data to stack
   * @returns 
   */
  fetchAll () {
    if (this._state === 'end') {
      this._reset();
    }
    this._state = 'fetchAll';
    this._stack = this._stack.then(() => {
      return this._readContent();
    }).then(() => {
      return this.toObject();
    });
    return this;
  }

  /**
   * * push get limit data to stack
   * @param {number} startIndex start index
   * @param {number} number number of data
   * @returns 
   */
  limit(startIndex, number) {
    this._checkContent();
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
   * filte data
   * @param {Object} options 
   * @returns 
   */
  filter (options) {
    this._checkContent();
    if (options.id) { options.id = parseInt(options.id, 10);}
    this._stack = this._stack.then(allDatas => {
      return allDatas.filter(d => {
        for (const key in options) {
          if (options[key] !== d[key]) {
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
   * @param {Function} callback 
   * @param {Function} onReject 
   * @returns 
   */
  get (success, fail) {
    this._checkContent();
    this._state = 'end';
    this._stack.then(success, fail);
    return this;
  }

  _edit(action, success, fail) {
    this.fetchAll();
    this._stack.then(allDatas => {
      let newData = action(allDatas);
      return this._writeContent(JSON.stringify(newData));
    }).then(success, fail);

    return this;
  }

  /**
   * * add data to file
   * @param {Object} data 
   * @param {Function} callback 
   */
  add(data, success, fail) {
    this._edit(allDatas => {
      const lastData = allDatas[allDatas.length - 1] || {id: -1};
      data.id = lastData.id + 1;
      allDatas.push(data);
      return allDatas;
    }, success, fail)
  }

  /**
   * * remove data by data id
   * @param {number} id 
   * @param {Function} callback 
   */
  remove(id, success, fail) {
    id = parseInt(id, 10);
    this._edit(allDatas => {
      return allDatas.filter(d => d.id !== id);
    }, success, fail)
  }

  /**
   * * update data which has same id
   * @param {Object} newData 
   * @param {Function} callback
   */
  update(newData, success, fail) {
    newData.id = parseInt(newData.id, 10);
    this._edit(allDatas => {
      for (let i = 0; i < allDatas.length; i++) {
        if (allDatas[i].id === newData.id) {
          for (const key in newData) {
            allDatas[i][key] = newData[key];
          }
          break;
        }
      }
      return allDatas;
    }, success, fail);
  }
}

module.exports = JsonDatabase;