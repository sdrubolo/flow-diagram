'use babel';

import FlowDiagramView from './flow-diagram-view';
import FlowDiagramReg from './flow-diagram-reg';
import { CompositeDisposable, Point } from 'atom';
import Builder from './flow-diagram-builder';
import FlowDiagramSVGView from './flow-diagram-svg-view';
import EventEmitter from 'events';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import fs from 'fs';


// TODO
// 3. when error occurs higlight line where it is happening and map no file found error better

export default {

  flowDiagramView: null,
  modalPanel: null,
  subscriptions: null,
  builder: null,
  emitter: null,
  errorStack: null,

  activate(state) {

    emitter = new EventEmitter();
    errorStack = []

    this.flowDiagramView = new FlowDiagramView(state.flowDiagramViewState, emitter);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.flowDiagramView.getElement(),
      visible: false
    });

    emitter.on("Escape", () => this.close() )
    emitter.on("Export", (v) => this.exportTo(v) )

    this.openPanes = this.openPanes || {};
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.builder = new Builder()

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'flow-diagram:build': () => this.buildDiagram(),
      'flow-diagram:build-right': () => this.buildDiagram("right"),
      'flow-diagram:export-svg': () => this.export("svg"),
      'flow-diagram:export-pdf': () => this.export("pdf")
    }));

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'flow-diagram:close' : () => this.close()
    }));

    atom.workspace.onDidOpen(event => this.bindOnOpen(event))

    makeView = (data) => {
      data.view = new FlowDiagramSVGView(data.diagram)
      return data.view.getElement()
    }

    atom.views.addViewProvider(FlowDiagramReg, makeView)
    atom.workspace.addOpener((uri, options) => {
      if (!uri.match(/flow\-diagram:\/\//)) {
        return;
      }
      return new FlowDiagramReg(options.diagram,options.title, options.editor);
    });
  },

  bindOnOpen(event) {
    if (event.item instanceof FlowDiagramReg) {
      let editor = event.item.editor;
      let buildOnSave = () => this.buildOnSave(editor)
      editor.onDidSave( buildOnSave )
      event.pane.onDidDestroy(() => {
        this.openPanes[event.item.getTitle()] = undefined
        editor.getBuffer().emitter.off("did-save", buildOnSave )
      })
    }
  },

  build(builder, editor, success) {
    builder.build(editor.getText())
      .then(success)
      .then(() => {
        errorStack.forEach(d => d.destroy())
        errorStack = []
      })
      .catch(err => {

        const errorMessage = err.message;
        if(err.lineError) {
          let marker = editor.markBufferRange( [ [err.lineError-1, 0], [err.lineError-1, 0] ] )
          let decorator = editor.decorateMarker(marker, {type: 'line-number', class: 'diagram-error'})
          errorStack.push(decorator)
        }

        this.showNotification("Error while generating diagram flow", undefined, errorMessage)
      })
  },

  buildOnSave(editor) {
    const title = editor.getTitle();
    const onSuccess = (data) => {
      const paneTitle = this.builder.getDiagramPreviewTitle(title);
      this.openPanes[paneTitle].view.updateDiagram(data)
    }
    this.build(this.builder, editor, onSuccess)
  },

  deactivate() {
    this.openPanes = undefined
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.flowDiagramView.destroy();
  },

  serialize() {
    return {
      flowDiagramViewState: this.flowDiagramView.serialize()
    };
  },

  close() {
    if(this.modalPanel.isVisible()) {
      this.modalPanel.hide()
    }
  },

  exportTo(obj) {
    if(this.modalPanel.isVisible()) {
      this.modalPanel.hide()
      let path = obj.path;
      if (editor = atom.workspace.getActiveTextEditor()) {
        let msgTitle = "Diagram saved on file";
        const title = editor.getTitle();
        const onSuccess = (data) => {
          if(obj.type === "pdf") {
            const widthPt =  data.width * 72 / 96;
            const heightPt =  data.height * 72 / 96;
            const doc = new PDFDocument({compress: true, size: [widthPt, heightPt]}),
                  stream = fs.createWriteStream(path);
            SVGtoPDF(doc, data.svg, 0, 0, { width: widthPt, height: heightPt });
            doc.pipe(stream);
            doc.end();
            this.showNotification(msgTitle, `${title} was successful saved on ${path}`, undefined)
          }
          else {
            fs.writeFile(path, data.text, (err) => {
                if(err) {
                  msgTitle = "Error while saving svg"
                }
                this.showNotification(msgTitle, `${title} was successful saved on ${path}`, err)
            });
          }

        }
        this.build(this.builder, editor, onSuccess)
      }
    }
  },

  showNotification(title, message, error) {
    let notification;
    if(error) {
      notification = atom.notifications.addError(title, {
        detail : error,
        dismissable : true
      })
    }
    else {
      notification = atom.notifications.addSuccess(title, {
        detail : message,
        dismissable : true
      })
    }
    setTimeout( () => notification.dismiss(), 3000 )
  },

  export(type) {
    if(!this.modalPanel.isVisible()) {
      let editor;
      let svgPath = "";
      if (editor = atom.workspace.getActiveTextEditor()) {
        svgPath = editor.getPath() || "";
      }
      this.flowDiagramView.addFilePath(svgPath, type)
      this.modalPanel.show()
    }
  },

  buildDiagram(position) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      const title = editor.getTitle()

      if(this.builder.isDiagramPath(title)) {
        const onSuccess = (data) => {
          const paneTitle =  this.builder.getDiagramPreviewTitle(title);
          if(!this.openPanes[paneTitle]) {
            atom.workspace.open("flow-diagram://view", {
              split : position,
              diagram : data,
              editor: editor,
              title: paneTitle
            })
            .then(diagramView => {
              this.openPanes[paneTitle] = diagramView;
            })
          }
        }
        this.build(this.builder, editor, onSuccess)
      }
    }

  }

};
