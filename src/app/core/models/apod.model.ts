/**
 * NASA Astronomy Picture of the Day (APOD) API response.
 * @see https://api.nasa.gov
 *
 * Field names use snake_case to match the raw API payload.
 */
export type ApodMediaType = 'image' | 'video';

export interface Apod {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: ApodMediaType;
  service_version: string;
  /** Present when media_type === 'video' and the request used thumbs=true. */
  thumbnail_url?: string;
  title: string;
  url: string;
}
