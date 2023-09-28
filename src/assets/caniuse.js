var borwers = [
  { name: "chrome", min_version: 89 },
  { name: "edg", min_version: 89 },
  { name: "edge", min_version: 89 },
  { name: "opera", min_version: 76 }
]

function isSupportBorwer() {

  if (!navigator.hid) {
    return false;
  }

  var info = navigator.userAgent.toLowerCase();

  var brower_info = {
    name: "",
    version: 0
  }

  for (var i = 0; i < borwers.length; i++) {
    var brower = borwers[i];
    brower_info.name = brower.name;
    if (info.indexOf(brower.name) != -1) {
      var reg_str = brower.name + "/([\\d]+)";
      var reg = new RegExp(reg_str, "ig");

      var matchs = info.match(reg);

      if (matchs.length > 0) {
        var brower_arr = matchs[0].split("/");

        if (brower_arr.length > 1) {
          brower_info.version = brower_arr[1];
          if (brower_info.version >= brower.min_version) {
            console.log(`brower name: ${brower_info.name}, version: ${brower_info.version}`);
            return true;
          }
        }
      }
    }
  }

  return false;
}

function caniuse() {
  if (!isSupportBorwer()) {
    if (navigator.language === "zh-CN") {
      alert("请使用支持 Web HID 的浏览器，支持列表可查询: " + "https://caniuse.com/?search=webhid");
    } else {
      alert("Please use a support Web HID browser, the support list can be queried: " + "https://caniuse.com/?search=webhid");
    }

  }
}

caniuse();
