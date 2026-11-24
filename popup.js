const STORAGE_KEY = 'kumbatio_energy_state'
const SITE_PREFS_KEY = 'kumbatio_site_prefs'

const LEVELS = [
  { value: 100, label: 'Peak', desc: 'Full capacity for planning and deep work.' },
  { value: 75, label: 'Active', desc: 'Good capacity for focused execution.' },
  { value: 50, label: 'Steady', desc: 'Moderate capacity for familiar, routine work.' },
  { value: 25, label: 'Low', desc: 'Limited capacity for light review and simple steps.' },
  { value: 0, label: 'Rest', desc: 'Recovery mode — quiet reading, no work expected.' },
]

const dial = document.getElementById('dial')
const siteControls = document.getElementById('site-controls')
const siteHost = document.getElementById('site-host')
const toggleShare = document.getElementById('toggle-share')
const toggleCalm = document.getElementById('toggle-calm')

function renderDial(activeLevel) {
  for (const level of LEVELS) {
    const label = document.createElement('label')
    label.className = 'option'

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'energy-level'
    input.value = String(level.value)
    input.checked = level.value === activeLevel
    input.addEventListener('change', () => {
      if (!input.checked) return
      chrome.runtime.sendMessage({ type: 'SET_LEVEL', level: level.value })
    })

    const copy = document.createElement('span')
    const title = document.createElement('span')
    title.className = 'option-title'
    title.textContent = `${level.value}% · ${level.label}`

    const desc = document.createElement('span')
    desc.className = 'option-desc'
    desc.textContent = level.desc

    copy.append(title, desc)
    label.append(input, copy)
    dial.appendChild(label)
  }
}

async function init() {
  const data = await chrome.storage.local.get([STORAGE_KEY, SITE_PREFS_KEY])
  const activeLevel = data[STORAGE_KEY]?.level ?? 100
  renderDial(activeLevel)

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url || !/^https?:/.test(tab.url)) return

  const origin = new URL(tab.url).origin
  const allPrefs = data[SITE_PREFS_KEY] ?? {}
  const prefs = allPrefs[origin] ?? { share: false, calm: false }

  siteControls.hidden = false
  siteHost.textContent = origin
  toggleShare.checked = Boolean(prefs.share)
  toggleCalm.checked = Boolean(prefs.calm)

  const savePrefs = async () => {
    const latest = (await chrome.storage.local.get(SITE_PREFS_KEY))[SITE_PREFS_KEY] ?? {}
    latest[origin] = { share: toggleShare.checked, calm: toggleCalm.checked }
    await chrome.storage.local.set({ [SITE_PREFS_KEY]: latest })
  }

  toggleShare.addEventListener('change', savePrefs)
  toggleCalm.addEventListener('change', savePrefs)
}

void init()
