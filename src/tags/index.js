import Header from './header/index.js'
import Blockquote from './blockquote/index.js'
import BlockquoteFulltext from './blockquote/fulltext.js'
import Bold from './bold/index.js'
import CheckBoxChecked from './checkbox/fulltext-checked.js'
import CheckBoxUnchecked from './checkbox/fulltext-unchecked.js'
import InlineCode from './inlinecode/index.js'
import Italics from './italics/index.js'
import Link from './link/index.js'
import LinkFullText from './link/fulltext.js'
import ListOfNumberFulltext from './listn/fulltext.js'
import ListOfBulletFulltext from './listb/fulltext.js'
import Codeblock from './codeblock/index.js'
import CodeblockFullText from './codeblock/fulltext.js'
import Strikethrough from './strikethrough/index.js'

class TagsOperators {
  constructor (quillJS, tags = {}) {
    this.quillJS = quillJS
    this.getOperatorsAll.bind(this)
    this.tags = [
      new Header(this.quillJS, tags.header).getAction(),
      new Blockquote(this.quillJS, tags.blockquote).getAction(),
      new Bold(this.quillJS, tags.bold).getAction(),
      new Link(this.quillJS, tags.link).getAction(),
      new Codeblock(this.quillJS, tags.codeblock).getAction(),
      new InlineCode(this.quillJS, tags.inlinecode).getAction(),
      new Strikethrough(this.quillJS, tags.strikethrough).getAction(),
      new Italics(this.quillJS, tags.italic).getAction()
    ]

    this.fullTextTags = [
      new Header(this.quillJS, tags.header).getAction(),
      new CheckBoxChecked(this.quillJS, tags.checkBoxChecked).getAction(),
      new CheckBoxUnchecked(this.quillJS, tags.checkBoxUnchecked).getAction(),
      new ListOfNumberFulltext(this.quillJS, tags.listOfNumberFulltext).getAction(),
      new ListOfBulletFulltext(this.quillJS, tags.listOfBulletFulltext).getAction(),
      new BlockquoteFulltext(this.quillJS, tags.blockquote).getAction(),
      new CodeblockFullText(this.quillJS, tags.codeblock).getAction(),
      new Bold(this.quillJS, tags.bold).getAction(),
      new LinkFullText(this.quillJS, tags.link).getAction(),
      new InlineCode(this.quillJS, tags.inlinecode).getAction(),
      new Strikethrough(this.quillJS, tags.strikethrough).getAction(),
      new Italics(this.quillJS, tags.italic).getAction()
    ]
  }

  getOperatorsAll () {
    return this.tags
  }

  getFullTextOperatorsAll () {
    return this.fullTextTags
  }
}

export default TagsOperators
