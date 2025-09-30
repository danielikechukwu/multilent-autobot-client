import { Component, inject } from '@angular/core';
import { AutobotService } from '../../services/autobot.service';
import { Subscription } from 'rxjs';
import { IStartExamResponse } from '../../interface/IStartExamResponse';
import { IStartExam } from '../../interface/IStartExam';

@Component({
  selector: 'app-candidate-details',
  imports: [],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss',
})
export class CandidateDetailsComponent {
  private autobotService = inject(AutobotService);

  startExamResponseSubscription!: Subscription;

  startExam!: IStartExam;

  ngOnDestroy(): void {
    if (this.startExamResponseSubscription) {
      this.startExamResponseSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.getStartExamResponse(); // Getting start exam response
  }

  getStartExamResponse(): void {
    this.startExamResponseSubscription =
      this.autobotService.startExamResponse$.subscribe(
        (response: IStartExamResponse | null) => {
          if (response) {
            this.startExam = response.data!;
          }
        }
      );
  }
}
