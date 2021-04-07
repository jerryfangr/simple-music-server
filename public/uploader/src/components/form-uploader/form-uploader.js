import './form-uploader.less';
import axios from 'axios';
import eventHub from '@/vendor/event-hub';
import API from '@/assets/api';
import { Controller, Model, View } from '@/model/base/index';


const TEMPLATE = `
<div class="container">
  <!-- form list start -->
  <div class="form-container">
    <div class="search">search</div>
    <div class="form-list"></div>
  </div>
  <!-- form list end -->

  <!-- form creator start-->
  <div class="form-creator">
    <div class="title">Song</div>

    <form id="songForm" class="form">
      <input type="text" name="cover" value="{{ cover }}" placeholder="cover url">
      <input type="text" name="name" value="{{ name }}" placeholder="song name">
      <input type="text" name="singer" value="{{ singer }}" placeholder="singer name">
      <input type="text" name="url" value="{{ url }}" placeholder="song url">
      <textarea name="lyric"cols="40" rows="10" placeholder="song lyric">{{lyric}}</textarea>
      <button class="submit-button" type="submit">save</button>
    </form>
  </div>
  <!-- form creator end-->

  <!-- form switcher start -->
  <div class="form-switch">
    <div class="cover"></div>
    <div class="btn"></div>
  </div>
  <!-- form switcher end -->
</div>
`;

class FormView extends View {
  constructor(options) {
    super(options);
    this.songFormDom = this.eqs('#songForm');
  }

  beforeRender() {
    this.setAttr('tips', '', (value) => {
    });
  }

  /**
   * * get form input value
   */
  getInput() {
    const formData = new FormData(this.songFormDom);
    return {
      cover: formData.get('cover') || '',
      name: formData.get('name') || '',
      singer: formData.get('singer') || '',
      url: formData.get('url') || '',
      lyric: formData.get('lyric') || '',
    }
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

  /**
   * * create a timer to auto update token
   */
  update() {
    this.updateToken();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.updateToken();
    }, 1 * 60 * 1000);
  }

  /**
   * * update token
   * @returns
   */
  updateToken() {
    return this.axios.get(API.token).then(res => {
      let data = JSON.parse(res.request.responseText);
      this.token = data.result.token;
    })
  }

  submitForm(data) {
    console.log(data);
    return this.axios.post(API.music, data, {
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

    this.bindEvent(this.view.songFormDom, 'submit', e => {
      e.preventDefault();
      e.stopPropagation();
      
      const data = this.view.getInput();
      this.model.submitForm(data).then(() => {
        console.log('success');
      })
    })

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