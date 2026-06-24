import { ChangeDetectionStrategy, Component } from '@angular/core';

const SKELETON_CARD_COUNT = 12;

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  protected readonly cards = Array.from({ length: SKELETON_CARD_COUNT });
}
