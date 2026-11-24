const STORAGE_KEY = 'kumbatio_energy_state'
const ORIGIN_KEY = 'kumbatio_energy_origin'

const BADGE_COLORS = {
  100: '#3b82f6',
  75: '#14b8a6',
  50: '#64748b',
  25: '#78716c',
  0: '#52525b',
}

async function getOriginId() {
  const result = await chrome.storage.local.get(ORIGIN_KEY)
  if (typeof result[ORIGIN_KEY] === 'string' && result[ORIGIN_KEY].length > 0) {
    return result[ORIGIN_KEY]
  }
  const id = `ext-${crypto.randomUUID()}`
  await chrome.storage.local.set({ [ORIGIN_KEY]: id })
  return id
}

function updateBadge(level) {
  chrome.action.setBadgeText({ text: String(level) })
  chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS[level] ?? '#64748b' })
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(STORAGE_KEY)
  if (!existing[STORAGE_KEY]) {
    const initial = {
      level: 100,
      timestamp: 0,
      source: 'manual',
      revision: 0,
      origin: '0-initial',
    }
    await chrome.storage.local.set({ [STORAGE_KEY]: initial })
    updateBadge(100)
  } else {
    updateBadge(existing[STORAGE_KEY].level)
  }
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]?.newValue) return
  updateBadge(changes[STORAGE_KEY].newValue.level)
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'SET_LEVEL') {
    void (async () => {
      const origin = await getOriginId()
      const current = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY]
      const now = Date.now()
      const timestamp = current ? Math.max(now, current.timestamp) : now
      const revision = current && timestamp === current.timestamp ? current.revision + 1 : 0
      const next = {
        level: message.level,
        timestamp,
        source: 'manual',
        revision,
        origin,
      }
      await chrome.storage.local.set({ [STORAGE_KEY]: next })
      sendResponse({ ok: true, state: next })
    })()
    return true
  }
  return false
})
