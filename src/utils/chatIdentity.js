// Lightweight, login-free identity for the ephemeral chat.
// A stable client id (to recognise your own messages) + an editable nickname,
// both persisted in localStorage.
const CID_KEY = 'wm_chat_cid'
const NAME_KEY = 'wm_chat_name'

export function getClientId() {
  try {
    let cid = localStorage.getItem(CID_KEY)
    if (!cid) {
      cid = `c-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
      localStorage.setItem(CID_KEY, cid)
    }
    return cid
  } catch (_) {
    return `c-${Math.random().toString(36).slice(2, 10)}`
  }
}

export function getName() {
  try {
    let name = localStorage.getItem(NAME_KEY)
    if (!name) {
      name = `Fan-${Math.floor(1000 + Math.random() * 9000)}`
      localStorage.setItem(NAME_KEY, name)
    }
    return name
  } catch (_) {
    return `Fan-${Math.floor(1000 + Math.random() * 9000)}`
  }
}

export function setName(name) {
  try { localStorage.setItem(NAME_KEY, name.slice(0, 24)) } catch (_) {}
}
