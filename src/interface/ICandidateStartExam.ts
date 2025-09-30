import { DeviceType } from "./ISystemInformation";

export interface ICandidateStartExam {

    ip_address: string | null,
    computer_name: string | null,
    mac_address: string | null,
    os_name: string | null,
    os_version: string | null,
    os_arch: string | null,
    ram_size: string | null,
    hard_disk_size: string | null,
    cpu_cores: number,
    processor_id: string | null,
    processor_name: string | null,
    serial_number: string | null,
    unique_id: string | null,
    screen_size: string | null,
    device_type: DeviceType | null,
    is_rdp: boolean | null
}