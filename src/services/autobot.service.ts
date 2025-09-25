import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISystemInformation } from '../interface/ISystemInformation';
import { IDnsQueryStatus } from '../interface/IDnsQuery';

@Injectable({
  providedIn: 'root',
})
export class AutobotService {
  tauriInvoke: any | null;
  tauriListen: any | null;
  unlistenFns: any[] = [];

  // Behaviour subject holding system information and it's observable that can be subscribe
  // to from anywhere in the application
  private systemInformationSubject =
    new BehaviorSubject<ISystemInformation | null>(null);
  public systemInformation$: Observable<ISystemInformation | null> =
    this.systemInformationSubject.asObservable();

  // Behaviour subject holding dns query and it's observable that can be subscribe
  // to from anywhere in the application
  private dnsQuerySubject = new BehaviorSubject<IDnsQueryStatus | null>(null);
  public dnsQuery$: Observable<IDnsQueryStatus | null> =
    this.dnsQuerySubject.asObservable();

  constructor() {}

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
    if (!this.isTauri()) {
      return;
    }
    console.log("invokeSystemInformationCommand");
    try {
      
      const result: ISystemInformation | null = await this.tauriInvoke(
        'get_system_info'
      );
      console.log(result);

      this.systemInformationSubject.next(result);
      return;
    } catch (error) {
      console.error('Error calling System information:', error);
      throw error;
    }
  }

  async listenFnDnsQuery() {
    if (!this.isTauri()) {
      return;
    }
    try {
      await this.getTauriApis();

      const unlisten = await this.tauriListen('dns::query', (event: any) => {
        console.log({ event });
        //this.hasDnsQuery$.next(true);
        this.dnsQuerySubject.next(event.payload);
      });
      this.unlistenFns.push(unlisten);
    } catch (error) {
      console.log(error);
    }
  }

  listenForBackendEvents() {
    this.listenFnDnsQuery();
    // listen for another event
  }

  unlistenBackendEvents() {
    this.unlistenFns.forEach((unlisten) => unlisten());
    this.unlistenFns = [];
  }
}
