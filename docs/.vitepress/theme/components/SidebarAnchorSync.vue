<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
let scrollFrame = 0

function normalizePath(pathname: string) {
  return pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
}

function normalizeHash(hash: string) {
  try {
    return decodeURIComponent(hash)
  }
  catch {
    return hash
  }
}

function sidebarLinksForCurrentPage() {
  const currentPath = normalizePath(window.location.pathname)

  return [...document.querySelectorAll<HTMLAnchorElement>('.VPSidebar a[href]')]
    .map(link => ({ link, url: new URL(link.href, window.location.href) }))
    .filter(({ url }) => normalizePath(url.pathname) === currentPath)
}

function syncSidebarHighlight(hash = window.location.hash) {
  document.querySelectorAll<HTMLElement>('.VPSidebarItem.is-hash-active, .VPSidebarItem.is-hash-suppressed')
    .forEach(item => item.classList.remove('is-hash-active', 'is-hash-suppressed'))

  document.querySelectorAll<HTMLAnchorElement>('.VPSidebar a[data-hash-sync-current]')
    .forEach((link) => {
      link.removeAttribute('data-hash-sync-current')
      link.removeAttribute('aria-current')
    })

  const links = sidebarLinksForCurrentPage()
  if (!links.length)
    return

  const normalizedHash = normalizeHash(hash)
  const active = normalizedHash
    ? links.find(({ url }) => normalizeHash(url.hash) === normalizedHash)
    : links.find(({ url }) => !url.hash)

  if (!active)
    return

  for (const { link } of links) {
    const item = link.closest<HTMLElement>('.VPSidebarItem')
    if (!item)
      continue

    if (link === active.link) {
      item.classList.add('is-hash-active')
      link.dataset.hashSyncCurrent = 'true'
      link.setAttribute('aria-current', 'location')
    }
    else if (item.classList.contains('is-active')) {
      item.classList.add('is-hash-suppressed')
    }
  }
}

function hashAtScrollPosition() {
  const linkHashes = new Set(
    sidebarLinksForCurrentPage()
      .map(({ url }) => normalizeHash(url.hash).slice(1))
      .filter(Boolean),
  )
  const headings = [...document.querySelectorAll<HTMLElement>('main h2[id], main h3[id]')]
    .filter(heading => linkHashes.has(heading.id))

  const isAtPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
  if (isAtPageEnd && headings.length)
    return `#${headings.at(-1)!.id}`

  let activeHash = ''
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > 140)
      break
    activeHash = `#${heading.id}`
  }

  return activeHash
}

function handleScroll() {
  cancelAnimationFrame(scrollFrame)
  scrollFrame = requestAnimationFrame(() => syncSidebarHighlight(hashAtScrollPosition()))
}

function handleSidebarClick(event: MouseEvent) {
  const target = event.target as Element | null
  const link = target?.closest<HTMLAnchorElement>('.VPSidebar a[href]')
  if (!link)
    return

  const url = new URL(link.href, window.location.href)
  if (normalizePath(url.pathname) !== normalizePath(window.location.pathname))
    return

  queueMicrotask(() => syncSidebarHighlight(url.hash))
}

async function handleRouteChange() {
  await nextTick()
  syncSidebarHighlight(window.location.hash)
}

watch(() => route.path, handleRouteChange)

onMounted(() => {
  syncSidebarHighlight()
  document.addEventListener('click', handleSidebarClick, true)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('hashchange', handleRouteChange)
  window.addEventListener('popstate', handleRouteChange)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(scrollFrame)
  document.removeEventListener('click', handleSidebarClick, true)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('hashchange', handleRouteChange)
  window.removeEventListener('popstate', handleRouteChange)
})
</script>

<template>
  <span hidden aria-hidden="true" />
</template>
