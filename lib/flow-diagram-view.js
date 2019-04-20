'use babel';
import { $, $$$, View } from 'atom-space-pen-views'


export default class FlowDiagramView extends View {

  static content () {
    this.div({ outlet: 'flowContainer', class: 'flow-diagram native-key-bindings', tabindex: -1 }, () => {
      this.div({}, () => {
        this.input({ outlet: 'flowFilePath', type : 'text', style : 'width:100%' })
      })
    })
  }

  attached () {
    if (this.isAttached) { return }
    this.isAttached = true;
    this.flowFilePath[0].addEventListener('keyup', (e) => this.keyPress(e));

  }

  keyPress(e) {
    switch (e.key) {
      case "Enter":
        emitter.emit("Export",{ type : "svg", path : this.flowFilePath[0].value })
        break;
      case "Escape":
          emitter.emit("Escape",{})
          break;
      default:

    }
  }

  addFilePath(filePath) {
    this.flowFilePath[0].value = filePath;
  }

  constructor(serializedState, emitter) {
    super()
    this.emitter = emitter
  }
  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
