export default class Controller {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.beforeBind();
    this.bindEvents();
  }

  beforeBind() {}

  bindEvents() {}

  /**
   * * bind event in root element
   * @param {*} rootElement root element
   * @param {*} selector css/id/tag/.. selector
   * @param {*} eventName 
   * @param {*} callback 
   * @param {*} options buble / capture /... 
   */
  listen(rootElement, selector, eventName, callback, options) {
    this.bindEvent(rootElement, eventName, e => {
      let target = e.target;
      while (!target.matches(selector)) {
        if (target === rootElement) {
          target = null;
          break;
        }
        target = target.parentNode;
      }
      target && callback.call(target, e, target);
    }, options);
  }

  /**
   * * addEventListener
   * @param {HTMLElement} element
   * @param {String} eventName
   * @param {Function} callback 
   * @param {Object} options 
   */
  bindEvent(element, eventName, callback, options) {
    options = options || {};
    element.addEventListener(eventName, e => {
      callback.call(e.target, e);
    }, options)
  }

  /**
   * * prevent element's default event (form/a/...)
   * @param {HTMLElement} element
   * @param {String} eventName
   * @param {*} isAll
   */
  preventDefault(element, eventName, isAll) {
    element.addEventListener(eventName, function (e) {
      e.preventDefault();
      isAll && e.stopPropagation();
    });
  }
}