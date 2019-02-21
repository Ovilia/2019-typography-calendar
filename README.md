# 2019 字体日历 App

![Website](./design/website.png)

![Design](./design/all.png)

## TODO

| 名称                            | 分类    | 优先级 | 备注 |
|--------------------------------|---------|------|------|
| - [x] 移动撕下的页面              | feat    | 高   |     |
| - [x] 文字位置颜色调整             | feat    | 高   |     |
| - [x] 分享保存图片                | feat    | 高    | 安卓、iPhone 6 崩溃 |
| - [x] 每日定时提醒                | feat    | 高    |     |
| - [x] 时区 bug                   | feat    | 高    |     |
| - [x] App Store 评论             | feat    | 中    |     |
| - [x] 撕日历的动画                | feat    | 中    |     |
| - [x] 关于中增加版本号             | feat    | 中    |     |
| - [ ] 导出的时候允许增加评论        | bug    | 中    |      |
| - [x] 图片模糊                    | bug    | 中    |      |
| - [x] 批量撕日历                  | bug    | 低    |     |
| - [x] 摇一摇将撕下的页面摆整齐      | feat    | 低    |     |
| - [x] 检查版本更新                | feat    | 低    | 仅ios |
| - [x] 终止系统音乐播放             | bug     | 低    |    |
| - [x] 小米 8 全屏问题             | bug     | 低    | 安卓 |
| - [ ] 首页 canvas 位置大小问题     | bug     | 低    | 无法复现 |
| - [ ] 历史页面中的故事文字没有透明度 | bug     | 低    |     |
| - [x] Toast 在菜单打开时有干扰     | bug     | 低    | 真机上没效果    |
| - [x] 撕日历的震动反馈             | bug     | 低    |     |
| - [ ] 关闭撕日历的音效             | bug     | 低    |     |
| - [ ] 分享调起微信微博等            | bug     | 低    |     |

## 本地调试方法

[![Build Status](https://travis-ci.com/Ovilia/2019-typography-calendar.svg?branch=master)](https://travis-ci.com/Ovilia/2019-typography-calendar)

先安装 [Node.js](https://nodejs.org/en/)、[npm](https://www.npmjs.com/get-npm)。

```
npm install -g ionic@3.20.1
npm install -g cordova@8.1.0
```

然后执行 `ionic serve` 会起一个本地服务器，在 Chrome 中调试。
