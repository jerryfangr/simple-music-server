import './form-uploader.less';
import axios from 'axios';
import eventHub from '@/vendor/event-hub';
import API from '@/assets/api';
import { Controller, Model, View } from '@/model/base/index';


const TEMPLATE = `

`;

class FormView extends View {
  constructor(options) {
    super(options);
  }

  beforeRender() {
    this.setAttr('tips', 'Drag & Drop File here to upload', (value) => {
      this.tipsDom.textContent = value;
    });

  }

  copyLink() {
    this.copyToClipboard(this.fileLink);
  }
  /**
   * * toggle this dom by add/remove class active
   * @param {Boolean} value 
   */
  toggle(value) {
    if (value) {
      this.domElement.classList.add('active');
    } else {
      this.domElement.classList.remove('active');
    }
  }
}


class FormModel extends Model {
  constructor() {
    super();
    this.token = undefined;
    this.timer = undefined;
    this.axios = axios.create({
      // upload timeout: 10 minutes
      timeout: 10 * 60 * 1000,
    });
    this.update();
  }

  update() {
    this.updateToken();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.updateToken();
    }, 1 * 60 * 1000);
  }

  updateToken() {
    return this.axios.get(API.token).then(res => {
      let data = JSON.parse(res.request.responseText);
      this.token = data.result.token;
    })
  }

  uploadFile(file, callback) {
    const formData = new FormData();
    formData.append(file.name, file);
    return this.axios.post(API.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { token: this.token },
    });
  }
}

class FormController extends Controller {
  constructor(view, model) {
    super(view, model);
  }

  beforeBind() {
  }

  bindEvents() {
    this.bindEvent(document, 'webkitvisibilitychange', () => { this.model.update(); });

    eventHub.on('switch-uploader', data => {
      this.view.toggle(data === 'form');
    });
  }

}

const view = new FormView({
  el: '#formUploader',
  template: TEMPLATE
});
const model = new FormModel();

new FormController(view, model);