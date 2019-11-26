# Get Selection More [![npm-version](https://img.shields.io/npm/v/get-selection-more.svg)](https://www.npmjs.com/package/get-selection-more) [![Build Status](https://img.shields.io/travis/com/crimx/get-selection-more/master)](https://travis-ci.com/crimx/get-selection-more) [![Coverage Status](https://img.shields.io/coveralls/github/crimx/get-selection-more/master)](https://coveralls.io/github/crimx/get-selection-more?branch=master)

![Get Selection More](./assets/get-selection-more.png)

## APIs

```typescript
/**
 * Returns the selected text
 */
function getText(win?: Window): string
function getTextFromSelection(selection: Selection | null, win?: Window): string
/**
 * Returns the paragraph containing the selection text.
 */
function getParagraph(win?: Window): string
function getParagraphFromSelection(selection: Selection | null): string
/**
 * Returns the sentence containing the selection text.
 */
function getSentence(win?: Window): string
function getSentenceFromSelection(selection: Selection | null): string
```

Optionally pass `window` of other frame to get selection within that frame.

## Usage

```javascript
import { getText, getParagraph, getSentence } from 'get-selection-more'

document.addEventListener('selectionchange', () => {
  console.log(getText(), getParagraph(), getSentence())
})
```

Or load the UMD module directly which exposes `getSelectionMore` global.
