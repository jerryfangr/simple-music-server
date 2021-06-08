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
      <input type="text" name="name" value="{{ name }}" placeholder="song name">
      <input type="text" name="singer" value="{{ singer }}" placeholder="singer name">
      <input type="text" name="cover" value="{{ cover }}" placeholder="cover url">
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
  }

  beforeRender() {
    // simpleSetAttr(propName, value, selector)
    this.simpleSetAttr('switchTitle', 'Form list', '#switchTitle');
    this.simpleSetAttr('switchButton', '< Create', '#switchButton');

    this.simpleSetAttr('name', '', '#songForm > input[name="name"]', 'value');
    this.simpleSetAttr('singer', '', '#songForm > input[name="singer"]', 'value');
    this.simpleSetAttr('cover', '', '#songForm > input[name="cover"]', 'value');
    this.simpleSetAttr('url', '', '#songForm > input[name="url"]', 'value');
    this.simpleSetAttr('lyric', '', '#songForm > textarea[name="lyric"]');

    this.setAttr('formList', [], (value) => {
      this.formListDom.innerHTML = '';
      value.forEach((data, index) => {
        data.index = index;
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
      <a class="btn download" data-href="${data.url || '#'}" download>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-download"></use>
        </svg>
      </a>
      <div class="btn delete" data-index="${data.index}">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-delete"></use>
        </svg>
      </div>
      <div class="btn edit" data-index=${data.index}>
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
  getFormInput() {
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
   * * set form input value
   * @param {Object} data 
   */
  setFormInput(data) {
    console.log('set data', data);
    this.name = data.name || '';
    this.cover = data.cover || '';
    this.singer = data.singer || '';
    this.url = data.url || '';
    this.lyric = data.lyric || '';
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
    this.data = [];
    this.editItem = {};
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
    }, 5 * 60 * 1000);
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
    }).then(res => {
      if (res.data.status === 'ok') {
        this.data.push(data)
      }
      return res;
    });
  }

  /**
   * * get all songs
   * @returns 
   */
  fetchAll() {
    return this.axios.get(API.music, {
      params: { token: this.token },
    }).then(res => {
      if (res.data.status === 'ok') {
        return this.data = res.data.result;
      }
      return []
    });
  }

  /**
   * * search forms
   * @param {String} name 
   * @returns {Array}
   */
  searchByName(name) {
    const url = API.music + '/' + name;
    return this.axios.get(url, {
      params: { token: this.token },
    }).then(res => {
      if (res.data.status === 'ok') {
        return this.data = res.data.result;
      }
      return []
    })
  }

  /**
   * * delete form
   * @param {Number} index 
   * @returns 
   */
  deleteByIndex(index) {
    const data = this.data[index];
    if (data === undefined) {
      return
    }
    const url = API.music + '/' + data.id;
    return this.axios.delete(url, {
      params: { token: this.token },
    }).then(res => {
      if (res.data.status === 'ok') {
        this.data.splice(index, 1);
        return res;
      } else {
        throw new Error(this.data.error)
      }
    })
  }

  /**
   * * update form
   * @param {String} data 
   * @returns 
   */
  updateForm(data) {
    const url = API.music + '/' + data.id;
    return this.axios.put(url, data, {
      params: { token: this.token },
    }).then(res => {
      if (res.data.status === 'ok') {
        const index = this.editItem.index;
        const updateData = this.data[index];
        if (updateData !== undefined) {
          this.data[index] = data;
          this.data[index].id = updateData.id;
        }
        return res;
      } else {
        throw new Error(this.data.error)
      }
    })
  }

}

class FormController extends Controller {
  constructor(view, model) {
    super(view, model);
    this.status = 'create';
  }

  bindEvents() {
    this.bindEvent(document, 'webkitvisibilitychange', () => { this.model.update(); });
    eventHub.on('switch-uploader', data => { this.view.toggle(data === 'form');});

    this.bindEvent(this.view.formSwitchDom, 'click', e => {
      let newStatus = this.view.status === 'list' ? 'create' : 'list';
      console.log('this.model.editItem', this.model.editItem);
      this.view.setFormInput(this.model.editItem);
      this.view.switchTo(newStatus);
    });

    this.bindEvent(this.view.nameFilterDom, 'input', this.debunceFunction(e => {
      const value = e.target?.value;
      if (value) {
        this.model.searchByName(value).then(data => {
          this.updateFormListView();
        });
      }
      if (value === '') {
        this.view.formList = [];
      }
    }, 800));

    this.listen(this.view.formListDom, '.delete', 'click', (event, element) => {
      this.model.deleteByIndex(element.dataset.index).then(data => {
        this.updateFormListView();
      }, error => {
        console.log(error);
      });
    });

    this.listen(this.view.formListDom, '.download', 'click', (event, element) => {
      element.href = element.dataset.href + '?token=' + this.model.token;
      element.dispatchEvent(new Event('click'));
      setTimeout(() => { element.removeAttribute('href'); })
    });

    this.listen(this.view.formListDom, '.delete', 'click', (event, element) => {
      this.model.deleteByIndex(element.dataset.index).then(data => {
        this.updateFormListView();
      }, error => {
        console.log(error);
      });
    });

    this.listen(this.view.formListDom, '.edit', 'click', (event, element) => {
      this.status = 'edit';
      const index = element.dataset.index;
      if (index !== undefined) {
        let itemData = this.model.data[index];
        this.model.editItem = itemData || {};
        this.model.editItem.index = index;
        this.view.setFormInput(itemData);
        this.view.switchTo('create');
      }
    });

    this.bindEvent(this.view.songFormDom, 'submit', e => {
      e.preventDefault();
      e.stopPropagation();
      const data = this.view.getFormInput();
      if (this.status === 'edit') {
        if (this.model.editItem.id !== undefined) {
          data.id = this.model.editItem.id;
          this.model.updateForm(data).then(() => {
            this.status = 'create';
            this.model.editItem = {};
            this.updateFormListView();
          })
        }
      } else {
        this.model.submitForm(data).then(() => {
          this.model.editItem = {};
          this.updateFormListView();
        })
      }
    });
  }

  /**
   * * update form list in view
   */
  updateFormListView() {
    this.view.formList = JSON.parse(JSON.stringify(this.model.data));
  }
}

const view = new FormView({
  el: '#formUploader',
  template: TEMPLATE
});
const model = new FormModel();

new FormController(view, model);