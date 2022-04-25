export const getParamDoc = (json: ParamJson) => {
  let doc: DocParam = {
    title: json.title,
    def: json.defVal,
    max: json.max,
    optionMap: new Map(),
  };

  json.data.forEach((element) => {
    doc.optionMap.set(element.code, element.name);
  });

  return doc;
};

export const getMainDoc = (json: MainJson) => {
  let doc: DocMain = {
    title: json.title,
    cmdMap: new Map(),
  };

  json.data.forEach((element) => {
    const cmd = getCmd(element);
    doc.cmdMap.set(cmd.code, cmd);
  });

  return doc;
};

export const getCmd = (json: CmdJson) => {
  let doc: DocCmd = {
    name: json.title,
    code: json.cmd_code,
    modeMap: new Map(),
  };

  json.mode.forEach((element) => {
    const mode = getMode(element);
    doc.modeMap.set(mode.code, mode);
  });

  return doc;
};

export const getMode = (json: ModeJson) => {
  let doc: DocMode = {
    name: json.name,
    code: json.code,
    note: json?.note || '',
    files: json.values,
  };
  return doc;
};
