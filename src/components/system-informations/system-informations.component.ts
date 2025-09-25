import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AutobotService } from '../../services/autobot.service';
import { ISystemInformation } from '../../interface/ISystemInformation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-system-informations',
  imports: [],
  templateUrl: './system-informations.component.html',
  styleUrl: './system-informations.component.scss',
})

export class SystemInformationsComponent implements OnInit, OnDestroy {

  private autobotService = inject(AutobotService);
  systemInformationSubscription!: Subscription;
  systemInformation!: ISystemInformation;

  constructor() {}

  ngOnDestroy(): void {
    this.systemInformationSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.callSystemInformation();
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
