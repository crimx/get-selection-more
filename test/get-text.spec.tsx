import { getText } from '../src/get-selection-more'
import { h } from 'tsx-dom'

describe('getText', () => {
  let $root = <div></div>

  beforeEach(() => {
    if ($root) {
      $root.remove()
    }
    $root = <div></div>
    document.body.appendChild($root)

    getSelection().removeAllRanges()
  })

  it('should return whole text when a element node is selected', () => {
    const el = <div>test</div>
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(el)
    getSelection().addRange(range)

    expect(getText()).to.be.equal('test')
  })

  it('should return text of all the children when a element node is selected', () => {
    const el = <div>test<span>test</span>test</div>
    $root.appendChild(el)

    const range = document.createRange()
    range.selectNode(el)
    getSelection().addRange(range)

    expect(getText()).equal('testtesttest')
  })

  it('should return selected text when part of a text node is selected', () => {
    const el = <div>test<span>test</span>test</div>
    $root.appendChild(el)

    const range = document.createRange()
    range.setStart(el.firstElementChild.firstChild, 2)
    range.setEnd(el.firstElementChild.firstChild, 3)
    getSelection().addRange(range)

    expect(getText()).to.equal('s')
  })

  it('should return selected text when part of two nodes are selected', () => {
    const el = <div>test<span>test</span>test</div>
    $root.appendChild(el)

    const range = document.createRange()
    range.setStart(el.firstElementChild.firstChild, 2)
    range.setEnd(el.lastChild, 3)
    getSelection().addRange(range)

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
    range.setStart(el.firstElementChild.firstChild, 2)
    range.setEnd(el.lastElementChild.firstChild, 3)
    getSelection().addRange(range)

    expect(getText()).to.equal('st\ntest\ntes')
  })

  it('should return selected text in input', () => {
    const el = (
      <input type='text' value='test' />
    ) as HTMLInputElement
    $root.appendChild(el)

    el.focus()
    el.setSelectionRange(0, 4)

    expect(getText()).to.equal('test')
  })
})
