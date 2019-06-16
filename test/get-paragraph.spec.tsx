import { getParagraph } from '../src/get-selection-more'
import { h } from 'tsx-dom'

describe('getParagraph', () => {
  let $root = <div></div>

  beforeEach(() => {
    if ($root) {
      $root.remove()
    }
    $root = <div></div>
    document.body.appendChild($root)

    window.getSelection().removeAllRanges()
  })

  after(() => {
    if ($root) {
      $root.remove()
    }
  })

  it('should return empty text when no selection', () => {
    expect(getParagraph()).to.be.equal('')
  })

  it('should return only the text of a selected block element', () => {
    const el = (
      <div>
        <div>test</div>
        <div>test</div>
        <div>test</div>
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(el.children[1])
    window.getSelection().addRange(range)

    expect(getParagraph()).to.be.equal('test')
  })

  it('should return text of the selected inline element and its inline siblings', () => {
    const el = (
      <div>
        <span>one</span>
        two
        <span id='selected'>three</span>
        <i>four</i>
        five
        <div>six</div>
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(document.getElementById('selected'))
    window.getSelection().addRange(range)

    expect(getParagraph()).equal('onetwothreefourfive')
  })

  it('should return text of a range and the inline siblings of the node portions in range', () => {
    const el = (
      <div>
        <span>one</span>
        two
        <span id='start'>three</span>
        <i>four </i>
        five
        <div id='end'>
          six
          <strong>seven. </strong>
          <strong>eight?</strong>
          <p>nine</p>
          ten
        </div>
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.setStart(document.getElementById('start').firstChild, 2)
    range.setEnd(document.getElementById('end').firstChild, 3)
    window.getSelection().addRange(range)

    expect(getParagraph()).equal('onetwothreefour five sixseven. eight?')
  })

  it('should return the pargraph of the selected text in iframe', () => {
    const iframe = <iframe /> as HTMLIFrameElement
    $root.appendChild(iframe)

    const el = (
      <div>
        <span>one</span>
        two
        <span id='selected'>three</span>
        <i>four</i>
        five
        <div>six</div>
      </div>
    )
    iframe.contentDocument.body.appendChild(el)

    const range = iframe.contentDocument.createRange()
    range.selectNode(iframe.contentDocument.getElementById('selected'))
    iframe.contentWindow.getSelection().addRange(range)

    expect(getParagraph()).to.be.equal('')
    expect(getParagraph(iframe.contentWindow)).to.be.equal('onetwothreefourfive')
  })

  it('should ignore comment nodes', () => {
    const el = (
      <div>
        <a>one</a>
        two
        <span id='selected'>three</span>
        <i>four</i>
        five
        <div>six</div>
      </div>
    )
    $root.appendChild(el)

    const selected = document.getElementById('selected')
    el.insertBefore(document.createComment('this is a comment'), selected)

    const range = document.createRange()
    range.selectNode(selected)
    window.getSelection().addRange(range)

    expect(getParagraph()).equal('onetwothreefourfive')
  })
})
