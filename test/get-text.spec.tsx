import { getText, getTextFromSelection } from '../src/get-selection-more'
import { h } from 'tsx-dom'

describe('getText', () => {
  let $root = <div></div>

  beforeEach(() => {
    if ($root) {
      $root.remove()
    }
    $root = <div></div>
    document.body.appendChild($root)

    window.getSelection()!.removeAllRanges()
  })

  after(() => {
    if ($root) {
      $root.remove()
    }
  })

  it('should return empty text when no selection', () => {
    expect(getText()).to.be.equal('')
    expect(getTextFromSelection(window.getSelection())).to.be.equal('')
  })

  it('should return whole text when a element node is selected', () => {
    const el = <div>test</div>
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(el)
    window.getSelection()!.addRange(range)

    expect(getText()).to.be.equal('test')
  })

  it('should return text of all the children when a element node is selected', () => {
    const el = (
      <div>
        test<span>test</span>test
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(el)
    window.getSelection()!.addRange(range)

    expect(getText()).equal('testtesttest')
  })

  it('should return selected text when part of a text node is selected', () => {
    const el = (
      <div>
        test<span>test</span>test
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.setStart(el.firstElementChild!.firstChild!, 2)
    range.setEnd(el.firstElementChild!.firstChild!, 3)
    window.getSelection()!.addRange(range)

    expect(getText()).to.equal('s')
  })

  it('should return selected text when part of two nodes are selected', () => {
    const el = (
      <div>
        test<span>test</span>test
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.setStart(el.firstElementChild!.firstChild!, 2)
    range.setEnd(el.lastChild!, 3)
    window.getSelection()!.addRange(range)

    expect(getText()).to.equal('sttes')
  })

  it('should return selected text when part of more block elements are selected', () => {
    const el = (
      <div>
        <div>test</div>
        <div>test</div>
        <div>test</div>
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.setStart(el.firstElementChild!.firstChild!, 2)
    range.setEnd(el.lastElementChild!.firstChild!, 3)
    window.getSelection()!.addRange(range)

    expect(getText()).to.equal('st\ntest\ntes')
  })

  it('should return selected text on input', () => {
    const el = <input type="text" value="test" /> as HTMLInputElement
    $root.appendChild(el)

    el.focus()
    el.setSelectionRange(0, 4)

    expect(getText()).to.equal('test')
  })

  it('should return empty text on focused input with no selection', () => {
    const el = <input type="text" /> as HTMLInputElement
    $root.appendChild(el)

    el.focus()

    expect(getText()).to.equal('')
  })

  it('should return selected text in iframe', () => {
    const iframe = <iframe /> as HTMLIFrameElement
    $root.appendChild(iframe)

    const el = <div>test</div>
    iframe.contentDocument!.body.appendChild(el)

    if (!iframe.contentWindow!.getSelection()) {
      // buggy firefox
      return
    }

    const range = iframe.contentDocument!.createRange()
    range.selectNode(el)
    const selection = iframe.contentWindow!.getSelection()

    if (selection) {
      selection.addRange(range)
      expect(getText()).to.be.equal('')
      expect(getText(iframe.contentWindow as typeof window)).to.be.equal('test')
    } else {
      // buggy firefox
      expect(getText()).to.be.equal('')
      expect(getText(iframe.contentWindow as typeof window)).to.be.equal('')
    }
  })

  it('should return empty text in non-displayed iframe', () => {
    const iframe = <iframe style="display: none" /> as HTMLIFrameElement
    $root.appendChild(iframe)

    const el = <div>test</div>
    iframe.contentDocument!.body.appendChild(el)

    const range = iframe.contentDocument!.createRange()
    range.selectNode(el)
    const selection = iframe.contentWindow!.getSelection()

    if (selection) {
      selection.addRange(range)
    }

    expect(getText()).to.be.equal('')
    expect(getText(iframe.contentWindow as typeof window)).to.be.equal('')
  })
})
