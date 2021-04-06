import './aside-section.less';
import { Controller, Model, View } from '@/model/base/index';
import eventHub from '@/vendor/event-hub';


const TEMPLATE = `
<div class="filter-wrapper"></div>

<div class="button-wrapper">
  <div class="btn uploader-button">
    <svg class="icon" aria-hidden="true">
      <use xlink:href="#icon-done"></use>
    </svg>
  </div>

  <div class="btn editor-button">
    <svg class="icon" aria-hidden="true">
      <use xlink:href="#icon-form"></use>
    </svg>
  </div>

</div>
`;

class AsideView extends View {
  constructor(options) {
    super(options);
    this.uploaderButtonDom = this.eqs('.uploader-button');
    this.editorButtonDom = this.eqs('.editor-button');
  }
}


class AsideModel extends Model {
  constructor() {
    super();
    this.activeUploader = 'editor';
  }

}

class AsideController extends Controller {
  constructor(view, model) {
    super(view, model);
  }

  bindEvents() {
    this.bindEvent(this.view.uploaderButtonDom, 'click', e => {
      this.activeUploader('file');
    });

    this.bindEvent(this.view.editorButtonDom, 'click', e => {
      this.activeUploader('form');
    });
  }

  activeUploader(uploaderName) {
    if (this.model.activeUploader !== uploaderName) {
      eventHub.emit('switch-uploader', uploaderName);
      this.model.activeUploader = uploaderName;
    }
  }
}

const view = new AsideView({
  el: 'body aside.section',
  template: TEMPLATE
});
const model = new AsideModel();

new AsideController(view, model);
