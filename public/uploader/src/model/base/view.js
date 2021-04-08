export default class View {
  constructor(options) {
    this.$data = {};
    this.domElement = this.qs(options.el);
    this.template = options.template || '';
    this.beforeRender();
    this.render();
  }

  beforeRender() {}

  /**
   * * add a react value
   * @param {String} key
   * @param {any} value 
   * @param {Function} callBack 
   */
  setAttr(key, value, callBack) {
    const self = this;
    if (self[key] !== undefined) {
      throw new Error(`Cannot redefine property key ${key}  `);
    }

    Object.defineProperty(self.$data, key, {
      enumerable: true,
      configurable: false,
      get () { return value; },
      set(v) {
        if (v !== value) {
          value = v;
          callBack.call(self, v);
        }
      }
    })

    Object.defineProperty(self, key, {
      enumerable: true,
      configurable: false,
      get() { return self.$data[key]; },
      set(v) { self.$data[key] = v }
    })
  }

/**
 * * document.querySelector
 * @param {String} selector
 * @returns 
 */
  qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * * document.querySelectorAll
   * @param {String} selector
   * @returns
   */
  qsa(selector) {
    return document.querySelectorAll(selector);
  }

  eqs(selector, element) {
    element = element || this.domElement || document;
    return element.querySelector(selector);
  }

  eqsa(selector, element) {
    element = element || this.domElement || document;
    return element.querySelectorAll(selector);
  }

  /**
   * * replace this domElement html
   */
  render() {
    this.domElement && (this.domElement.innerHTML = this.renderTemplate());
  }

  /**
   * * copy string content to clipboard
   * @param {String} content 
   */
  copyToClipboard(content) {
    const inputDom = document.createElement('input');
    inputDom.setAttribute('value', content);
    document.body.appendChild(inputDom);
    inputDom.select();
    document.execCommand('copy');
    document.body.removeChild(inputDom);
  }


  /**
   * * define template rule, here is {{ prop }}
   * @returns 
   */
  renderTemplate() {
    let html = this.template;
    const matches = html.match(/{{([\w ]+)}}/ig) || [];
    matches.forEach(value => {
      const key = value.replace('{{', '').replace('}}', '').trim();
      html = html.replace(value, this[key] || '');
    })
    return html;
  }
}