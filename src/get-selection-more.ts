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

function extractSentenceHead(anchorNode: Node | null, anchorOffset: number): string {
  if (!anchorNode || anchorNode.nodeType !== Node.TEXT_NODE) {
    return ''
  }

  let leadingText = anchorNode.textContent || ''
  if (leadingText) {
    leadingText = leadingText.slice(0, anchorOffset)
  }

  // prev siblings
  for (let node = anchorNode.previousSibling; node; node = node.previousSibling) {
    leadingText = getTextFromNode(node) + leadingText
  }

  // parent prev siblings
  for (
    let element = anchorNode.parentElement;
    element && element !== document.body && isInlineTag(element);
    element = element.parentElement
  ) {
    for (let node = element.previousSibling; node; node = node.previousSibling) {
      leadingText = getTextFromNode(node) + leadingText
    }
  }

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

  return leadingText
}

function extractSentenceTail(focusNode: Node | null, focusOffset: number): string {
  if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE) {
    return ''
  }

  let tailingText = focusNode.textContent || ''
  if (tailingText) {
    tailingText = tailingText.slice(focusOffset)
  }

  // next siblings
  for (let node = focusNode.nextSibling; node; node = node.nextSibling) {
    tailingText += getTextFromNode(node)
  }

  // parent next siblings
  for (
    let element = focusNode.parentElement;
    element && element !== document.body && isInlineTag(element);
    element = element.parentElement
  ) {
    for (let node = element.nextSibling; node; node = node.nextSibling) {
      tailingText += getTextFromNode(node)
    }
  }

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

function isInlineTag(el: HTMLElement): boolean {
  switch (el.tagName) {
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
