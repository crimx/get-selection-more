/**
 * Returns the selected text
 */
export function getText(win = window): string {
  const selection = (win.getSelection() || '').toString().trim()
  if (selection) {
    return selection
  }

  // Firefox fix
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
  if (!selection) {
    return ''
  }

  const selectedText = selection.toString()
  if (!selectedText.trim()) {
    return ''
  }

  return (
    extractParagraphHead(selection.anchorNode, selection.anchorOffset) +
    selectedText +
    extractParagraphTail(selection.focusNode, selection.focusOffset)
  )
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Returns the sentence containing the selection text.
 */
export function getSentence(win = window): string {
  const selection = win.getSelection()
  if (!selection) {
    return ''
  }

  const selectedText = selection.toString()
  if (!selectedText.trim()) {
    return ''
  }

  return (
    extractSentenceHead(selection.anchorNode, selection.anchorOffset) +
    selectedText +
    extractSentenceTail(selection.focusNode, selection.focusOffset)
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function extractParagraphHead(anchorNode: Node | null, anchorOffset: number): string {
  if (!anchorNode || anchorNode.nodeType !== Node.TEXT_NODE) {
    return ''
  }

  let leadingText = anchorNode.textContent || ''
  if (leadingText) {
    leadingText = leadingText.slice(0, anchorOffset)
  }

  // parent prev siblings
  for (let parent = anchorNode; isInlineNode(parent); parent = parent.parentElement) {
    for (let node = parent.previousSibling; isInlineNode(parent); node = node.previousSibling) {
      leadingText = getTextFromNode(node) + leadingText
    }
  }

  return leadingText
}

function extractParagraphTail(focusNode: Node | null, focusOffset: number): string {
  if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE) {
    return ''
  }

  let tailingText = focusNode.textContent || ''
  if (tailingText) {
    tailingText = tailingText.slice(focusOffset)
  }

  // parent next siblings
  for (let parent = focusNode; isInlineNode(parent); parent = parent.parentElement) {
    for (let node = parent.nextSibling; isInlineNode(parent); node = node.nextSibling) {
      tailingText += getTextFromNode(node)
    }
  }

  // match tail                                                       for "..."
  const sentenceTailTester = /^((\.(?![\s.?!。？！…]))|[^.?!。？！…])*([.?!。？！…]){0,3}/
  return (tailingText.match(sentenceTailTester) || [''])[0]
}

function extractSentenceHead(anchorNode: Node | null, anchorOffset: number): string {
  const leadingText = extractParagraphHead(anchorNode, anchorOffset)
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

function extractSentenceTail(focusNode: Node | null, focusOffset: number): string {
  const tailingText = extractParagraphTail(focusNode, focusOffset)
  // match tail                                                       for "..."
  const sentenceTailTester = /^((\.(?![\s.?!。？！…]))|[^.?!。？！…])*([.?!。？！…]){0,3}/
  return (tailingText.match(sentenceTailTester) || [''])[0]
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

  if (node.nodeType === Node.TEXT_NODE) {
    return true
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
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

  return false
}
