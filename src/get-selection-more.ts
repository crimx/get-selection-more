/**
 * Returns the selected text
 */
export function getText(win = window): string {
  // When called on an <iframe> that is not displayed (eg. where display: none is set)
  // Firefox will return null, whereas other browsers will return a Selection object
  // with Selection.type set to None.
  const selection = (win.getSelection() || '').toString().trim()
  if (selection) {
    return selection
  }

  // Currently getSelection() doesn't work on the content of <input> elements in Firefox
  // Document.activeElement returns the focused element.
  const activeElement = win.document.activeElement
  if (activeElement) {
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      const el = activeElement as HTMLInputElement | HTMLTextAreaElement
      return el.value.slice(el.selectionStart || 0, el.selectionEnd || 0)
    }
  }

  return ''
}

/**
 * Returns the paragraph containing the selection text.
 */
export function getParagraph(win = window): string {
  const selection = win.getSelection()
  if (!selection || selection.rangeCount <= 0) {
    return ''
  }

  const selectedText = selection.toString()
  if (!selectedText.trim()) {
    return ''
  }

  const range = selection.getRangeAt(0)
  if (!range) {
    return ''
  }

  return (extractParagraphHead(range) + selectedText + extractParagraphTail(range))
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Returns the sentence containing the selection text.
 */
export function getSentence(win = window): string {
  const selection = win.getSelection()
  if (!selection || selection.rangeCount <= 0) {
    return ''
  }

  const selectedText = selection.toString()
  if (!selectedText.trim()) {
    return ''
  }

  const range = selection.getRangeAt(0)
  if (!range) {
    return ''
  }

  return (
    extractSentenceHead(extractParagraphHead(range)) +
    selectedText +
    extractSentenceTail(extractParagraphTail(range))
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function extractParagraphHead(range: Range): string {
  if (!range.startContainer) {
    return ''
  }

  let startNode = range.startContainer
  let leadingText = ''
  switch (startNode.nodeType) {
    case Node.TEXT_NODE: {
      const textContent = startNode.textContent
      if (textContent) {
        leadingText = textContent.slice(0, range.startOffset)
      }
      break
    }
    case Node.COMMENT_NODE:
    case Node.CDATA_SECTION_NODE:
      break
    default:
      startNode = startNode.childNodes[range.startOffset]
  }

  // parent prev siblings
  for (let node = startNode; isInlineNode(node); node = node.parentElement) {
    for (let sibl = node.previousSibling; isInlineNode(sibl); sibl = sibl.previousSibling) {
      leadingText = getTextFromNode(sibl) + leadingText
    }
  }

  return leadingText
}

function extractParagraphTail(range: Range): string {
  if (!range.endContainer) {
    return ''
  }

  let endNode = range.endContainer
  let tailingText = ''
  switch (endNode.nodeType) {
    case Node.TEXT_NODE: {
      const textContent = endNode.textContent
      if (textContent) {
        tailingText = textContent.slice(range.endOffset)
      }
      break
    }
    case Node.COMMENT_NODE:
    case Node.CDATA_SECTION_NODE:
      break
    default:
      endNode = endNode.childNodes[range.endOffset - 1]
  }

  // parent next siblings
  for (let node = endNode; isInlineNode(node); node = node.parentElement) {
    for (let sibl = node.nextSibling; isInlineNode(sibl); sibl = sibl.nextSibling) {
      tailingText += getTextFromNode(sibl)
    }
  }

  return tailingText
}

function extractSentenceHead(leadingText: string): string {
  // split regexp to prevent backtracking
  if (leadingText) {
    const puncTester = /[.?!。？！…]/
    /** meaningful char after dot "." */
    const charTester = /[^\s.?!。？！…]/

    for (let i = leadingText.length - 1; i >= 0; i--) {
      const c = leadingText[i]
      if (puncTester.test(c)) {
        if (c === '.' && charTester.test(leadingText[i + 1])) {
          // a.b is allowed
          continue
        }
        return leadingText.slice(i + 1)
      }
    }
  }
  return leadingText
}

function extractSentenceTail(tailingText: string): string {
  // match tail                                                       for "..."
  const tailMatch = /^((\.(?![\s.?!。？！…]))|[^.?!。？！…])*([.?!。？！…]){0,3}/.exec(tailingText)
  return tailMatch ? tailMatch[0] : ''
}

function getTextFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ''
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    return (node as HTMLElement).innerText
  }
  return ''
}

function isInlineNode(node?: Node | null): boolean {
  if (!node) {
    return false
  }

  switch (node.nodeType) {
    case Node.TEXT_NODE:
    case Node.COMMENT_NODE:
    case Node.CDATA_SECTION_NODE:
      return true
    case Node.ELEMENT_NODE: {
      switch ((node as HTMLElement).tagName) {
        case 'A':
        case 'ABBR':
        case 'B':
        case 'BDI':
        case 'BDO':
        case 'BR':
        case 'CITE':
        case 'CODE':
        case 'DATA':
        case 'DFN':
        case 'EM':
        case 'I':
        case 'KBD':
        case 'MARK':
        case 'Q':
        case 'RP':
        case 'RT':
        case 'RTC':
        case 'RUBY':
        case 'S':
        case 'SAMP':
        case 'SMALL':
        case 'SPAN':
        case 'STRONG':
        case 'SUB':
        case 'SUP':
        case 'TIME':
        case 'U':
        case 'VAR':
        case 'WBR':
          return true
        default:
          return false
      }
    }
    default:
      return false
  }
}
