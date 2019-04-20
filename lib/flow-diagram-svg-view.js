'use babel';

import { $, $$$, ScrollView } from 'atom-space-pen-views'
import ResizeObserver from 'resize-observer-polyfill';

class FlowDiagramSVGView extends ScrollView  {

  static content () {
    this.div({ outlet: 'flowContainer', class: 'flow-diagram-svg-preview native-key-bindings', tabindex: -1, background: 'white' }, () => {
      this.div({ outlet: 'controls', class: 'flow-diagram-image-controls' }, () => {
        this.div({ class: 'flow-diagram-image-controls-group btn-group' }, () => {
          this.button({ class: 'btn', outlet: 'zoomOutButton' }, () => {
            this.text('-')
          })
          this.button({ class: 'btn reset-zoom-button', outlet: 'resetZoomButton' }, () => {
            this.text('100%')
          })
          this.button({ class: 'btn', outlet: 'zoomInButton' }, () => {
            this.text('+')
          })
        })
      })
      this.div({ outlet: 'flowWebviewContainer', style: "width:100%; height:100%; overflow: scroll; text-align:center" }, () => {})
    })
  }

  addSvgInContainer() {
    let svgContainer = this.flowWebviewContainer[0];
    if(svgContainer.firstChild)
      svgContainer.removeChild(svgContainer.firstChild)
    svgContainer.appendChild(this.svg)
    return svgContainer
  }

  attached () {
    if (this.isAttached) { return }

    this.isAttached = true;


    this.zoomOutButton.on('click', (e) => this.zoomOut() )
    this.resetZoomButton.on('click', (e) => this.zoomReset())
    this.zoomInButton.on('click', (e) => this.zoomIn() )

    const ro = new ResizeObserver((entries, observer) => {
      for (const entry of entries) {
          const {left, top, width, height} = entry.contentRect;
          this.initialRate = width/this.svgIntialWidth;
      }
    });

    ro.observe(this.addSvgInContainer());
    this.setAsNewDiagram()
  }

  setAsNewDiagram(rate) {
    this.initialRate =  this.flowWebviewContainer[0].clientWidth/this.svgIntialWidth
    const computeInRage = rate || this.initialRate
    const { newHeight, newWidth } = this.computeSizeByRate(computeInRage)
    this.computeSize(computeInRage,newHeight,newWidth)
  }

  computeSizeByRate(rate) {
    const newHeight = this.svgIntialHeight*rate
    const newWidth  = this.svgIntialWidth*rate
    return { newHeight, newWidth }
  }

  computeSize(rate,height,width) {
    let svgContainer = this.flowWebviewContainer[0];
    this.rate = rate
    this.scalePoint.attr("transform",`scale(${this.rate})`)
    this.svg.setAttribute("width", width)
    const heightRate = svgContainer.clientHeight/height;
    const additionalHeight = heightRate > 1 ? 0 : this.footerHeight;
    this.svg.setAttribute("height",additionalHeight+height)
  }

  zoomReset() {
    const { newHeight, newWidth } = this.computeSizeByRate(this.initialRate)
    this.computeSize(this.initialRate, newHeight, newWidth)
  }

  zoomIn() {
    const newRate = this.rate+0.1;
    const { newHeight, newWidth } = this.computeSizeByRate(newRate)
    this.computeSize(newRate, newHeight, newWidth)
    if(newRate-0.1 > 0)
      this.zoomOutButton.removeAttr("disabled")
  }

  zoomOut() {
    const newRate = this.rate-0.1;
    const { newHeight, newWidth } = this.computeSizeByRate(newRate)
    this.computeSize(newRate, newHeight, newWidth)
    if(newRate-0.1 <= 0)
      this.zoomOutButton.attr("disabled","true")
  }

  constructor(diagram) {
    super()
    this.setDiagram(diagram)
    this.footerHeight = $("footer").height()
  }

  updateDiagram(diagram) {
    this.setDiagram(diagram)
    this.addSvgInContainer()
    this.setAsNewDiagram(this.rate)
  }

  setDiagram(diagram) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(diagram, "image/svg+xml");
    this.svg = doc.documentElement
    this.scalePoint = $(this.svg).find("g").first();
    this.svgIntialHeight = this.svg.getAttribute("height");
    this.svgIntialWidth = this.svg.getAttribute("width");
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

module.exports = FlowDiagramSVGView
