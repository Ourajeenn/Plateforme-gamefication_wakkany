const KEY_STORAGE_PREFIX = 'wakkany_e2ee_key_';
const IV_LENGTH = 12;

function uint8ArrayToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function concatUint8Arrays(...arrays) {
  const length = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  arrays.forEach((arr) => {
    result.set(arr, offset);
    offset += arr.length;
  });
  return result;
}

async function generateCryptoKey() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function exportCryptoKey(key) {
  return new Uint8Array(await crypto.subtle.exportKey('raw', key));
}

async function importCryptoKey(rawBytes) {
  return crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function getOrCreateKeyForUser(userId) {
  if (!userId) {
    throw new Error('E2EE requires a valid user id');
  }
  const storageKey = `${KEY_STORAGE_PREFIX}${userId}`;
  const storedKey = localStorage.getItem(storageKey);
  if (storedKey) {
    return importCryptoKey(base64ToUint8Array(storedKey));
  }

  const key = await generateCryptoKey();
  const rawKey = await exportCryptoKey(key);
  localStorage.setItem(storageKey, uint8ArrayToBase64(rawKey));
  return key;
}

export async function encryptText(plainText, key) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plainText);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const merged = concatUint8Arrays(iv, new Uint8Array(cipher));
  return uint8ArrayToBase64(merged);
}

export async function decryptText(encryptedBase64, key) {
  try {
    const bytes = base64ToUint8Array(encryptedBase64);
    if (bytes.length <= IV_LENGTH) {
      throw new Error('Ciphertext too short');
    }
    const iv = bytes.slice(0, IV_LENGTH);
    const ciphertext = bytes.slice(IV_LENGTH);
    const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(plainBuffer);
  } catch (error) {
    console.warn('[E2EE] decrypt failed', error);
    return '[message non déchiffrable]';
  }
}
