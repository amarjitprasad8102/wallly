// End-to-end encryption utilities for chat messages using Web Crypto API

export class ChatEncryption {
  private keyPair: CryptoKeyPair | null = null;
  private remotePublicKey: CryptoKey | null = null;

  async generateKeyPair(): Promise<string> {
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const exportedKey = await window.crypto.subtle.exportKey(
      "spki",
      this.keyPair.publicKey
    );
    
    return this.arrayBufferToBase64(exportedKey);
  }

  async setRemotePublicKey(publicKeyBase64: string): Promise<void> {
    const keyData = this.base64ToArrayBuffer(publicKeyBase64);
    this.remotePublicKey = await window.crypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );
  }

  async encryptMessage(message: string): Promise<string> {
    if (!this.remotePublicKey) {
      throw new Error("Remote public key not set");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      this.remotePublicKey,
      data
    );

    return this.arrayBufferToBase64(encrypted);
  }

  async decryptMessage(encryptedMessageBase64: string): Promise<string> {
    if (!this.keyPair?.privateKey) {
      throw new Error("Private key not available");
    }

    const encryptedData = this.base64ToArrayBuffer(encryptedMessageBase64);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.keyPair.privateKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  isReady(): boolean {
    return this.keyPair !== null && this.remotePublicKey !== null;
  }
}
