# data-collection-helper

用于辅助收集羊羊百科所需数据的用户脚本。浏览器安装[油猴插件](https://www.tampermonkey.net)后，[点击这里](https://xyy-huijiwiki.github.io/data-collection-helper/index.user.js)安装脚本。目前的功能有：

- 在优兔的视频列表页面（比如[羊村守护者](https://www.youtube.com/playlist?list=PLCxAtDkpA3f-pJSUtq-gb27ndgVvrav2Z)）批量收集视频信息，可用于快速填写剧集信息。
- 在淘宝商品详情页面（比如[《筐出未来》2022台历礼盒](https://item.taobao.com/item.htm?id=666003448564)）一键生成[周边页面](https://xyy.huijiwiki.com/wiki/《筐出未来》2022台历礼盒)的wiki代码。
- 在天猫商品详情页面（比如[2023羊羊台历](https://detail.tmall.com/item.htm?id=695522923134)）一键生成[周边页面](https://xyy.huijiwiki.com/wiki/2023%E7%BE%8A%E7%BE%8A%E5%8F%B0%E5%8E%86)的wiki代码。
- 在芒果TV视频列表（比如[勇闯四季城](https://www.mgtv.com/h/508234.html)）批量收集视频信息。
- 在当当网书籍商品详情页（比如[羊年喜羊羊电影小说](http://product.dangdang.com/23636327.html)）一键生成周边页面的wiki代码。暂不支持套装图书的代码生成。

## 使用方法

油猴插件和脚本安装成功后，打开相应页面，点击油猴插件，点击“打开羊羊百科小助手”。

![guidance](guidance.jpg)

## 常见问题

**无法安装脚本：**
浏览器需要先安装[篡改猴](https://www.tampermonkey.net)，再安装脚本。脚本体积较大，且[点击安装](https://xyy-huijiwiki.github.io/data-collection-helper/index.user.js)后没有提示或进度条，请保持网络通畅并耐心等待。

**优兔页面不显示脚本启动按钮：**
优兔网页采用了SPA（单页面应用）技术，有时需要在对应页面刷新一次才能显示脚本启动按钮。（准确来说，是从其他优兔页面进入播放列表页面后，需要刷新一次网页。）

## todo

- [ ] type assertion is used at `src/components/getYouTubeList.vue`, need to be removed.
- [ ] type assertion is used at `src/components/getTaobaoItem.vue`, need to be removed.
- [ ] type assertion is used at `src/components/getTianmaoItem.vue`, need to be removed.
- [x] update detection.
- [x] Get book info from dangdang.

## 测试

浏览器安装[油猴插件](https://www.tampermonkey.net)后，输入以下命令，自动弹出测试用的临时脚本安装界面。

```cmd
npm i
npm run dev
```

## 构建

输入以下命令，构建用户脚本，放在 dist 文件夹内。

```cmd
npm i
npm run build
```

对于本项目，单独构建并没有什么用。在 Github 更新代码后，会自动构建并把用户脚本代码更新至 Microsoft Static App。
