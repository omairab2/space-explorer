import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { catchError, map, of, startWith } from 'rxjs';

import { Apod } from '../../../core/models/apod.model';
import { NasaApodService } from '../../../infrastructure/services/nasa-apod.service';
import { ApodCardComponent } from '../../components/apod-card/apod-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

const APOD_COUNT = 12;
const PAGE_TITLE = 'Space Explorer | NASA Astronomy';
const PAGE_DESCRIPTION = "Explore NASA's Astronomy Picture of the Day collection";
const LOAD_ERROR_MESSAGE =
  'We could not load the astronomy images right now. Please try again later.';

type HomeStatus = 'loading' | 'success' | 'error';

type HomeState =
  | { status: 'loading' }
  | { status: 'success'; items: Apod[] }
  | { status: 'error' };

@Component({
  selector: 'app-home',
  imports: [ApodCardComponent, SkeletonComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly nasaApodService = inject(NasaApodService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly errorMessage = LOAD_ERROR_MESSAGE;

  // toSignal subscribes during construction (within the injection context), so the
  // request fires server-side during SSR. Results arrive via TransferState on the client.
  private readonly state = toSignal(
    this.nasaApodService.getApodList(APOD_COUNT).pipe(
      map((items): HomeState => ({ status: 'success', items })),
      startWith<HomeState>({ status: 'loading' }),
      catchError(() => of<HomeState>({ status: 'error' })),
    ),
    { initialValue: { status: 'loading' } satisfies HomeState },
  );

  protected readonly status = computed<HomeStatus>(() => this.state().status);
  protected readonly items = computed<Apod[]>(() => {
    const current = this.state();
    return current.status === 'success' ? current.items : [];
  });

  constructor() {
    // Set server-side so crawlers receive correct title/description in the SSR HTML.
    this.title.setTitle(PAGE_TITLE);
    this.meta.updateTag({ name: 'description', content: PAGE_DESCRIPTION });
  }
}
