import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SystemInformationsComponent } from '../system-informations/system-informations.component';
import { AutobotService } from '../../services/autobot.service';
import { Router } from '@angular/router';
import { ISystemInformation } from '../../interface/ISystemInformation';
import { ICandidateStartExam } from '../../interface/ICandidateStartExam';
import { IStartExamResponse } from '../../interface/IStartExamResponse';
import { catchError, of, Subscription, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-end-exam',
  imports: [MatCardModule, SystemInformationsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  startCandidateExamSubscription!: Subscription;
  dnsQuerySubscription!: Subscription;
  public dnsQuery = signal<string>('');
  private autobotService = inject(AutobotService);

  systemInformation!: ISystemInformation;
  isExamAvailable = signal<boolean>(true);

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    if (this.startCandidateExamSubscription) {
      this.startCandidateExamSubscription.unsubscribe;
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
    this.dnsQuerySubscription = this.autobotService.dnsQuery$.subscribe(
      (response: string | null) => {
        if (response) {
          if (response !== 'Failed') {
            this.dnsQuery.set(response);

            this.callStartCandidateExam(); // Calling candidate start exam
          } else {
            this.dnsQuery.set(response);
          }
        }
      }
    );
  }

  callStartCandidateExam(): void {
    const startCandidateExam: ICandidateStartExam = {
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

    // Poll every 3sec
    this.startCandidateExamSubscription = timer(0, 3000)
      .pipe(
        switchMap(() =>
          this.autobotService
            .startCandidateExam$(this.dnsQuery(), startCandidateExam)
            .pipe(
              catchError((error) => {
                console.error('start candidate exam error', error);

                return of(null); // Keeps polling
              })
            )
        )
      )
      .subscribe((data: IStartExamResponse | null) => {
        if (data) {
          if (data.data) {
            
            console.log('Candidate exam located polling stopped');
            console.log('Exam details: ', data.data);

            this.autobotService.startExamResponse.set(data); // Populate start exam reponse with start exam detail for candidate

            this.autobotService.invokeResourceManagementCommand(); // Execute resource management event, if exam exists.

            setTimeout(() => {
              this.startCandidateExamSubscription.unsubscribe();

              this.startExam();
            }, 3000);
          } else {
            console.log('No candidate exam exists', data);
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
