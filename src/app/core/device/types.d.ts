declare interface FirmwareInfo {
  model: string,
  model_code: number,
  rom_size: number,
  version: number,
  file_path: string
}

declare interface Firmware {
  vid: number,
  pid: number,
  addr_len: number,
  erase_flash: number,
  data: FirmwareInfo[]
}
