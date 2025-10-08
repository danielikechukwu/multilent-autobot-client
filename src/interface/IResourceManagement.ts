export interface IResourceMonitor {
    
    unique_id: number,
    ip_addr: string,
    cpu_usage: number,
    ram_usage: number,
    network_speed: number,
    disk_utility: number,
    network_utilization: number,
}

export interface IResourceMonitorState {
  errors: number;
  value: IResourceMonitor | null;
}