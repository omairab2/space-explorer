import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Apod } from '../../../core/models/apod.model';

const VIDEO_MEDIA_TYPE = 'video';

@Component({
  selector: 'app-apod-card',
  imports: [RouterLink, DatePipe],
  templateUrl: './apod-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApodCardComponent {
  readonly apod = input.required<Apod>();

  protected readonly isVideo = computed(() => this.apod().media_type === VIDEO_MEDIA_TYPE);

  // For videos NASA returns no displayable image in `url`; fall back to the thumbnail
  // (available because the service requests thumbs=true).
  protected readonly imageUrl = computed(() => {
    const apod = this.apod();
    return apod.media_type === VIDEO_MEDIA_TYPE ? (apod.thumbnail_url ?? apod.url) : apod.url;
  });
}
