import { Component, computed, inject } from '@angular/core';
import { AutobotService } from '../../services/autobot.service';

@Component({
  selector: 'app-candidate-details',
  imports: [],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss',
})

export class CandidateDetailsComponent {

  private autobotService = inject(AutobotService);

  startExam = computed(() => (this.autobotService.startExamResponse()?.data));

  ngOnDestroy(): void {

  }

  ngOnInit(): void {
    
  }

}
