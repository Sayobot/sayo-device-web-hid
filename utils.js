// 用来将 {"键名": "空"} 转为 {"键名": "键名"} 的字符串
function obj2str(obj) {
  let str = '{';
  Object.keys(obj).forEach((name) => (str += `"${name}": "${name}",`));
  str += '}';
  return str;
}
