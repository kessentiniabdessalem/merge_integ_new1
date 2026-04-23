export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach(b => (str += String.fromCharCode(b)));
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 =
    base64url.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice((base64url.length + 3) % 4);

  const str = atob(base64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes.buffer;
}

function removeBadExtensions(publicKey: any) {
  if (publicKey?.extensions) {
    delete publicKey.extensions.appidExclude;
    delete publicKey.extensions.appid;
    if (Object.keys(publicKey.extensions).length === 0) delete publicKey.extensions;
  }
}

export function decodeCreateOptions(publicKey: any): any {
  if (!publicKey) return publicKey;

  removeBadExtensions(publicKey);

  publicKey.challenge = base64urlToBuffer(publicKey.challenge);

  if (publicKey.user?.id) {
    publicKey.user.id = base64urlToBuffer(publicKey.user.id);
  }

  if (publicKey.excludeCredentials && !Array.isArray(publicKey.excludeCredentials)) {
    publicKey.excludeCredentials = [publicKey.excludeCredentials];
  }

  if (Array.isArray(publicKey.excludeCredentials)) {
    publicKey.excludeCredentials = publicKey.excludeCredentials.map((c: any) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    }));
  }

  return publicKey;
}

export function decodeGetOptions(publicKey: any): any {
  if (!publicKey) return publicKey;

  removeBadExtensions(publicKey);

  publicKey.challenge = base64urlToBuffer(publicKey.challenge);

  if (publicKey.allowCredentials && !Array.isArray(publicKey.allowCredentials)) {
    publicKey.allowCredentials = [publicKey.allowCredentials];
  }

  if (Array.isArray(publicKey.allowCredentials)) {
    if (publicKey.allowCredentials.length === 0) {
      delete publicKey.allowCredentials;
    } else {
      publicKey.allowCredentials = publicKey.allowCredentials.map((c: any) => ({
        ...c,
        id: base64urlToBuffer(c.id),
      }));
    }
  }

  return publicKey;
}

export function encodeCredential(cred: any): any {
  const response: any = cred.response;

  return {
    id: cred.id,
    rawId: bufferToBase64url(cred.rawId),
    type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
    response: {
      attestationObject: response.attestationObject
        ? bufferToBase64url(response.attestationObject)
        : undefined,
      authenticatorData: response.authenticatorData
        ? bufferToBase64url(response.authenticatorData)
        : undefined,
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      signature: response.signature ? bufferToBase64url(response.signature) : undefined,
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : undefined,
    },
  };
}

export function isWebAuthnSupported(): boolean {
  return !!(window.PublicKeyCredential && navigator.credentials);
}
