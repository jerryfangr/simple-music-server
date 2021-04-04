import './upload-box.less';
import axios from 'axios';
import eventHub from '@/vendor/event-hub';
import API from '@/assets/api';
import {Controller, Model, View} from '@/model/base/index';

const STATE = {
  WAIT_SELECT: Symbol('select file'),
  NO_SELECTED: Symbol('nothing selected'),
  UPLOADING_FILE: Symbol('uploading file'),
  UPLOAD_FAILED: Symbol('upload failed'),
  UPLOAD_SUCCESS: Symbol('upload success')
}

const TEMPLATE = `
  <div class="title">Your Music Storage</div>

  <div class="container">
    <!-- music icon start -->
    <div class="block music">
      <div class="shadow-wrapper">
        <div class="icon-wrapper">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-music"></use>
          </svg>
        </div>
      </div>
    </div>
    <!-- music icon end -->

    <!-- uploader box start -->
    <div id="uploadArea" class="upload-area">

      <div id="uploadBox" class="uploader-box deactive">
        <div class="tip">
          <p class="text">{{ tips }}</p>
          <p>Or click to Browse File</p>
        </div>
      </div>

      <div id="uploadProgress" class="upload-progress">
        <!--  circle progresss bar start  -->
        <div class="bar-wrapper right">
          <div id="progressRight" class="bar active"></div>
        </div>

        <div class="bar-wrapper left">
          <div id="progressleft" class="bar"></div>
        </div>
        <!--  circle process bar end  -->

        <!--  center circle(process value) start  -->
        <div class="circle-content">
          <div id="progressPercent" class="text">{{ progressPercent }}</div>
        </div>
        <!--  center circle(progresss value) end  -->
      </div>

      <div id="uploaLink" class="upload-link deactive">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-done"></use>
        </svg>

        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-copy"></use>
        </svg>
      </div>
    </div>
    <!-- uploader box end -->

    <!-- upload icon start -->
    <div class="block upload">
      <div class="wrapper">
        <div class="circle-bar"></div>
        <div class="icon-wrapper">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-upload"></use>
          </svg>
        </div>
      </div>
    </div>
    <!-- upload icon end -->
  </div>
`;

class UploadView extends View {
  constructor(options) {
    super(options);
    this.uploadBoxDom = this.qs('#uploadBox');
    this.uploadProgressDom = this.qs('#uploadProgress');
    this.uploaLinkDom = this.qs('#uploaLink');
    this.progressRight = this.qs('#progressRight');
    this.progressleft = this.qs('#progressleft');
    this.isUploadHalf = false;
  }


  beforeRender() {
    const tipsDom = this.qs('#uploadBox > .tip > .text');
    this.setAttr('tips', 'Drag & Drop File here to upload', (value) => {
      tipsDom.textContent = value;
    });

    const uploadPercentDom = this.qs('#uploadProgress #progressPercent');
    this.setAttr('progressPercent', '0%', (value) => {
      uploadPercentDom.textContent = value;
    });
  }

  updateProgress(percent) {
    percent = percent > 100 ? 100 : percent;

    if (percent <= 50) {
      let rotateValue = 180 * (1 - percent / 50);
      this.progressRight.style.transform = `rotate(-${rotateValue}deg)`;
    } else {
      if (!this.isUploadHalf) {
        this.isUploadHalf = true;
        this.progressRight.style.transform = `rotate(0deg)`;
      }
      let rotateValue = 180 * (1 - (percent - 50) / 50);
      this.progressleft.style.transform = `rotate(-${rotateValue}deg)`;
    }
    this.progressPercent = percent.toFixed(2) + '%';
  }

  updateState(state) {
    switch (state) {
      case STATE.WAIT_SELECT:
        this.tips = 'Drag & Drop File here to upload';
        this.uploadBoxDom.classList.remove('warning');
        break;
      case STATE.NO_SELECTED:
        this.tips = 'There no file to upload';
        this.uploadBoxDom.classList.add('warning');
        break;
      case STATE.UPLOADING_FILE:
        this.deActiveAll();
        this.uploadProgressDom.classList.remove('deactive');
        break;
      case STATE.UPLOAD_SUCCESS:
        return '上传成功!';
      case STATE.UPLOAD_FAILED:
        return '上传失败!';
      default:
        return '未知错误!';
    }
  }

