# Web HID Sayo Device

这是 **Sayo Device** 的 Web HID 版本实现，一些需要系统权限的功能无法实现，需要的话请使用桌面版 [Sayo Device PC](https://dl.sayobot.cn/setting_v3.zip) 设置程序。


### 运行

- [online example](https://sayodevice.com/device) 
- 本地打包后，进入 dist 当中已经打包的项目根目录中，使用 **http-server** 来运行，请使用 127.0.0.1 来访问，其他启动的 IP 会导致弹出 `当前浏览器不支持 Web HID` 的消息。

### 部署

打包后自行部署根目录下 dist 中的打包内容到服务器，请使用 https 或者代理到 `127.0.0.1`，否则会因为找不到 HID 对象导致弹出 `当前浏览器不支持 Web HID` 的消息。

### TODO

- [x] 按键
- [x] 字符串
- [x] 密码
- [x] 灯光
- [ ] 脚本
- [ ] 备份
