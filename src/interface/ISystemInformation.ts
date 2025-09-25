export interface ISystemInformation {
    
    computer_name: string,
    ip_address: string,
    mac_address: string,
    os_name: string,
    os_version: string,
    os_arch: string,
    ram_size: string,
    hard_disk_size: string,
    cpu_cores: number,
    processor_id: string,
    processor_name: string,
    serial_number: string,
    unique_id: string,
    screen_size: string,
    device_type: DeviceType,
    is_rdp: boolean
}

export enum DeviceType {
    Default = 0,
    Desktop = 1,
    Laptop = 2
}