<template>
  <div :class="`language-wiki`">
    <button title="Copy Code" class="copy" @click="copyToClipboard(code)"></button>
    <span class="lang">wiki</span>
    <n-scrollbar x-scrollable>
      <component :is="vnode" />
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { createHighlighterCore } from 'shiki/core'
import { computedAsync, usePreferredDark } from '@vueuse/core'
import { h } from 'vue'
import { NScrollbar } from 'naive-ui'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import wikiLang from '@shikijs/langs/wikitext'
import htmlLang from '@shikijs/langs/html'
import lightTheme from '@shikijs/themes/light-plus'
import darkTheme from '@shikijs/themes/dark-plus'

const isDark = usePreferredDark()

// Cache the highlighter instance
const highlighterPromise = createHighlighterCore({
  langs: [wikiLang, htmlLang],
  themes: [lightTheme, darkTheme],
  engine: createJavaScriptRegexEngine()
})

async function highlightCode(code: string, isDark: boolean) {
  const highlighter = await highlighterPromise
  return highlighter.codeToHtml(code, { lang: 'wiki', theme: isDark ? 'dark-plus' : 'light-plus' })
}

const { code } = defineProps({
  code: {
    type: String,
    required: true
  }
})

const vnode = computedAsync(async () => {
  // Generate HTML string using the cached highlighter
  const html = await highlightCode(code, isDark.value)
  // Convert HTML string to vnode
  const wrapped = h('div', { innerHTML: html })
  if (!wrapped.children) {
    return wrapped
  }
  return h(wrapped.children)
})

// #region copy code

function useCopyCode() {
  const timeoutIdMap: WeakMap<HTMLElement, NodeJS.Timeout> = new WeakMap()
  window.addEventListener('click', (e) => {
    const el = e.target as HTMLElement
    if (el.matches('div[class*="language-"] > button.copy')) {
      const parent = el.parentElement
      const sibling = el.nextElementSibling?.nextElementSibling
      if (!parent || !sibling) {
        return
      }

      const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(parent.className)

      const ignoredNodes = ['.vp-copy-ignore', '.diff.remove']

      // Clone the node and remove the ignored nodes
      const clone = sibling.cloneNode(true) as HTMLElement
      clone.querySelectorAll(ignoredNodes.join(',')).forEach((node) => node.remove())

      let text = clone.textContent || ''

      if (isShell) {
        text = text.replace(/^ *(\$|>) /gm, '').trim()
      }

      copyToClipboard(text).then(() => {
        el.classList.add('copied')
        clearTimeout(timeoutIdMap.get(el))
        const timeoutId = setTimeout(() => {
          el.classList.remove('copied')
          el.blur()
          timeoutIdMap.delete(el)
        }, 2000)
        timeoutIdMap.set(el, timeoutId)
      })
    }
  })
}

async function copyToClipboard(text: string) {
  try {
    return navigator.clipboard.writeText(text)
  } catch {
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement

    element.value = text

    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '')

    element.style.contain = 'strict'
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.fontSize = '12pt' // Prevent zooming on iOS

    const selection = document.getSelection()
    const originalRange = selection ? selection.rangeCount > 0 && selection.getRangeAt(0) : null

    document.body.appendChild(element)
    element.select()

    // Explicit selection workaround for iOS
    element.selectionStart = 0
    element.selectionEnd = text.length

    document.execCommand('copy')
    document.body.removeChild(element)

    if (originalRange) {
      selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange)
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      ;(previouslyFocusedElement as HTMLElement).focus()
    }
  }
}

useCopyCode()

// #endregion
</script>

<style>
/* color for dark mode */
@media (prefers-color-scheme: dark) {
  .shiki,
  .shiki span {
    color: var(--shiki-dark) !important;
    background-color: transparent !important;
  }
}

