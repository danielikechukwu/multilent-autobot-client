import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { AutobotService } from '../../services/autobot.service';

@Component({
  selector: 'app-resource-monitor',
  imports: [],
  templateUrl: './resource-monitor.component.html',
  styleUrl: './resource-monitor.component.scss',
})
export class ResourceMonitorComponent implements OnInit, OnDestroy {

  private autobotService = inject(AutobotService);

  systemInformations = computed(() => (this.autobotService.systemInformation()));

  resourceManagement = computed(() => (this.autobotService.resourceManagement()));

  dnsQuery = computed(() => (this.autobotService.dnsQuery()));

  constructor() {}

  ngOnDestroy(): void {

  }

  ngOnInit(): void {

  }

  // private postResourceManagement(): void {

  //   const responseManagement: ICreateResourceManagement = {
  //     ip_addr: this.resourceManagement()?.ip_addr!,
  //     cpu_usage: this.resourceManagement()?.cpu_usage!,
  //     ram_usage: this.resourceManagement()?.ram_usage!,
  //     exam_id: this.resourceManagement()?.exam_id!,
  //     network_speed: this.resourceManagement()?.network_speed!,
  //     disk_utility: this.resourceManagement()?.disk_utility!,
  //     network_utilization: this.resourceManagement()?.network_utilization!,
  //     candidate_id: this.startExam()?.candidate_id!,
  //   };

  //   this.autobotService
  //     .postResourceManagement$(this.dnsQuery()!, responseManagement)
  //     .subscribe((response: IResourceManagementResponse | null) => {
  //       if (response) {
  //         this.autobotService.resourceManagementResponseSubject.next(response);
  //       }
  //     });
  // }

}
