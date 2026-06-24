import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-detail-skeleton',
  templateUrl: './detail-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailSkeletonComponent {}
