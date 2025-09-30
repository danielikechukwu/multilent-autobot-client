import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AutobotService } from '../../services/autobot.service';
import { Subscription } from 'rxjs';
import { IResourceMonitor } from '../../interface/IResourceManagement';
import { ISystemInformation } from '../../interface/ISystemInformation';
import { ICreateResourceManagement } from '../../interface/ICreateResourceManagement';
import { IStartExam } from '../../interface/IStartExam';
import { IStartExamResponse } from '../../interface/IStartExamResponse';
import { IResourceManagementResponse } from '../../interface/IResourceManagementResponse';

@Component({
  selector: 'app-resource-monitor',
  imports: [],
  templateUrl: './resource-monitor.component.html',
  styleUrl: './resource-monitor.component.scss',
})
export class ResourceMonitorComponent implements OnInit, OnDestroy {
  private autobotService = inject(AutobotService);
  systemInformation = signal<ISystemInformation | null>(null);
  resourceManagement = signal<IResourceMonitor | null>(null);
  dnsQuery = signal<string | null>(null);

  startExamResponseSubscription!: Subscription;

  startExam = signal<IStartExam | null>(null);

  resourceManagementSubscription!: Subscription;
  systemInformationSubscription!: Subscription;
  dnsQuerySubscription!: Subscription;

  constructor() {}

  ngOnDestroy(): void {
    if (this.resourceManagementSubscription) {
      this.resourceManagementSubscription.unsubscribe;
    }

    if (this.systemInformationSubscription) {
      this.systemInformationSubscription.unsubscribe;
    }

    if (this.startExamResponseSubscription) {
      this.startExamResponseSubscription.unsubscribe;
    }

    if(this.dnsQuerySubscription){
      this.dnsQuerySubscription.unsubscribe;
    }
  }

  ngOnInit(): void {
    this.callResourceManagement(); // Calling resource management

    this.callSystemInformation();

    this.getStartExamResponse(); // Calling start exam response

    this.callDnsQuery();
  }

  private callResourceManagement(): void {
    this.resourceManagementSubscription =
      this.autobotService.resourceManagement$.subscribe(
        (response: IResourceMonitor | null) => {
          if (response) {
            this.resourceManagement.set(response);

            this.postResourceManagement(); // Post resource management.
          }
        }
      );
  }

    callDnsQuery(): void {
    this.dnsQuerySubscription = this.autobotService.dnsQuery$.subscribe((response: string | null) => {
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
      candidate_id: this.startExam()?.candidate_id!,
    };

    this.autobotService
      .postResourceManagement$(this.dnsQuery()!, responseManagement)
      .subscribe((response: IResourceManagementResponse | null) => {
        if (response) {
          this.autobotService.resourceManagementResponseSubject.next(response);
        }
      });
  }

  getStartExamResponse(): void {
    this.startExamResponseSubscription =
      this.autobotService.startExamResponse$.subscribe(
        (response: IStartExamResponse | null) => {
          if (response) {
            this.startExam.set(response.data!);
          }
        }
      );
  }

  private callSystemInformation(): void {
    this.systemInformationSubscription =
      this.autobotService.systemInformation$.subscribe(
        (response: ISystemInformation | null) => {
          if (response) {
            this.systemInformation.set(response);
          }
        }
      );
  }
}
