import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  decodeCreateOptions,
  decodeGetOptions,
  encodeCredential,
  isWebAuthnSupported
} from './webauthn-utils';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebAuthnService {

  private readonly API = `${environment.apiGatewayUrl}/api/webauthn`;

  constructor(private http: HttpClient) {}

  private stripU2fExtensions(pk: any) {
    if (!pk) return;

    if (pk.extensions) {
      if (pk.extensions.appidExclude) delete pk.extensions.appidExclude;
      if (pk.extensions.appid) delete pk.extensions.appid;
      if (Object.keys(pk.extensions).length === 0) delete pk.extensions;
    }

    if (pk.publicKey?.extensions) {
      if (pk.publicKey.extensions.appidExclude) delete pk.publicKey.extensions.appidExclude;
      if (pk.publicKey.extensions.appid) delete pk.publicKey.extensions.appid;
      if (Object.keys(pk.publicKey.extensions).length === 0) delete pk.publicKey.extensions;
    }
  }

  async startRegister(): Promise<{ requestId: string; publicKey: any }> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return await firstValueFrom(
      this.http.post<any>(`${this.API}/register/options`, {}, { headers })
    );
  }

  async finishRegister(requestId: string, credential: any): Promise<string> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return await firstValueFrom(
      this.http.post(
        `${this.API}/register/verify`,
        { requestId, credential },
        { headers, responseType: 'text' }
      )
    );
  }

  async enablePasskeyFromProfile(): Promise<void> {
    if (!isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported by this browser.');
    }

    const opt = await this.startRegister();
    const pkRaw = opt.publicKey?.publicKey ?? opt.publicKey;
    const publicKey = decodeCreateOptions(pkRaw);

    this.stripU2fExtensions(publicKey);

    const cred = (await navigator.credentials.create({ publicKey })) as any;
    if (!cred) throw new Error('Passkey registration cancelled.');

    const credentialJson = encodeCredential(cred);
    await this.finishRegister(opt.requestId, credentialJson);
  }

  async startLogin(email: string): Promise<{ requestId: string; publicKey: any }> {
    return await firstValueFrom(
      this.http.post<any>(`${this.API}/authenticate/options`, { email })
    );
  }

  async startLoginDiscover(): Promise<{ requestId: string; publicKey: any }> {
    return await firstValueFrom(
      this.http.post<any>(`${this.API}/authenticate/options/discover`, {})
    );
  }

  async finishLogin(requestId: string, credential: any): Promise<{ token: string }> {
    return await firstValueFrom(
      this.http.post<any>(`${this.API}/authenticate/verify`, { requestId, credential })
    );
  }

  async loginWithPasskey(email?: string): Promise<string> {
    if (!isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported by this browser.');
    }

    const hasEmail = !!email && !!email.trim();

    const opt = hasEmail
      ? await this.startLogin(email!.trim())
      : await this.startLoginDiscover();

    const pkRaw = opt.publicKey?.publicKey ?? opt.publicKey;
    const publicKey = decodeGetOptions(pkRaw);

    this.stripU2fExtensions(publicKey);

    const cred = (await navigator.credentials.get({ publicKey })) as any;
    if (!cred) throw new Error('Passkey sign-in cancelled.');

    const credentialJson = encodeCredential(cred);
    const res = await this.finishLogin(opt.requestId, credentialJson);

    if (!res?.token) throw new Error('Token missing in response.');
    return res.token;
  }
}
