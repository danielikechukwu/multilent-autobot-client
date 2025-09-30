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
import { IStartExamResponse } from '../../interface/IStartExamResponse';
import { AutobotService } from '../../services/autobot.service';
import { Subscription } from 'rxjs';
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

  startExamResponseSubscription!: Subscription;
  startExamResponse = signal<IStartExamResponse | null>(null);

  resourceManagementSubscription!: Subscription;

  //readonly totalTime: number = 30 * 60;
  readonly totalTime = signal<number>(
    Math.floor(
      this.startExamResponse()!.data?.time_started?.getTime()! / 1000
    ) +
      3 * 60
  );

  readonly totalQuestions: number = 100;

  timeLeft = signal<number>(this.totalTime());

  progress = computed(
    () => ((this.totalTime() - this.timeLeft()) / this.totalTime()) * 100
  );

  currentQuestion = computed(() =>
    Math.min(
      Math.floor((this.totalTime() - this.timeLeft()) / 18) + 1,
      this.totalQuestions
    )
  );

  isActive = signal<boolean>(true);

  private intervalId: any;

  resourceManagement = signal<IResourceMonitor | null>(null);

  private autobotService = inject(AutobotService);

  dnsQuery = signal<string | null>(null);

  constructor(private ngZone: NgZone, private router: Router) {}

  ngOnDestroy(): void {
    this.stopTimer();

    if (this.startExamResponseSubscription) {
      this.startExamResponseSubscription.unsubscribe;
    }

    if (this.resourceManagementSubscription) {
      this.resourceManagementSubscription.unsubscribe;
    }
  }

  ngOnInit(): void {
    this.startTimer();

    this.getStartExamResponse();

    // Polling resource management
    this.resourceManagementSubscription = this.autobotService
      .pollResourceManagement()
      .subscribe({
        next: (data: IResourceMonitor | null) => {
          if (data) {
            this.resourceManagement.set(data);

            this.postResourceManagement(); // Calling resource management posting.
          }
        },
        error: (err) => {
          this.isActive.set(false);
          console.error('Polling stopped:', err);
        },
      });

      this.callDnsQuery(); 
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

  getStartExamResponse(): void {
    this.totalTime.set(30 * 60);

    this.startExamResponseSubscription =
      this.autobotService.startExamResponse$.subscribe(
        (response: IStartExamResponse | null) => {
          if (response) {
            this.startExamResponse.set(response);
          }
        }
      );
  }

    callDnsQuery(): void {
    this.autobotService.dnsQuery$.subscribe((response: string | null) => {
      if (response) {
        if (response !== 'Failed') {
          this.dnsQuery.set(response);
        }
      }
    });
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

    this.autobotService
      .postResourceManagement$(this.dnsQuery()!, responseManagement)
      .subscribe((response: IResourceManagementResponse | null) => {
        if (response) {

          if (response.exam_status === StatusReport.Ended) {

            this.router.navigate(['/end-exam']);
          } else {
            this.autobotService.resourceManagementResponseSubject.next(
              response
            );
          }
        } else {
          this.isActive.set(false);
        }
      });
  }
}