/* dark and light toggle transition */
.shiki,
.shiki span {
  transition:
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* customise shiki */
.shiki {
  border: unset; /* preflight for web */
  margin-bottom: unset !important; /* preflight for web */
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 20px 0;
  background: transparent;
  overflow-x: auto;
}
.shiki > code {
  background-color: unset; /* preflight for web */
  font-size: unset; /* preflight for web */
  line-height: unset; /* preflight for web */
  text-wrap-mode: nowrap; /* preflight for web */
  box-sizing: border-box; /* preflight for web */
  display: block;
  padding: 0 24px;
  width: fit-content;
  min-width: 100%;
}
div[class*='language-'] {
  border-radius: 8px;
  margin: 16px 0;
  position: relative;
  background-color: var(--vp-code-block-bg);
  overflow-x: auto;
}

/* #region copy code */
/* following code comes from VitePress */
[class*='language-'] > button.copy {
  /*rtl:ignore*/
  direction: ltr;
  position: absolute;
  top: 12px;
  /*rtl:ignore*/
  right: 12px;
  z-index: 3;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  background-color: var(--vp-code-copy-code-bg);
  opacity: 0;
  cursor: pointer;
  background-image: var(--vp-icon-copy);
  background-position: 50%;
  background-size: 20px;
  background-repeat: no-repeat;
  transition:
    border-color 0.25s,
    background-color 0.25s,
    opacity 0.25s;
}

[class*='language-']:hover > button.copy,
[class*='language-'] > button.copy:focus {
  opacity: 1;
}

[class*='language-'] > button.copy:hover,
[class*='language-'] > button.copy.copied {
  border-color: var(--vp-code-copy-code-hover-border-color);
  background-color: var(--vp-code-copy-code-hover-bg);
}

[class*='language-'] > button.copy.copied,
[class*='language-'] > button.copy:hover.copied {
  /*rtl:ignore*/
  border-radius: 0 4px 4px 0;
  background-color: var(--vp-code-copy-code-hover-bg);
  background-image: var(--vp-icon-copied);
}

[class*='language-'] > button.copy.copied::before,
[class*='language-'] > button.copy:hover.copied::before {
  position: relative;
  top: -1px;
  /*rtl:ignore*/
  transform: translateX(calc(-100% - 1px));
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--vp-code-copy-code-hover-border-color);
  /*rtl:ignore*/
  border-right: 0;
  /*rtl:ignore*/
  border-radius: 4px 0 0 4px;
  padding: 0 10px;
  width: fit-content;
  height: 40px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-code-copy-code-active-text);
  background-color: var(--vp-code-copy-code-hover-bg);
  white-space: nowrap;
  content: var(--vp-code-copy-copied-text-content);
}

/* #endregion */

[class*='language-'] > span.lang {
  position: absolute;
  top: 2px;
  /*rtl:ignore*/
  right: 8px;
  z-index: 2;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  color: var(--vp-code-lang-color);
  transition:
    color 0.4s,
    opacity 0.4s;
}

[class*='language-']:hover > button.copy + span.lang,
[class*='language-'] > button.copy:focus + span.lang {
  opacity: 0;
}

:root {
  /* clipboard */
  --vp-icon-copy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3C/svg%3E");
  /* clipboard-copy */
  --vp-icon-copied: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3Cpath d='m9 14 2 2 4-4'/%3E%3C/svg%3E");
  --vp-code-lang-color: #67676c;
  /* TODO: i18m */
  --vp-code-copy-copied-text-content: 'Copied';
  --vp-code-copy-code-hover-bg: #ffffff;
  --vp-code-copy-code-active-text: #67676c;
  --vp-code-copy-code-hover-border-color: #e2e2e3;
  --vp-code-copy-code-border-color: #e2e2e3;
  --vp-code-copy-code-bg: #f6f6f7;
  --vp-code-block-bg: #f6f6f7;
}
@media (prefers-color-scheme: dark) {
  :root {
    --vp-code-lang-color: #98989f;
    --vp-code-copy-code-hover-bg: #1b1b1f;
    --vp-code-copy-code-active-text: #98989f;
    --vp-code-copy-code-hover-border-color: #2e2e32;
    --vp-code-copy-code-border-color: #2e2e32;
    --vp-code-copy-code-bg: #202127;
    --vp-code-block-bg: #161618;
  }
}
</style>
