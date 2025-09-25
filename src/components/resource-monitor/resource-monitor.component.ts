import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AutobotService } from '../../services/autobot.service';
import { Subscription } from 'rxjs';
import { IDnsQueryStatus } from '../../interface/IDnsQuery';
import { ISystemInformation } from '../../interface/ISystemInformation';

@Component({
  selector: 'app-resource-monitor',
  imports: [],
  templateUrl: './resource-monitor.component.html',
  styleUrl: './resource-monitor.component.scss',
})

export class ResourceMonitorComponent implements OnInit, OnDestroy {

  private autobotService = inject(AutobotService);
  private dnsQuerySubscription!: Subscription;
  dnsQuery!: IDnsQueryStatus;
  systemInformationSubscription!: Subscription;
  systemInformation!: ISystemInformation;

  ngOnDestroy(): void {
    this.dnsQuerySubscription.unsubscribe();
    this.systemInformationSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.callDnsQuery();
    this.callSystemInformation();
  }

  private callDnsQuery(): void {
    this.dnsQuerySubscription = this.autobotService.dnsQuery$.subscribe(
      (response: IDnsQueryStatus | null) => {
        if (response) {
          this.dnsQuery = response;
        }
      }
    );
  }

  private callSystemInformation(): void {
    this.autobotService.systemInformation$.subscribe(
      (response: ISystemInformation | null) => {
        if (response) {
          this.systemInformation = response;
        }
      }
    );
  }
}
