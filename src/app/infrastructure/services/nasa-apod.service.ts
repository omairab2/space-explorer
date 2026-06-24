import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, StateKey, TransferState, inject, makeStateKey } from '@angular/core';
import { Observable, of } from 'rxjs';
import { retry, tap, timeout } from 'rxjs/operators';

import { Apod } from '../../core/models/apod.model';
import { environment } from '../../../environments/environment';

// The API key lives only on the server. The server calls NASA directly with the key;
// the browser calls our same-origin proxy (/api/apod in server.ts), which injects it.
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';
const APOD_PROXY_URL = '/api/apod';
const APOD_LIST_STATE_PREFIX = 'apod-list';
const APOD_DATE_STATE_PREFIX = 'apod-date';
// NASA's APOD endpoint is intermittently slow/503. Each request is bounded by a timeout.
// On the SERVER we make a single bounded attempt (no retry) so the worst case is just the
// timeout — comfortably under Angular's ~9s SSR stabilization budget (count=12 can take
// ~3.4s, so 5s leaves margin without false-tripping). If NASA fails during SSR the error
// state is rendered; the client then re-fetches through the proxy and recovers, retrying
// (no SSR budget there) for resilience.
const HTTP_TIMEOUT_MS = 5000;
const HTTP_RETRY_DELAY_MS = 500;
const SERVER_RETRY_COUNT = 0;
const CLIENT_RETRY_COUNT = 2;

@Injectable({ providedIn: 'root' })
export class NasaApodService {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Fetches `count` random APOD entries.
   * `thumbs=true` makes NASA populate `thumbnail_url` for video entries, so the UI
   * can fall back to it when `media_type === 'video'`.
   */
  getApodList(count: number): Observable<Apod[]> {
    const stateKey = makeStateKey<Apod[]>(`${APOD_LIST_STATE_PREFIX}-${count}`);
    return this.withTransferState(stateKey, this.buildUrl({ count: String(count) }));
  }

  /** Fetches the single APOD entry for a specific `date` (format: YYYY-MM-DD). */
  getApodByDate(date: string): Observable<Apod> {
    const stateKey = makeStateKey<Apod>(`${APOD_DATE_STATE_PREFIX}-${date}`);
    return this.withTransferState(stateKey, this.buildUrl({ date }));
  }

  /**
   * Builds the request URL. On the server we hit NASA directly with the secret key;
   * in the browser we hit the same-origin proxy, which injects the key server-side.
   */
  private buildUrl(query: Record<string, string>): string {
    const params = new URLSearchParams({ ...query, thumbs: 'true' });

    if (isPlatformServer(this.platformId)) {
      params.set('api_key', environment.nasaApiKey);
      return `${NASA_APOD_URL}?${params.toString()}`;
    }

    return `${APOD_PROXY_URL}?${params.toString()}`;
  }

  /**
   * On the server: fetch over HTTP and stash the result in TransferState.
   * On the client: reuse the serialized value (no second network call) and drop the key.
   * `hasKey` guarantees the cached value is present, so the `null` default is never used.
   */
  private withTransferState<T>(stateKey: StateKey<T>, url: string): Observable<T> {
    if (this.transferState.hasKey(stateKey)) {
      const cached = this.transferState.get(stateKey, null as T);
      this.transferState.remove(stateKey);
      return of(cached);
    }

    const isServer = isPlatformServer(this.platformId);

    return this.http.get<T>(url).pipe(
      timeout({ each: HTTP_TIMEOUT_MS }),
      retry({ count: isServer ? SERVER_RETRY_COUNT : CLIENT_RETRY_COUNT, delay: HTTP_RETRY_DELAY_MS }),
      tap((data) => {
        if (isServer) {
          this.transferState.set(stateKey, data);
        }
      }),
    );
  }
}
