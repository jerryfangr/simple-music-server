export default class View {
  constructor(options) {
    this.$data = {};
    this.domElement = this.qs(options.el);
    this.template = options.template || '';
    this.beforeRender();
    this.render();
  }

  beforeRender() {}

  setAttr(key, value, callBack) {
    const self = this;

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

  qs(selector) {
    return document.querySelector(selector);
  }
  qsa(selector) {
    return document.querySelectorAll(selector);
  }

  eqs(element, selector) {
    return element.querySelector(selector);
  }

  eqsa(element, selector) {
    return element.querySelectorAll(selector);
  }

  render() {
    this.domElement.innerHTML = this.renderTemplate();
  }

  renderTemplate() {
    let html = this.template;
    html.match(/{{([\w ]+)}}/ig).forEach(value => {
      const key = value.replace('{{', '').replace('}}', '').trim();
      html = html.replace(value, this[key] || '');
    })
    return html;
  }
}