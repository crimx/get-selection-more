import { getSentence } from '../src/get-selection-more'
import { h } from 'tsx-dom'

describe('getSentence', () => {
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
    expect(getSentence()).to.be.equal('')
  })

  it('should return empty text on empty element', () => {
    const el = <div></div>
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(el)
    window.getSelection()!.addRange(range)

    expect(getSentence()).to.be.equal('')
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
    window.getSelection()!.addRange(range)

    expect(getSentence()).to.be.equal('test')
  })

  it('should return sentence of the selected inline element with inline siblings', () => {
    const el = (
      <div>
        hey! this is a <span id="selected">text</span> in a <strong>sentence</strong>.
        <div>block</div>
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(document.getElementById('selected')!)
    window.getSelection()!.addRange(range)

    expect(getSentence()).equal('this is a text in a sentence.')
  })

  it('should return sentence of a range', () => {
    const el = (
      <div>
        this is zero. this is <span id="start">sentence</span> one.
        <p id="end">
          this is <em>sentence</em> two.
        </p>
        <p>
          this is <b>sentence</b> three.
        </p>
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.setStart(document.getElementById('start')!.firstChild!, 2)
    range.setEnd(document.getElementById('end')!.firstChild!, 3)
    window.getSelection()!.addRange(range)

    expect(getSentence()).equal('this is sentence one. this is sentence two.')
  })

  it('should allow "a.b"', () => {
    const el = (
      <div>
        yo! bar.foo <span id="selected">code</span> like foo.bar should be allowed... ok?
      </div>
    )
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(document.getElementById('selected')!)
    window.getSelection()!.addRange(range)

    expect(getSentence()).equal('bar.foo code like foo.bar should be allowed...')
  })

  it('should return the sentence of the selected text in iframe', () => {
    const iframe = <iframe srcDoc="<div></div>"></iframe> as HTMLIFrameElement
    $root.appendChild(iframe)

    const el = (
      <div>
        this is zero. this is <span id="start">sentence</span> one.
        <p id="end">
          this is <em>sentence</em> two.
        </p>
        <p>
          this is <b>sentence</b> three.
        </p>
      </div>
    )
    iframe.contentDocument!.body.appendChild(el)

    if (!iframe.contentWindow!.getSelection()) {
      // buggy firefox
      return
    }

    const range = iframe.contentDocument!.createRange()
    range.setStart(iframe.contentDocument!.getElementById('start')!.firstChild!, 2)
    range.setEnd(iframe.contentDocument!.getElementById('end')!.firstChild!, 3)
    iframe.contentWindow!.getSelection()!.addRange(range)

    expect(getSentence()).equal('')
    expect(getSentence(iframe.contentWindow as typeof window)).equal(
      'this is sentence one. this is sentence two.'
    )
  })

  it('should ignore comment nodes', () => {
    const el = (
      <div>
        this is zero. this is <span id="start">sentence</span> one.
        <p id="end">
          this is <em>sentence</em> two.
        </p>
        <p>
          this is <b>sentence</b> three.
        </p>
      </div>
    )
    $root.appendChild(el)

    el.insertBefore(document.createComment('this is a comment'), document.getElementById('start'))

    document
      .getElementById('end')!
      .insertBefore(
        document.createComment('this is a comment'),
        document.getElementById('end')!.firstChild
      )

    const range = document.createRange()
    range.setStart(document.getElementById('start')!.firstChild!, 2)
    range.setEnd(document.getElementById('end')!.firstChild!, 3)
    window.getSelection()!.addRange(range)

    expect(getSentence()).equal('this is sentence one. this is sentence two.')
  })
})
