async function encryptionKey(material: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptCredential(value: string, material: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(material), new TextEncoder().encode(value));
  return JSON.stringify({ iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) });
}

export async function decryptCredential(value: string, material: string) {
  const stored = JSON.parse(value) as { iv: number[]; data: number[] };
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(stored.iv) }, await encryptionKey(material), new Uint8Array(stored.data));
  return new TextDecoder().decode(plain);
}