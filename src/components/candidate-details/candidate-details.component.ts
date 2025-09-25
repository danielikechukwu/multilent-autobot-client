import { Component, inject } from '@angular/core';
import { AutobotService } from '../../services/autobot.service';
import { Subscription } from 'rxjs';
import { IDnsQueryStatus } from '../../interface/IDnsQuery';

@Component({
  selector: 'app-candidate-details',
  imports: [],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss'
})
export class CandidateDetailsComponent {

  private autobotService = inject(AutobotService);
  private dnsQuerySubscription!: Subscription;
  dnsQuery!: IDnsQueryStatus;

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
