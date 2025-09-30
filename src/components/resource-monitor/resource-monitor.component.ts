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

}
