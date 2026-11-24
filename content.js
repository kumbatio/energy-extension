const STORAGE_KEY = 'kumbatio_energy_state'
const SITE_PREFS_KEY = 'kumbatio_site_prefs'
const origin = window.location.origin

let currentState = null
let sitePrefs = { share: false, calm: false }
const listeners = new Set()

function applyToPage() {
  const root = document.documentElement
  if (!root) return

  if (sitePrefs.share && currentState) {
    root.dataset.energyLevel = String(currentState.level)
    window.dispatchEvent(new CustomEvent('kumbatio:energy-change', { detail: currentState }))
    for (const listener of listeners) {
      try {
        listener(currentState)
      } catch {
        // Contain consumer listener errors.
      }
    }
  }

  if (sitePrefs.calm && currentState) {
    root.dataset.kumbatioCalm = String(currentState.level)
  } else {
    delete root.dataset.kumbatioCalm
  }
}

// Expose the opt-in bridge read by `browserExtensionPersistence()` in `@kumbatio/energy-system/persistence`.
Object.defineProperty(window, '__KUMBATIO_ENERGY__', {
  configurable: true,
  value: Object.freeze({
    getState() {
      return sitePrefs.share ? currentState : null
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }),
})

chrome.storage.local.get([STORAGE_KEY, SITE_PREFS_KEY], (data) => {
  currentState = data[STORAGE_KEY] ?? null
  const allPrefs = data[SITE_PREFS_KEY] ?? {}
  sitePrefs = allPrefs[origin] ?? { share: false, calm: false }
  applyToPage()
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return
  if (changes[STORAGE_KEY]) {
    currentState = changes[STORAGE_KEY].newValue ?? null
  }
  if (changes[SITE_PREFS_KEY]) {
    const allPrefs = changes[SITE_PREFS_KEY].newValue ?? {}
    sitePrefs = allPrefs[origin] ?? { share: false, calm: false }
  }
  applyToPage()
})
