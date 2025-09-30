import {
  Component,
  computed,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ResourceMonitorComponent } from '../resource-monitor/resource-monitor.component';
import { CandidateDetailsComponent } from '../candidate-details/candidate-details.component';
import { Router } from '@angular/router';
import {
  IconDefinition,
  faStopwatch,
  faNoteSticky,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AutobotService } from '../../services/autobot.service';
import { catchError, of, Subscription } from 'rxjs';
import { IResourceMonitor } from '../../interface/IResourceManagement';
import { ICreateResourceManagement } from '../../interface/ICreateResourceManagement';
import { IResourceManagementResponse } from '../../interface/IResourceManagementResponse';
import { StatusReport } from '../../enums/StatusReport';

@Component({
  selector: 'app-start-exam',
  imports: [
    ResourceMonitorComponent,
    CandidateDetailsComponent,
    FontAwesomeModule,
  ],
  templateUrl: './start-exam.component.html',
  styleUrl: './start-exam.component.scss',
})
export class StartExamComponent implements OnInit, OnDestroy {
  faStopwatch: IconDefinition = faStopwatch;
  faNoteSticky: IconDefinition = faNoteSticky;

  private autobotService = inject(AutobotService);

  resourceManagementa = signal<IResourceMonitor | null>(null);

  resourceManagement = computed(() => this.autobotService.resourceManagement());

  dnsQuery = computed(() => this.autobotService.dnsQuery());

  startExamResponse = computed(() => this.autobotService.startExamResponse());

  pollResourceManagementSubscription!: Subscription;
  resourceManagementResponse!: Subscription;

  //readonly totalTime: number = 30 * 60;
  readonly totalTime = signal<number>(
    Math.floor(
      this.startExamResponse()!.data?.time_started?.getTime()! / 1000
    ) +
      30 * 60
  );

  readonly totalQuestions: number = 100;

  timeLeft = signal<number>(this.totalTime());

  progress = computed(
    () => ((this.totalTime() - this.timeLeft()) / this.totalTime()) * 100
  );

  currentQuestion = computed(() =>
    Math.min(
      Math.floor(
        (this.totalTime() - this.timeLeft()) /
          (this.totalTime() / this.totalQuestions)
      ) + 1,
      this.totalQuestions
    )
  );

  isActive = signal<boolean>(true);

  private intervalId: any;

  constructor(private ngZone: NgZone, private router: Router) {}

  ngOnDestroy(): void {
    this.stopTimer();

    if (this.pollResourceManagementSubscription) {
      this.pollResourceManagementSubscription.unsubscribe;
    }

    if (this.resourceManagementResponse) {
      this.resourceManagementResponse.unsubscribe;
    }
  }

  ngOnInit(): void {
    this.startTimer();

    // Polling resource management
    this.pollResourceManagementSubscription = this.autobotService
      .pollResourceManagementInformation()
      .subscribe({
        next: (data: IResourceMonitor | null) => {
          if (data) {

            this.postResourceManagement(); // Calling resource management posting.
          }
        },
        error: (err) => {
          this.isActive.set(false);
          console.error('Polling stopped:', err);
        },
      });
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

            this.endCandidateExam(); // End exam
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

  endCandidateExam(): void {
    this.autobotService
      .endCandidateExam$(
        this.startExamResponse()?.data?.candidate_id!,
        this.dnsQuery()
      )
      .pipe(
        catchError((error) => {
          console.error('Error occurred ending exam', error);

          this.router.navigate(['/end-exam']);

          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.router.navigate(['/end-exam']);
        }
      });
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');

    const s = (seconds % 60).toString().padStart(2, '0');

    return `${m}:${s}`;
  }

  private postResourceManagement(): void {
    
    const responseManagement: ICreateResourceManagement = {
      ip_addr: this.resourceManagement()?.ip_addr!,
      cpu_usage: this.resourceManagement()?.cpu_usage!,
      ram_usage: this.resourceManagement()?.ram_usage!,
      exam_id: this.resourceManagement()?.exam_id!,
      network_speed: this.resourceManagement()?.network_speed!,
      disk_utility: this.resourceManagement()?.disk_utility!,
      network_utilization: this.resourceManagement()?.network_utilization!,
      candidate_id: this.startExamResponse()?.data?.candidate_id!,
    };

    this.resourceManagementResponse = this.autobotService
      .postResourceManagement$(this.dnsQuery()!, responseManagement)
      .pipe(
        catchError((err) => {
          console.error('No available resource response', err);

          this.isActive.set(false);

          return of();
        })
      )
      .subscribe((response: IResourceManagementResponse | null) => {
        if (response) {
          if (response.exam_status === StatusReport.Ended) {
            this.router.navigate(['/end-exam']);
          } else {
            this.autobotService.resourceManagementResponse.set(response);
          }
        } else {
          this.isActive.set(false);
        }
      });
  }
}
