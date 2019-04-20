'use babel';

const spawn = require('child_process').spawn;
const path = require('path');


export default class Builder {

  constructor() {}

  build(diagram) {

    return new Promise((resolve,reject) => {
      let svg = "";
      let error = "";
      const childProcess = spawn(`${__dirname}/../sequence/WebDiagram`, []);
      childProcess.stdin.write(diagram);
      childProcess.stdin.end();
      childProcess.stdout.on('data', (data) => { svg += data });
      childProcess.stderr.on('data', (data) => { error += data });
      childProcess.on('close', (code) => {
          if(code == 0) {
            return resolve(svg);
          }
          const lineError = parseInt(error.match(/(?:syntax error at line\s+)([0-9]+)?\.*/)[1] || "");
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
