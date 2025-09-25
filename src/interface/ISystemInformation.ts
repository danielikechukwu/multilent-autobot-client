export interface ISystemInformation {
    
    ComputerName: string,
    IPAddress: string,
    MacAddress: string,
    OSName: string,
    OSVersion: string,
    OSArch: string,
    RAMSize: string,
    HardDiskSize: string,
    CPUCores: number,
    ProcessorId: string,
    ProcessorName: string,
    SerialNumber: string,
    UniqueId: string,
    ScreenSize: string,
    DeviceType: DeviceType,
    ISRdp: boolean
}

export enum DeviceType {
    Default = 0,
    Desktop = 1,
    Laptop = 2
}