import 'core-js/stable'
import 'regenerator-runtime/runtime'
import TagsOperators from './tags'

class MarkdownActivity {
  constructor (quillJS, options = {}) {
    this.quillJS = quillJS
    this.options = options
    this.quillJS.on('text-change', this.onTextChange.bind(this))
    this.actionCharacters = {
      whiteSpace: ' ',
      newLine: '\n',
      asterisk: '*',
      rightParenthesis: ')',
      grave: '`',
      tilde: '~',
      underscore: '_'
    }
    this.ignoreTags = ['PRE', ...(options.ignoreTags || [])]
    this.tags = new TagsOperators(this.quillJS, options.tags)
    this.matches = this.tags.getOperatorsAll()
    this.fullMatches = this.tags.getFullTextOperatorsAll()
  }

  onTextChange (delta, oldContents, source) {
    if (source !== 'user') return
    console.log(delta)
    const cursorOffset = (delta.ops[0] && delta.ops[0].retain) || 0
    const inputText = delta.ops[0].insert || (delta.ops[1] && delta.ops[1].insert)
    if (!inputText) return
    console.log(cursorOffset, inputText)
    if (inputText.length > 1 || inputText === ')') {
      setTimeout(async () => {
        const cursorOffsetFixed = cursorOffset
        const tokens = inputText.split('\n')
        let _offset = cursorOffsetFixed
        // eslint-disable-next-line no-unused-vars
        for (let v of tokens) {
          const [line] = this.quillJS.getLine(_offset)
          if (!line) {
            return 0
          }
          console.log(line)
          const firstIndex = this.quillJS.getIndex(line)
          let _targetText = ''
          let result = await this.onFullTextExecute.bind(this)({ index: firstIndex, length: 0 })

          if (result) {
            while (result) {
              const [line] = this.quillJS.getLine(_offset)
              if (!line || !(line.domNode)) {
                result = false
                break
              }
              const firstIndex = this.quillJS.getIndex(line)
              _targetText = line.domNode.textContent || ''
              result = await this.onFullTextExecute.bind(this)({ index: firstIndex, length: 0 })
            }
          } else {
            _targetText = line.domNode.textContent || ''
          }
          _offset += _targetText.length + 1
        }
      }, 0)
      return
    }

    delta.ops.filter(e => e.hasOwnProperty('insert')).forEach(e => {
      switch (e.insert) {
        case this.actionCharacters.whiteSpace:
          this.onInlineExecute.bind(this)()
          break
        case this.actionCharacters.asterisk:
        case this.actionCharacters.rightParenthesis:
        case this.actionCharacters.grave:
        case this.actionCharacters.newLine:
        case this.actionCharacters.tilde:
        case this.actionCharacters.underscore:
          this.onFullTextExecute.bind(this)()
          break
      }
    })

    delta.ops.filter(e => e.hasOwnProperty('delete')).forEach((e) => {
      this.onRemoveElement(e)
    })
  }

  isValid (text, tagName) {
    return (
      typeof text !== 'undefined' &&
      text &&
      !this.ignoreTags.find(e => e === tagName)
    )
  }

  onInlineExecute () {
    const selection = this.quillJS.getSelection()
    if (!selection) return
    const [line, offset] = this.quillJS.getLine(selection.index)
    const text = line.domNode.textContent
    const lineStart = selection.index - offset
    const format = this.quillJS.getFormat(lineStart)
    if (format['code-block']) {
      // if exists text in code-block, to skip.
      return
    }
    if (this.isValid(text, line.domNode.tagName)) {
      for (let match of this.matches) {
        const matchedText = text.match(match.pattern)
        if (matchedText) {
          match.action(text, selection, match.pattern, lineStart)
          return
        }
      }
    }
  }

  async onFullTextExecute (virtualSelection) {
    let selection = virtualSelection || this.quillJS.getSelection()
    if (!selection) return false
    const [line, offset] = this.quillJS.getLine(selection.index)

    if (!line || offset < 0) return false
    const lineStart = selection.index - offset
    const format = this.quillJS.getFormat(lineStart)
    if (format['code-block']) {
      // if exists text in code-block, to skip.
      return false
    }
    const beforeNode = this.quillJS.getLine(lineStart - 1)[0]
    const beforeLineText = beforeNode && beforeNode.domNode.textContent
    const text = line.domNode.textContent
    selection.length = selection.index++

    if (this.isValid(text, line.domNode.tagName)) {
      // remove block rule.
      if (typeof beforeLineText === 'string' && beforeLineText.length > 0 && text === ' ') {
        const releaseTag = this.fullMatches.find(e => e.name === line.domNode.tagName.toLowerCase())
        if (releaseTag && releaseTag.release) {
          releaseTag.release(selection)
          return false
        }
      }

      for (let match of this.fullMatches) {
        const matchedText = text.match(match.pattern)
        if (matchedText) {
          // eslint-disable-next-line no-return-await
          return await match.action(text, selection, match.pattern, lineStart)
        }
      }
    }
    return false
  }

  onRemoveElement (range) {
    const selection = this.quillJS.getSelection()
    // if removed one item before, editor need to clear item.
    if (range && range.delete === 1) {
      const removeItem = this.quillJS.getLine(selection.index)
      const lineItem = removeItem[0]
      const releaseTag = this.matches.find(e => e.name === lineItem.domNode.tagName.toLowerCase())
      if (releaseTag && releaseTag.release) {
        releaseTag.release(selection)
      }
    }
  }
}

export default MarkdownActivity
