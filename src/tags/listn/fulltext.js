class Link {
  constructor (quillJS, options = {}) {
    this.quillJS = quillJS
    this.name = 'list'
    this.pattern = options.pattern || /^\s{0,9}(\d)+\.\ /g
    this.getAction.bind(this)
  }

  getAction () {
    return {
      name: this.name,
      pattern: this.pattern,
      action: (text, selection, pattern) => new Promise((resolve) => {
        console.log(text, this.pattern, pattern)
        const match = pattern.exec(text)
        if (!match) {
          resolve(false)
          return
        }
        const [line] = this.quillJS.getLine(selection.index)

        console.log(line.parent, line.parent.domNode, line.parent.domNode.tagName)
        if (line && line.parent && line.parent.domNode &&
          line.parent.domNode.tagName === 'OL' || line.parent.domNode.tagName === 'UL') {
          return
        }
        const index = this.quillJS.getIndex(line)

        setTimeout(() => {
          const depth = text.split('. ')[0].split('').filter(e => / /gi.test(e)).length
          const replaceText = text.split('. ').splice(1, 1).join('')
          console.log(depth, replaceText)
          this.quillJS.insertText(index, replaceText)
          this.quillJS.deleteText(index + replaceText.length - 1, text.length)
          setTimeout(() => {
            this.quillJS.formatLine(index, 0, { list: 'ordered', indent: depth })
            resolve(true)
          }, 0)
        }, 0)
      })
    }
  }
}

export default Link
