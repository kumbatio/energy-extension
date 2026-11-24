# Kumbatio Energy Browser Extension

Set your cognitive energy level once in your browser toolbar instead of repeating yourself across every tab and web app.

- **Opt-in per site:** Sites only see your energy level if you turn on *Share energy level with this site*.
- **Native SDK bridge:** Any app using `browserExtensionPersistence()` from `@kumbatio/energy-system/persistence` (including [kumbat.io](https://kumbat.io)) syncs live.
- **Gentle Web Calm:** Optional softening for noisy legacy websites at Low (`25`) and Rest (`0`) — pauses distracting animations and dims sidebars while keeping everything reachable on hover or keyboard focus.
- **Zero telemetry:** Uses only local browser storage (`chrome.storage.local`). Never sends your state to a server.

## Load locally (Chrome / Brave / Edge)

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked** and select this `energy-extension/` folder

## Links

- Specification & TypeScript SDK: https://github.com/kumbatio/energy-system
- Documentation: https://docs.kumbat.io/docs/energy-system/guides/cross-app-and-ai
- Interactive demo: https://kumbat.io
