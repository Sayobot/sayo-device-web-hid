import { ControlType } from "src/app/core/doc";

export interface OptionControlData {
  type: ControlType;
  key: string;
  value: string;
  options: Array<{
    key: string;
    value: string;
  }>;
}

export interface OptionFormData {
  mode: OptionControlData;
  params: OptionControlData[];
}

export interface KeyFormData {
  mode: string;
  params: string[];
}
