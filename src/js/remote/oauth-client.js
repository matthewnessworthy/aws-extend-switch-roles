import { createCodeChallenge, createCodeVerifier, createState } from './code-util.js';

export class OAuthClient {
  constructor(subdomain, clientId) {
    this.domain = subdomain + '.aesr.dev';
    this.clientId = clientId;
  }

  async startAuthFlow() {
    const codeVerifier = createCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = createState();

    const authorizeUrl = `https://auth.${this.domain}/oauth2/authorize`
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: `https://api.${this.domain}/callback`,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state
    })

    return {
      authorizeUrl: authorizeUrl + '?' + params.toString(),
      codeVerifier,
      state,
    };
  }

  validateCallbackUrl(uRL, expectedState) {
    if (uRL.host !== `api.${this.domain}` || uRL.pathname !== '/callback') {
      throw new Error('Invalid callback URL');
    }
    const error = uRL.searchParams.get('error');
    if (error) {
      let errmsg = error;
      const errDesc = uRL.searchParams.get('error_description');
      if (errDesc) errmsg += ': ' + errDesc;
      throw new Error(errmsg);
    }
    if (expectedState && uRL.searchParams.get('state') !== expectedState) {
      throw new Error('State mismatch');
    }
    const authCode = uRL.searchParams.get('code');
    if (!authCode) throw new Error('Authorization code missing from callback');
    return authCode;
  }

  async verify(codeVerifier, authCode) {
    const params = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      redirect_uri: `https://api.${this.domain}/callback`,
      code: authCode,
      code_verifier: codeVerifier
    };

    const res = await fetch(`https://auth.${this.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });
    if (!res.ok) {
      const code = await parseErrorCode(res);
      throw new Error(code || `token endpoint returned ${res.status}`);
    }
    return await res.json();
  }

  async getIdTokenByRefresh(refreshToken) {
    const params = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      refresh_token: refreshToken,
    };

    const res = await fetch(`https://auth.${this.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });
    if (!res.ok) {
      const code = await parseErrorCode(res);
      if (res.status === 400 || res.status === 401 || code === 'invalid_grant') {
        throw new RefreshTokenError(code || 'refresh token is invalid');
      }
      throw new Error(code || `token endpoint returned ${res.status}`);
    }
    const result = await res.json();
    return result.id_token;
  }

  async getUserConfig(idToken) {
    const res = await fetch(`https://api.${this.domain}/user/config`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + idToken,
      },
    })
    if (!res.ok) {
      const code = await parseErrorCode(res);
      throw new Error(code || `user config endpoint returned ${res.status}`);
    }
    return await res.json();
  }
}

export class RefreshTokenError extends Error {}

// Defensively read an error code from a non-OK response. A 5xx/gateway error
// often returns text/html or an empty body, so res.json() can throw; treat
// that as "no code" rather than letting a SyntaxError mask the real failure.
async function parseErrorCode(res) {
  try {
    const data = await res.json();
    return data.error || data.message || null;
  } catch {
    return null;
  }
}
