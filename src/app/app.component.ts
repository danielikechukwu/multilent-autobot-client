import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutobotService } from '../services/autobot.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private autobotService = inject(AutobotService);

  constructor() {}

  ngOnDestroy(): void {
    this.autobotService.unlistenBackendEvents();
  }

  ngOnInit(): void {
    this.autobotService.listenForBackendEvents();
  }
}
