import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, from, Observable, of, timer } from 'rxjs';
import { switchMap, catchError, scan, takeWhile } from 'rxjs/operators';
import { ISystemInformation } from '../interface/ISystemInformation';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ICandidateStartExam } from '../interface/ICandidateStartExam';
import { IStartExamResponse } from '../interface/IStartExamResponse';
import {
  IResourceMonitor,
  IResourceMonitorState,
} from '../interface/IResourceManagement';
import { ICreateResourceManagement } from '../interface/ICreateResourceManagement';
import { IResourceManagementResponse } from '../interface/IResourceManagementResponse';
import { IMessage } from '../interface/IMessage';

@Injectable({
  providedIn: 'root',
})
export class AutobotService {
  tauriInvoke: any | null;
  tauriListen: any | null;

  unlistenDnsQueryFns: any[] = [];

  // Signals variable declarations
  public startExamResponse = signal<IStartExamResponse | null>(null); // Start exam response

  public resourceManagementResponse =
    signal<IResourceManagementResponse | null>(null); // Resource monitor response

  public resourceManagement = signal<IResourceMonitor | null>(null);

  public systemInformation = signal<ISystemInformation | null>(null);

  public dnsQuery = signal<string>('');

  // Behaviour subject holding system information and it's observable that can be subscribe
  // to from anywhere in the application
  private systemInformationSubject =
    new BehaviorSubject<ISystemInformation | null>(null);
  public systemInformation$: Observable<ISystemInformation | null> =
    this.systemInformationSubject.asObservable();

  // Behaviour subject holding dns query and it's observable that can be subscribe
  // to from anywhere in the application
  private dnsQuerySubject = new BehaviorSubject<string | null>(null);
  public dnsQuery$: Observable<string | null> =
    this.dnsQuerySubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  private isTauri(): boolean {
    return !!(window as any).__TAURI_INTERNALS__;
  }

  async getTauriApis(): Promise<void> {
    return new Promise(async (resolve) => {
      const { invoke } = await import('@tauri-apps/api/core');

      const { listen } = await import('@tauri-apps/api/event');

      this.tauriInvoke = invoke;
      this.tauriListen = listen;

      resolve();
    });
  }

  async invokeSystemInformationCommand(): Promise<any> {
    const { invoke } = await import('@tauri-apps/api/core');

    if (!this.isTauri()) {
      return;
    }

    try {
      const result: ISystemInformation | null = await invoke('get_system_info');

      this.systemInformationSubject.next(result);

      this.systemInformation.set(result);

      return;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async invokeResourceManagementCommand(): Promise<any> {
    const { invoke } = await import('@tauri-apps/api/core');

    if (!this.isTauri()) {
      return;
    }

    try {
      const result: IResourceMonitor = await invoke('get_system_metrics');

      this.resourceManagement.set(result);

      return result;
    } catch (error) {
      console.error('Error invoking resource Tauri command:', error);

      throw error;
    }
  }

  pollResourceManagementInformation(): Observable<IResourceMonitorState> {
    return timer(0, 60000).pipe(
      switchMap(() =>
        from(this.invokeResourceManagementCommand()).pipe(
          catchError((error: any) => {
            if (error instanceof HttpErrorResponse) {
              console.log('ERROR FROM SERVER');
              return of(null);
            } else if (error instanceof ProgressEvent) {
              console.log('CORS ERROR');
              return of(null);
            } else {
              return of(null);
            }
          })
        )
      ),
      scan(
        (acc, result) => {
          if (result === null) {
            // increase consecutive error count
            return { errors: acc.errors + 1, value: null };
          } else {
            // reset error count on success
            return { errors: 0, value: result };
          }
        },
        { errors: 0, value: null as IResourceMonitor | null }
      ),
      takeWhile((state) => state.errors < 4, true) // stop after 4 errors
    );
  }

  async listenFnDnsQuery() {
    const { listen } = await import('@tauri-apps/api/event');

    if (!this.isTauri()) {
      return;
    }
    try {
      //await this.getTauriApis();

      const dnsQuery = await listen('dns::query', (event: any) => {
        if (event.payload.Success) {
          this.dnsQuerySubject.next(event.payload.Success);

          this.dnsQuery.set(event.payload.Success);
        } else {
          this.dnsQuerySubject.next('Failed');
        }
      });

      this.unlistenDnsQueryFns.push(dnsQuery);
    } catch (error) {
      console.error(error);
    }
  }

  startCandidateExam$(
    serverIpAddress: string,
    candidateStartExam: ICandidateStartExam
  ): Observable<IStartExamResponse> {
    var candidateStartExam$: Observable<IStartExamResponse> =
      this.httpClient.post<IStartExamResponse>(
        `http://${serverIpAddress}:9090/exam/candidate/start`,
        candidateStartExam
      );

    return candidateStartExam$;
  }

  postResourceManagement$(
    serverIpAddress: string,
    resourceManagement: ICreateResourceManagement
  ): Observable<IResourceManagementResponse | null> {
    var resourceManagement$: Observable<IResourceManagementResponse | null> =
      this.httpClient.post<IResourceManagementResponse | null>(
        `http://${serverIpAddress}:9090/exam/resource/monitor`,
        resourceManagement
      );

    return resourceManagement$;
  }

  endCandidateExam$(
    candidate_id: number,
    serverIpAddress: string
  ): Observable<IMessage> {
    var endExam$: Observable<IMessage> = this.httpClient.get<IMessage>(
      `http://${serverIpAddress}:9090/exam/candidate/end/${candidate_id}`
    );

    return endExam$;
  }

  listenForBackendEvents() {
    this.listenFnDnsQuery(); // Listening to event
  }

  unlistenBackendEvents() {
    // DNS Query
    this.unlistenDnsQueryFns.forEach((unlisten) => unlisten());
    this.unlistenDnsQueryFns = [];
  }
}
