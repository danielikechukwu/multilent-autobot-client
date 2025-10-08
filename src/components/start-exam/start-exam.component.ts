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
import { catchError, map, of, scan, Subscription, takeWhile } from 'rxjs';
import {
  IResourceMonitor,
  IResourceMonitorState,
} from '../../interface/IResourceManagement';
import { ICreateResourceManagement } from '../../interface/ICreateResourceManagement';
import {
  IResourceManagementResponse,
  IResourceManagementResponseState,
} from '../../interface/IResourceManagementResponse';
import { StatusReport } from '../../enums/StatusReport';
import { InactiveComponent } from '../modal/inactive.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

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

  resourceManagement = computed(() => this.autobotService.resourceManagement());

  dnsQuery = computed(() => this.autobotService.dnsQuery());

  startExamResponse = computed(() => this.autobotService.startExamResponse());

  pollResourceManagementSubscription!: Subscription;
  resourceManagementResponse!: Subscription;

  //readonly totalTime = signal<number>(3 * 60); // 30 minutes in seconds

  readonly totalTime = signal<number>(
    Math.floor(
      new Date(this.startExamResponse()!.data?.time_started!).getSeconds() /
        1000
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

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private matDialog: MatDialog
  ) {}

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
        next: (data: IResourceMonitorState) => {
          if (data.errors === 4) {
            //  Open modal when error count = 4
            this.isActive.set(false);

            this.stopTimer();

            this.matDialog.open(InactiveComponent, {
              disableClose: true,
            });
          }

          if (data.value) {
            console.log('Polling Resource Management');

            this.postResourceManagement(); // Calling resource management posting.
          }
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
      unique_id: this.resourceManagement()?.unique_id!,
      ip_addr: this.resourceManagement()?.ip_addr!,
      cpu_usage: this.resourceManagement()?.cpu_usage!,
      ram_usage: this.resourceManagement()?.ram_usage!,
      exam_id: this.startExamResponse()?.data?.exam_id!,
      network_speed: this.resourceManagement()?.network_speed!,
      disk_utility: this.resourceManagement()?.disk_utility!,
      network_utilization: this.resourceManagement()?.network_utilization!,
      candidate_id: this.startExamResponse()?.data?.candidate_id!,
    };

    console.log('Posting Resource Management: ', responseManagement);

    this.resourceManagementResponse = this.autobotService
      .postResourceManagement$(this.dnsQuery()!, responseManagement)
      .pipe(
        catchError((error: any) => {
          if (error instanceof HttpErrorResponse) {
            console.log('ERROR FROM SERVER')
            return of(null);
          } else if (error instanceof ProgressEvent) {
            console.log('CORS ERROR')
            return of(null);
          } else {
            return of(null);
          }
        }),
        scan(
          (acc, result) => {
            if (result === null) {
              // increase consecutive error count
              return { errors: acc.errors + 1, value: null };
            } else {
              // reset error count on success
              return { errors: 0, value: result };
            }
          },
          { errors: 0, value: null as IResourceManagementResponse | null }
        ),
        takeWhile((state) => state.errors < 4, true) // stop after 4 errors
      )
      .subscribe({
        next: (response: IResourceManagementResponseState) => {
          if (response.errors === 4) {
            //  Open modal when error count = 4
            this.isActive.set(false);

            this.stopTimer();

            this.matDialog.open(InactiveComponent, {
              disableClose: true,
            });
          }

          if (response.value) {
            console.log('Exam status: ', response.value.exam_status);

            console.log('Resource Response: ', response);

            if (response.value.exam_status === StatusReport.Ended) {
              this.router.navigate(['/end-exam']);
            } else {
              console.log('Resource Management response: ', response.value);

              this.autobotService.resourceManagementResponse.set(
                response.value
              );
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err.message);
        },
      });
  }
}
