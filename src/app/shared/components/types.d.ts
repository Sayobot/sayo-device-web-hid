import { ControlType } from "./dynamix-form";

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

export interface DynamixFormData {
  mode: string;
  params: string[];
}
