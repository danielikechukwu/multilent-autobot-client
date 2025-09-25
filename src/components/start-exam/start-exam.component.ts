import {
  Component,
  computed,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ResourceMonitorComponent } from '../resource-monitor/resource-monitor.component';
import { CandidateDetailsComponent } from '../candidate-details/candidate-details.component';
import { Router } from '@angular/router';
import { IconDefinition, faStopwatch, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-start-exam',
  imports: [ResourceMonitorComponent, CandidateDetailsComponent, FontAwesomeModule],
  templateUrl: './start-exam.component.html',
  styleUrl: './start-exam.component.scss',
})

export class StartExamComponent implements OnInit, OnDestroy {

  faStopwatch: IconDefinition = faStopwatch;
  faNoteSticky: IconDefinition = faNoteSticky;

  readonly totalTime: number = 30 * 60;
  readonly totalQuestions: number = 100;

  timeLeft = signal<number>(this.totalTime);

  progress = computed(
    () => ((this.totalTime - this.timeLeft()) / this.totalTime) * 100
  );

  currentQuestion = computed(() =>
    Math.min(
      Math.floor((this.totalTime - this.timeLeft()) / 18) + 1,
      this.totalQuestions
    )
  );

  isActive: boolean = true;

  private intervalId: any;

  constructor(private ngZone: NgZone, private router: Router) {}

  ngOnDestroy(): void {
    this.stopTimer();
  }

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer(): void {
    this.stopTimer();

    // Run outside Angular zone to prevent change detection issues
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        // Run back inside Angular zone when updating signals
        this.ngZone.run(() => {
          if (this.timeLeft() > 0) {
            this.timeLeft.update((v) => v - 1);
          } else {
            this.stopTimer();
            this.router.navigate(['/end-exam']);
          }
        });
      }, 1000);
    });
  }

  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');

    const s = (seconds % 60).toString().padStart(2, '0');

    return `${m}:${s}`;
  }
}
