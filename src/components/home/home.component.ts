import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SystemInformationsComponent } from '../system-informations/system-informations.component';
import { AutobotService } from '../../services/autobot.service';
import { Router } from '@angular/router';
import { ISystemInformation } from '../../interface/ISystemInformation';
import { ICandidateStartExam } from '../../interface/ICandidateStartExam';
import { IStartExamResponse } from '../../interface/IStartExamResponse';
import { catchError, concatMap, delay, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-end-exam',
  imports: [MatCardModule, SystemInformationsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})

export class HomeComponent implements OnInit, OnDestroy {
  
  candidateStartExamSubscription!: Subscription;
  dnsQuerySubscription!: Subscription;
  public dnsQuery = signal<string>('');
  private autobotService = inject(AutobotService);

  systemInformation!: ISystemInformation;
  isExamAvailable = signal<boolean>(true);

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    if (this.candidateStartExamSubscription) {
      this.candidateStartExamSubscription.unsubscribe;
    }

    if (this.dnsQuerySubscription) {
      this.dnsQuerySubscription.unsubscribe;
    }
  }

  ngOnInit(): void {
    this.callDnsQuery();

    this.callSystemInformation(); // Call system information
  }

  callDnsQuery(): void {
    this.autobotService.dnsQuery$.subscribe((response: string | null) => {
      if (response) {
        if (response !== 'Failed') {
          this.dnsQuery.set(response);

          this.callCandidateStartExam(); // Calling candidate start exam
        } else {
          this.dnsQuery.set(response);
        }
      }
    });
  }

  callCandidateStartExam(): void {
    const candidateStartExam: ICandidateStartExam = {
      ip_address: this.systemInformation.ip_address,
      computer_name: this.systemInformation.computer_name,
      mac_address: this.systemInformation.mac_address,
      os_name: this.systemInformation.os_name,
      os_version: this.systemInformation.os_version,
      os_arch: this.systemInformation.os_arch,
      ram_size: this.systemInformation.ram_size,
      hard_disk_size: this.systemInformation.hard_disk_size,
      cpu_cores: this.systemInformation.cpu_cores,
      processor_id: this.systemInformation.processor_id,
      processor_name: this.systemInformation.processor_name,
      serial_number: this.systemInformation.serial_number,
      unique_id: this.systemInformation.unique_id,
      screen_size: this.systemInformation.screen_size,
      device_type: this.systemInformation.device_type,
      is_rdp: this.systemInformation.is_rdp,
    };

    this.candidateStartExamSubscription = this.autobotService
      .candidateStartExam$(this.dnsQuery(), candidateStartExam)
      .pipe(
        catchError((error: Error) => {
          console.error(error.message);

          // setInterval(() => {
          //   this.callCandidateStartExam();
          // }, 5000);

          //this.isExamAvailable.set(false);
          //this.callCandidateStartExam(); // Recall candidate exam till there is exam available

          return of();
        })
      )
      .subscribe((response: IStartExamResponse | null) => {
        if (response) {
          this.autobotService.startExamResponseSubject.next(response);

          // Calling Resource Management command
          this.autobotService.invokeResourceManagementCommand();

          if (!response.data) {
            //this.isExamAvailable.set(false);
            //this.callCandidateStartExam(); // Recall candidate exam till there is exam available

            // setInterval(() => {
            //   this.callCandidateStartExam();
            // }, 5000); // Recall candidate exam till there is exam available

          } else {
            setTimeout(() => {
              this.startExam();
            }, 3000);
          }
        }
      });
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

  startExam() {
    this.router.navigate(['/start-exam']);
  }
}
