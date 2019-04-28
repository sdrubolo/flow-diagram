'use babel';

const spawn = require('child_process').spawn;
const path = require('path');


export default class Builder {

  constructor() {}

  build(diagram) {

    return new Promise((resolve,reject) => {
      let text = "";
      let error = "";
      const binaryVersion = process.platform === "darwin" ? "WebDiagram" : "WebDiagram_Linux"
      const childProcess = spawn(`${__dirname}/../sequence/${binaryVersion}`, []);
      childProcess.stdin.write(diagram);
      childProcess.stdin.end();
      childProcess.stdout.on('data', (data) => { text += data });
      childProcess.stderr.on('data', (data) => { error += data });
      childProcess.on('close', (code) => {
          if(code == 0) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "image/svg+xml");
            const svg = doc.documentElement
            const height = svg.getAttribute("height");
            const width = svg.getAttribute("width");
            return resolve({ text, svg, height, width });
          }

          const syntaxError = error.match(/(?:syntax error at line\s+)([0-9]+)?\.*/)
          let lineError;
          if(syntaxError) {
            lineError = parseInt(error.match(/(?:syntax error at line\s+)([0-9]+)?\.*/)[1] || "");
          }
          reject({ error: code, message: error, lineError: lineError})
      });

    })
  }

  isDiagramPath(title) {
    return /\.diagram$/.test(title)
  }

  getDiagramPreviewTitle(title) {
    return `${title} preview`
  }

  getDiagramSvgTitle(title) {
    return `${title}.svg`
  }

}
