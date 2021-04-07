import './aside-section.less';
import { Controller, Model, View } from '@/model/base/index';
import eventHub from '@/vendor/event-hub';


const TEMPLATE = `
<div class="filter-wrapper"></div>

<div class="button-wrapper">
  <div class="btn file-button">
    <svg class="icon" aria-hidden="true">
      <use xlink:href="#icon-done"></use>
    </svg>
  </div>

  <div class="btn form-button">
    <svg class="icon" aria-hidden="true">
      <use xlink:href="#icon-form"></use>
    </svg>
  </div>

</div>
`;

class AsideView extends View {
  constructor(options) {
    super(options);
    this.fileButtonDom = this.eqs('.file-button');
    this.formButtonDom = this.eqs('.form-button');
  }

  activeButton(buttonName) {
    if (buttonName =='form') {
      this.fileButtonDom.classList.remove('active');
      this.formButtonDom.classList.add('active');
    } else {
      this.formButtonDom.classList.remove('active');
      this.fileButtonDom.classList.add('active');
    }
  }
}


class AsideModel extends Model {
  constructor() {
    super();
    this.activeUploader = 'file';
  }

}

class AsideController extends Controller {
  constructor(view, model) {
    super(view, model);
    this.view.activeButton('file');
  }

  bindEvents() {
    this.bindEvent(this.view.fileButtonDom, 'click', e => {
      this.activeUploader('file');
    });

    this.bindEvent(this.view.formButtonDom, 'click', e => {
      this.activeUploader('form');
    });
  }

  activeUploader(uploaderName) {
    if (this.model.activeUploader !== uploaderName) {
      eventHub.emit('switch-uploader', uploaderName);
      this.model.activeUploader = uploaderName;
      this.view.activeButton(uploaderName);
    }
  }
}

const view = new AsideView({
  el: 'body aside.section',
  template: TEMPLATE
});
const model = new AsideModel();

new AsideController(view, model);
