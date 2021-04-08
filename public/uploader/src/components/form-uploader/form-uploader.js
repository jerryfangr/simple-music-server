import './form-uploader.less';
import axios from 'axios';
import eventHub from '@/vendor/event-hub';
import API from '@/assets/api';
import { Controller, Model, View } from '@/model/base/index';


const TEMPLATE = `
<div class="container">
  <!-- form list start -->
  <div class="form-container">
    <div class="search">
      <input type="text" id="nameFilter" name="search" placeholder="name filter">
    </div>

    <div id="formList" class="form-list"></div>
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

  <!-- form switch start -->
  <div id="formSwitch" class="form-switch">
    <div id="switchTitle" class="title">{{ switchTitle }}</div>
    <div id="switchButton" class="button">{{ switchButton }}</div>
  </div>
  <!-- form switch end -->
</div>
`;

class FormView extends View {
  constructor(options) {
    super(options);
    this.status = 'list';
    this.formListDom = this.eqs('#formList');
    this.songFormDom = this.eqs('#songForm');
    this.formSwitchDom = this.eqs('#formSwitch');
    this.nameFilterDom = this.eqs('#nameFilter');
    this.switchTitleDom = this.eqs('#switchTitle');
    this.switchButtonDom = this.eqs('#switchButton');
  }

  beforeRender() {
    this.setAttr('switchTitle', 'Form list', (value) => {
      this.switchTitleDom.textContent = value;
    });

    this.setAttr('switchButton', '< Create', (value) => {
      this.switchButtonDom.textContent = value;
    });

    this.setAttr('formList', [], (value) => {
      this.formListDom.innerHTML = '';
      value.forEach(data => {
        const fomItem = this.createFormItem(data);
        this.formListDom.appendChild(fomItem);
      })
    });
  }

  /**
   * * create a form-item element
   * @param {Object} data 
   * @returns 
   */
  createFormItem(data) {
    const template = `      
    <div class="cover">
      <img class="image" src="${data.cover || '#'}" >
    </div>

    <div class="info">
      <div class="name">${data.name || 'unknow'}</div>
      <div class="author">${data.singer || 'unknow'}</div>
    </div>

    <div class="operate">
      <a class="btn download" href=${data.url || '#'}"" download>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-download"></use>
        </svg>
      </a>
      <div class="btn delete" data-id="${data.id || '-1'}">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-delete"></use>
        </svg>
      </div>
      <div class="btn edit">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-edit"></use>
        </svg>
      </div>
    </div>
    `

    const formItem = document.createElement('li');
    formItem.className = 'form-item';
    formItem.innerHTML = template;
    return formItem;
  }

  /**
   * * move the switch wrapper(#formSwitch)
   * @param {String} status list / create
   * @returns 
   */
  switchTo(status) {
    if (status === this.status) {
      return;
    }

    this.status = status;
    if (status === 'list') {
      this.formSwitchDom.classList.remove('left');
      this.switchTitle = 'Form list';
      this.switchButton = '< Create';
    } else {
      this.formSwitchDom.classList.add('left');
      this.switchTitle = 'Create form';
      this.switchButton = 'Back >';
    }
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

  /**
   * * submit formData to server(json format) 
   * @param {*} data 
   * @returns 
   */
  submitForm(data) {
    return this.axios.post(API.music, data, {
      params: { token: this.token },
    });
  }

  /**
   * * get all songs
   * @returns 
   */
  fetchAll() {
    return this.axios.get(API.music, {
      params: { token: this.token },
    });
  }

  searchByName(name) {
    const url = API.music + '/' + name;
    return this.axios.get(url, {
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

    this.bindEvent(this.view.songFormDom, 'submit', e => {
      e.preventDefault();
      e.stopPropagation();
      
      const data = this.view.getInput();
      this.model.submitForm(data).then(() => {
        console.log('success');
      })
    });

    this.bindEvent(this.view.formSwitchDom, 'click', e => {
      const newStatus = this.view.status === 'list' ? 'create' : 'list';
      this.view.switchTo(newStatus);
    });

    this.bindEvent(this.view.nameFilterDom, 'input', this.debunceFunction(e => {
      const value = e.target?.value;
      if (value) {
        this.model.searchByName(value).then(res => {
          if (res.data.status === 'ok') {
            this.view.formList = res.data.result;
          }
        })
      }
    }, 800));
    // this.view.formListDom
    this.listen(this.view.formListDom, '.delete', 'click', (event, element) => {
      console.log(element);
    })

  }

}

const view = new FormView({
  el: '#formUploader',
  template: TEMPLATE
});
const model = new FormModel();

new FormController(view, model);