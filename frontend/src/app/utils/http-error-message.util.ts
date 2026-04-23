import { HttpErrorResponse } from '@angular/common/http';

/** Extrait un texte lisible depuis Spring Boot / ProblemDetail / corps string. */
export function messageFromHttpError(err: HttpErrorResponse): string {
  if (err.error == null) {
    return err.statusText || `HTTP ${err.status}`;
  }
  if (typeof err.error === 'string') {
    return err.error;
  }
  if (typeof err.error === 'object') {
    const o = err.error as Record<string, unknown>;
    const m = o['message'];
    if (typeof m === 'string' && m.length > 0) {
      return m;
    }
    const d = o['detail'];
    if (typeof d === 'string' && d.length > 0) {
      return d;
    }
    const e = o['error'];
    if (typeof e === 'string' && e.length > 0) {
      return e;
    }
    const title = o['title'];
    if (typeof title === 'string' && title.length > 0) {
      return title;
    }
  }
  return err.statusText || `HTTP ${err.status}`;
}
