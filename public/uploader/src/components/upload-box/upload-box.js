import "./upload-box.less";
import axios from 'axios';
import eventHub from '@/vendor/event-hub';

const STATE = {
  WAIT_SELECT: Symbol('select file'),
  NO_SELECTED: Symbol('nothing selected'),
  SELECTED_FILE: Symbol('selected some files'),
  FILE_EXISTS: Symbol('selected file exists'),
  UPLOADING_FILE: Symbol('uploading file'),
  UPLOAD_FAILED: Symbol('upload failed'),
  UPLOAD_SUCCESS: Symbol('upload success')
}

class UploadView {
  constructor(options) {
    this.domElement = this.qs(options.el);
    this.template = options.template;
    this.init && this.init();
    this.render();
  }


  init() {
    console.log('my init');
  }

  render() {
    let html = this.renderTemplate();
    this.domElement.innerHTML = html;
  }

  renderTemplate() {
    return this.template;
  }

  qs(selector) {
    return document.querySelector(selector);
  }
  qsa(selector) {
    return document.querySelectorAll(selector);
  }
}

const uploader = new UploadView({
  el: '#uploader',
  template: `
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
    <div id="uploadBox" class="upload-area">
      <div id="filePreview" class="upload-preview"></div>
      <span id="uploadButton" class="upload-button">{{buttonText}}</span>
      <p id="uploadMessage">{{messageText}}</p>
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
  `
});

export default uploader;
