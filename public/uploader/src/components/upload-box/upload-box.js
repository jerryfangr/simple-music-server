import './upload-box.less';
import axios from 'axios';
import eventHub from '@/vendor/event-hub';
import API from '@/assets/api';
import {Controller, Model, View} from '@/model/base/index';

const STATE = {
  WAIT_SELECT: Symbol('select file'),
  NO_SELECTED: Symbol('nothing selected'),
  UPLOADING_FILE: Symbol('uploading file'),
  UPLOAD_DONE: Symbol('upload finished'),
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

    <!-- uploader area start -->
    <div id="uploadArea" class="upload-area">

      <!-- uploader box start -->
      <div id="uploadBox" class="uploader-box">
        <div class="tip">
          <p class="text">{{ tips }}</p>
          <p>Click to Browse File</p>
        </div>
      </div>
      <!-- uploader box end -->

      <!-- upload progress start -->
      <div id="uploadProgress" class="upload-progress deactive">
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
      <!-- upload progress end -->

      <!-- upload link start -->

      <div id="uploaLink" class="upload-link deactive">
        <!--  upload status icon start  -->
        <div class="upload-status">
          <div class="circle-wrapper">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-done"></use>
            </svg>
          </div>
          <div class="tips">Done!</div>
        </div>
        <!--  upload status icon end  -->
        
        <!-- separate line start  -->
        <div class="separate-line"></div>
        <!-- separate line end  -->

        <!-- link content start  -->
        <div class="link-content">
          <div class="link-text">
            link:
            <p id="fileLink" class="text">{{ fileLink }}</p>
          </div>

          <div id="copyButton" class="copy-button">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-copy"></use>
            </svg>
            Copy Link
          </div>
        </div>
        <!-- link content end  -->

      </div>
      <!-- upload link end -->

    </div>
    <!-- uploader area end -->

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
    this.state = STATE.WAIT_SELECT;
    // uploadBox
    this.uploadBoxDom = this.qs('#uploadBox');
    this.tipsDom = this.qs('#uploadBox > .tip > .text');
    // uploadProgress
    this.uploadProgressDom = this.qs('#uploadProgress');
    this.progressRight = this.qs('#progressRight');
    this.progressleft = this.qs('#progressleft');
    this.isUploadHalf = false;
    this.uploadPercentDom = this.qs('#uploadProgress #progressPercent');
    // uploaLink
    this.uploaLinkDom = this.qs('#uploaLink');
    this.fileLinkDom = this.qs('#uploaLink #fileLink');
    this.copyButtonDom = this.qs('#uploaLink .copy-button');
  }


  beforeRender() {
    this.setAttr('tips', 'Drag & Drop File here to upload', (value) => {
      this.tipsDom.textContent = value;
    });

    this.setAttr('progressPercent', '0%', (value) => {
      this.uploadPercentDom.textContent = value;
    });

    this.setAttr('fileLink', 'https://www.example.com/xxx', (value) => {
      this.fileLinkDom.textContent = value;
    });
  }

  copyLink() {
    this.copyToClipboard(this.fileLink);
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

  updateState(state, data) {
    this.state = state;
    switch (state) {
      case STATE.WAIT_SELECT:
        this.tips = 'Drag & Drop File here to upload';
        this.progressPercent = '0.00%';
        this.uploadBoxDom.classList.remove('warning');
        this.activeElement(this.uploadBoxDom);
        break;
      case STATE.NO_SELECTED:
        this.tips = 'There no file to upload';
        this.uploadBoxDom.classList.add('warning');
        this.activeElement(this.uploadBoxDom);
        break;
      case STATE.UPLOADING_FILE:
        this.activeElement(this.uploadProgressDom);
        break;
      case STATE.UPLOAD_SUCCESS:
        this.fileLink = data.url || 'none';
        this.activeElement(this.uploaLinkDom);
        break;
      case STATE.UPLOAD_FAILED:
        return '上传失败!';
      default:
        return '未知错误!';
    }
  }

  activeElement(element) {
    this.deActiveAll();
    element.classList.remove('deactive');
  }

  deActiveAll() {
    this.uploadBoxDom.classList.add('deactive');
    this.uploadProgressDom.classList.add('deactive');
    this.uploaLinkDom.classList.add('deactive');
  }

  createBrowse(callback) {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('style', 'width:0; height:0; overflow: hidden;');

    const inputDom = document.createElement('input')
    inputDom.setAttribute('type', 'file');
    inputDom.addEventListener('change', e => {
      callback(e, inputDom, inputDom.files);
    });
    wrapper.appendChild(inputDom);
    document.body.appendChild(wrapper);
    return inputDom;
  }
}


class UploadModel extends Model{
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

  update () {
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
      const file = this.selectFiles(files);
      file && this.uploadFile();
    });

    this.bindEvent(this.view.uploadBoxDom, 'click', e => {
      if (this.view.state === STATE.UPLOADING_FILE) { return; }
      if ([STATE.WAIT_SELECT, STATE.NO_SELECTED].indexOf(this.view.state) !== -1) {
        this.view.inputDom = this.view.inputDom || this.view.createBrowse(() => {
          this.selectFiles(this.view.inputDom.files);
          this.uploadFile();
        });
        return this.view.inputDom.click();
      }
    });

    this.bindEvent(this.view.copyButtonDom, 'click', e => {
      this.view.copyLink();
    })
  }

  uploadFile() {
    this.view.updateState(STATE.UPLOADING_FILE);
    return this.model.uploadFile(this.file, percent => {
      this.view.updateProgress(percent);
    }).then((res) => {
        let result = JSON.parse(res.request.responseText).result;
        result.url = API.base + result.url;
        this.view.updateState(STATE.UPLOAD_SUCCESS, result)
        this.file = null;
      }, error => {
        console.log(error.response);
        this.view.updateState(STATE.UPLOAD_DONE);
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
      return null;
    }
    const file = files[0];
    file.fileType = this.getFileType(file.name);
    return this.file = file;
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