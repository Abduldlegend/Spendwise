export async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
  const bytes = new Uint8Array(bits)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

export async function verifyPassword(password, salt, hash) {
  const h = await hashPassword(password, salt)
  return h === hash
}

export function randomSalt() {
  const buf = new Uint8Array(16)
  crypto.getRandomValues(buf)
  return buf
}

export function saltToB64(salt) {
  let bin = ''
  for (let i = 0; i < salt.length; i++) bin += String.fromCharCode(salt[i])
  return btoa(bin)
}

export function b64ToSalt(b64) {
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf
}
