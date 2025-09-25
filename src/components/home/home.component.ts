import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SystemInformationsComponent } from '../system-informations/system-informations.component';
import { IconDefinition, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AutobotService } from '../../services/autobot.service';
import { IDnsQueryStatus } from '../../interface/IDnsQuery';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [SystemInformationsComponent, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})

export class HomeComponent implements OnInit, OnDestroy {

  private autobotService = inject(AutobotService);
  dnsQuerySubscription!: Subscription;
  dnsQuery!: IDnsQueryStatus;

  faBan: IconDefinition = faBan;
  systemInformation: any;

  constructor() {}

  ngOnDestroy(): void {
    this.dnsQuerySubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.callDnsQuery();
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
}
