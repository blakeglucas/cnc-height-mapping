import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import colorNames from 'colornames';
import { map, Observable, Subscription } from 'rxjs';
import { HeightMapService } from '../../services/height-map.service';

@Component({
  selector: 'app-current-height-map',
  templateUrl: './current-height-map.component.html',
  styleUrls: ['./current-height-map.component.scss'],
})
export class CurrentHeightMapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() width = -1;
  @Input() height = -1;

  data = {
    x: [],
    y: [],
    z: [],
    type: 'surface',
    colorscale: [
      [0, 'rgb(255, 0, 0)'],
      [0.5, 'rgb(0, 255, 0)'],
      [1, 'rgb(255, 0, 0)'],
    ],
    cmin: -0.5,
    cmax: 0.5,
    surfacecolor: [],
    colorbar: {
      tickcolor: 'white',
      tickfont: {
        color: 'white',
      },
    },
  };

  readonly config = {
    displayModeBar: false,
  };

  private readonly baseLayout = {};

  layout: Partial<Plotly.Layout> = {
    ...this.baseLayout,
    paper_bgcolor: colorNames('gray 22'),
    width: this.width,
    height: this.height,
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 0,
    },
    title: {
      font: {
        color: 'white',
      },
    },
    scene: {
      xaxis: {
        color: 'white',
      },
      yaxis: {
        color: 'white',
      },
      zaxis: {
        color: 'white',
      },
    },
  };

  currentHeightMapSubscription: Subscription;

  constructor(
    public heightMapService: HeightMapService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentHeightMapSubscription =
      this.heightMapService.currentHeightMap$.subscribe({
        next: (currentHeightMap) => {
          if (currentHeightMap) {
            this.data.x = Array.from(
              new Set(currentHeightMap.map((a) => a[0]).sort())
            );
            this.data.y = Array.from(
              new Set(currentHeightMap.map((a) => a[1]).sort())
            );
            const z_values = currentHeightMap.map((a) => a[2]);
            // this.data.cmin = Math.min(...z_values)
            // this.data.cmax = Math.max(...z_values)
            const z_mat = z_values.reduce(
              (rows, key, index) =>
                (index % 3 == 0
                  ? rows.push([key])
                  : rows[rows.length - 1].push(key)) && rows,
              []
            );
            this.data.z = z_mat;
            this.data.surfacecolor = z_mat.map((row) =>
              row.map((a) => Math.abs(a))
            );
            this.cdr.detectChanges();
          }
        },
      });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.layout = {
      ...this.layout,
      width: changes.width?.currentValue || this.width,
      height: changes.height?.currentValue || this.height,
    };
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.currentHeightMapSubscription) {
      this.currentHeightMapSubscription.unsubscribe();
    }
  }
}
