let eventHub = {
  events: {},

  /**
   * * add event
   * @param {*} eventName 
   * @param {*} callback 
   */
  on (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  },

  /**
   * * delete event
   * @param {*} eventName 
   */
  off(eventName) {
    if (this.events[eventName] !== undefined) {
      delete this.events[eventName];
    }
  },

  /**
   * * trigger event
   * @param {*} eventName
   * @param {*} data 
   */
  emit(eventName, data) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].forEach(callback => {
      callback.call(undefined, data);
    });
  },
}

export default eventHub;