  acriveItem() {
    this.deActiveAll();

  }

  deActiveAll() {
    this.uploadBoxDom.classList.add('deactive');
    this.uploadProgressDom.classList.add('deactive');
    this.uploaLinkDom.classList.add('deactive');
  }

  createBrowse(callback) {
    let inputDom = document.createElement('input')
    inputDom.setAttribute('style', 'visibility:hidden');
    inputDom.setAttribute('type', 'file');
    // inputDom.setAttribute('multiple', '');
    document.body.appendChild(inputDom);
    inputDom.addEventListener('change', e => {
      callback(e, inputDom, inputDom.files);
    });
    return inputDom;
  }
}


class UploadModel extends Model{
  constructor() {
    super();
    this.token = undefined;
    this.timer = undefined;
    this.axios = axios.create({
      baseURL: API.upload,
      timeout: 10000,
    });
  }

  update () {
    this.updateToken();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.updateToken();
    }, 1 * 60 * 1000);
  }

  updateToken() {
    this.axios.get('/token').then(res => {
        let data = JSON.parse(res.request.responseText);
        this.token = data.result.token;
      })
  }

  uploadFile(file, callback) {
    const formData = new FormData();
    formData.append(file.name, file);
    return this.axios.post('/music', formData, {
      headers: { 'Content-Type': 'multipart/form-data'},
      params: { token: this.token },
      onUploadProgress: progressEvent => {
        let percent = (progressEvent.loaded / progressEvent.total * 100);
        callback(percent);
      }
    });
  }
}

class UploadController extends Controller {
  constructor(view, model) {
    super(view, model);
    this.stopDefault();
  }

  beforeBind() {
    this.file = null;
  }

  bindEvents() {
    this.stopDefault();
    this.bindEvent(document, 'webkitvisibilitychange', () => { this.model.update(); });
    this.bindEvent(this.view.uploadBoxDom, 'drop', e => {
      let files = e.dataTransfer.files;
      this.selectFiles(files);
    });
    this.bindEvent(this.view.uploadBoxDom, 'click', e => {
      if (this.view.state === STATE.UPLOADING_FILE) { return; }
      if ([STATE.WAIT_SELECT, STATE.NO_SELECTED, STATE.UPLOAD_SUCCESS].indexOf(this.view.state) !== -1) {
        this.view.inputDom = this.view.inputDom || this.view.createBrowse(() => {
          this.selectFiles(this.view.inputDom.files)
        });
        return this.view.inputDom.click();
      }
      if (this.file === null) {
        return this.view.updateByState(STATE.NO_SELECTED);
      }
      this.view.updateByState(STATE.UPLOADING_FILE);
      this.uploadFile();
    });
  }

  uploadFile() {
    return this.model.uploadFile(this.file, percent => {
      this.view.updateProgress(percent);
    }).then((res) => {
        let result = JSON.parse(res.request.responseText).result;
        let fileData = [];
        for (const key in result.urls) {
          fileData.push({ name: key, url: encodeURI(API.resouces.base + result.urls[key])});
        }
        eventHub.emit('admin-upload', fileData);
        this.view.updateByState(STATE.UPLOAD_SUCCESS);
        this.uploadFiles = null;
      }, error => {
        console.log(error.response);
        this.view.updateByState(STATE.UPLOAD_FAILED);
      });
  }

  stopDefault() {
    this.preventDefault(document, 'drop');
    this.preventDefault(document, 'dragleave');
    this.preventDefault(document, 'dragenter');
    this.preventDefault(document, 'dragover');
  }

  selectFiles(files) {
    if (!files || files.length == 0) {
      return;
    }
    file.fileType = this.getFileType(file.name);
    this.file = file;
  }

  getFileType(filename) {
    let array = filename.split(".");
    if (array.length <= 1) {
      return "none";
    }
    return array[array.length - 1];
  }
}

const view = new UploadView({
  el: '#uploader',
  template: TEMPLATE
});
const model = new UploadModel();

new UploadController(view, model);

