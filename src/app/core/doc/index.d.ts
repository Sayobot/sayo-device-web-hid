declare interface DocMode {
  name: string;
  code: number;
  note: string;
  files: string[];
}

declare interface DocCmd {
  name: string;
  code: number;
  modeMap: Map<number, DocMode>;
}

declare interface DocMain {
  title: string;
  cmdMap: Map<number, DocCmd>;
}

declare interface DocParam {
  title: string;
  def: number;
  min?: number;
  max?: number;
  optionMap: Map<number, string>;
}

declare interface ModeJson {
  name: string;
  code: number;
  note: string;
  values: (string | string)[];
}

declare interface CmdJson {
  title: string;
  cmd: string;
  cmd_code: number;
  format?: any;
  mode: ModeJson[];
}

declare interface MainJson {
  version: string;
  title: string;
  uri: string;
  methods: string[];
  data: CmdJson[];
}

declare interface ParamOptionJson {
  code: number;
  name: string;
}

declare interface ParamJson {
  version: string;
  title: string;
  multiple_choice: boolean;
  input_type: string;
  defVal: number;
  min?: number;
  max?: number;
  data: ParamOptionJson[];
}

declare interface GeneralKey {
  code: number;
  name: string;
  midPointY: number;
  midPointX: number;
  widget: number;
  height: number;
  radius: number;
}

declare interface LinuxKey {
  code: number;
  name: string;
}
