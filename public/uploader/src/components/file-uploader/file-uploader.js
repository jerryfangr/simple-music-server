import './file-uploader.less';
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
          <div id="progressLeft" class="bar"></div>
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

          <div class="operate-button">
            <div id="backButton" class="back-button">
              < Back
            </div>

            <div id="copyButton" class="copy-button">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-copy"></use>
              </svg>
              Copy
            </div>
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
    this.progressLeft = this.qs('#progressLeft');
    this.isUploadHalf = false;
    this.uploadPercentDom = this.qs('#uploadProgress #progressPercent');
    // uploaLink
    this.uploaLinkDom = this.qs('#uploaLink');
    this.fileLinkDom = this.qs('#uploaLink #fileLink');
    this.copyButtonDom = this.qs('#uploaLink #copyButton');
    this.backButtonDom = this.qs('#uploaLink #backButton');
  }

  /**
   * * set TEMPLATE value before add TEMPLATE to document
   * * ex: {{ progressPercent }} => 0.00%
   */
  beforeRender() {
    this.setAttr('tips', 'Drag & Drop File here to upload', (value) => {
      this.tipsDom.textContent = value;
    });

    this.setAttr('progressPercent', '0.00%', (value) => {
      this.uploadPercentDom.textContent = value;
    });

    this.setAttr('fileLink', 'https://www.example.com/xxx', (value) => {
      this.fileLinkDom.textContent = value;
    });
  }

  /**
   * * copy file url to clipboard
   */
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
      this.progressLeft.style.transform = `rotate(-${rotateValue}deg)`;
    }
    this.progressPercent = percent.toFixed(2) + '%';
  }

  /**
   * * update view status
   * @param {*} state 
   * @param {*} data 
   * @returns 
   */
  updateState(state, data) {
    this.state = state;
    switch (state) {
      case STATE.WAIT_SELECT:
        this.tips = 'Drag & Drop File here to upload';
        this.uploadBoxDom.classList.remove('warning');
        this.activeElement(this.uploadBoxDom);
        break;
      case STATE.NO_SELECTED:
        this.tips = 'There no file to upload';
        this.uploadBoxDom.classList.add('warning');
        this.activeElement(this.uploadBoxDom);
        break;
      case STATE.UPLOADING_FILE:
        this.progressPercent = '0.00%'
        this.isUploadHalf = false;
        this.progressRight.style.transform = 'rotate(-180deg)';
        this.progressLeft.style.transform = 'rotate(-180deg)';
        this.activeElement(this.uploadProgressDom);
        break;
      case STATE.UPLOAD_SUCCESS:
        this.fileLink = data.url || 'none';
        this.activeElement(this.uploaLinkDom);
        break;
      case STATE.UPLOAD_FAILED:
        return 'upload failed!';
      default:
        return 'unknow error!';
    }
  }

  /**
   * * active element by remove class deactive
   * @param {*} element 
   */
  activeElement(element) {
    this.deActiveAll();
    element.classList.remove('deactive');
  }

  /**
   * * deactive all element by add class deactive
   */
  deActiveAll() {
    this.uploadBoxDom.classList.add('deactive');
    this.uploadProgressDom.classList.add('deactive');
    this.uploaLinkDom.classList.add('deactive');
  }

  /**
   * * open a browse windows by create a input(file) dom
   * @param {*} callback 
   * @returns 
   */
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

  /**
   * * create a timer to auto update token
   */
  update () {
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
   * * upload a file
   * @param {*} file 
   * @param {*} callback 
   * @returns 
   */
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

    // Drag & Drop File event
    this.bindEvent(this.view.uploadBoxDom, 'drop', e => {
      let files = e.dataTransfer.files;
      const file = this.selectFiles(files);
      file && this.uploadFile();
    });

    // browse file event
    this.bindEvent(this.view.uploadBoxDom, 'click', e => {
      if (this.view.state === STATE.UPLOADING_FILE) { return; }
      if ([STATE.WAIT_SELECT, STATE.NO_SELECTED].indexOf(this.view.state) !== -1) {
        this.view.inputDom = this.view.inputDom || this.view.createBrowse(() => {
          const file = this.selectFiles(this.view.inputDom.files);
          file && this.uploadFile();
        });
        return this.view.inputDom.click();
      }
    });

    this.bindEvent(this.view.copyButtonDom, 'click', e => {
      this.view.copyLink();
    });

    this.bindEvent(this.view.backButtonDom, 'click', e => {
      this.view.updateState(STATE.WAIT_SELECT);
    });

    eventHub.on('switch-uploader', data => {
      this.view.toggle(data === 'file');
    });
  }

  /**
   * * upload file and chang view status 
   * @returns 
   */
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
        this.view.updateState(STATE.UPLOAD_FAILED);
      });
  }

  /**
   * * clear default event
   */
  stopDefault() {
    this.preventDefault(document, 'drop');
    this.preventDefault(document, 'dragleave');
    this.preventDefault(document, 'dragenter');
    this.preventDefault(document, 'dragover');
  }

  /**
   * * check the upload file 
   * @param {*} files 
   * @returns 
   */
  selectFiles(files) {
    if (!files || files.length == 0) {
      return null;
    }
    const file = files[0];
    file.fileType = this.getFileType(file.name);
    return this.file = file;
  }

  /**
   * * get file type from file suffix
   * * ex: abc.mp3 => mp3
   * @param {*} filename 
   * @returns 
   */
  getFileType(filename) {
    let array = filename.split(".");
    if (array.length <= 1) {
      return "none";
    }
    return array[array.length - 1];
  }
}

const view = new UploadView({
  el: '#fileUploader',
  template: TEMPLATE
});
const model = new UploadModel();

new UploadController(view, model);