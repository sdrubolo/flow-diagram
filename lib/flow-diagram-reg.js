'use babel';

export default class FlowDiagramReg {

  constructor(diagram, title, editor) {
    this.diagram = diagram
    this.title = title
    this.editor = editor
  }

  getTitle() {
    return this.title
  }
  createView(model) {}

}
