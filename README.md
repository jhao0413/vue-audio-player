# vue-audio-player

> Vue音乐播放器组件

[在线浏览](https://codesandbox.io/s/jhao413-vue-audio-player-xnuxft)

## 示例图
![](https://jhao413.oss-cn-beijing.aliyuncs.com/blog/20221109125827.png)
![](https://jhao413.oss-cn-beijing.aliyuncs.com/blog/20221109130003.png)

## 组件功能
* 基础音乐播放暂停切歌
* 显示音乐缓存进度
* 显示音乐列表
* 进度条拖动
* 音量控制

## 安装
### NPM

``` bash
npm i @jhao413/vue-audio-player
```

## 使用
> main.js

```js
import audioPlayer from "@jhao413/vue-audio-player";

Vue.use(audioPlayer);
```
> 组件中使用
> 
> music-list为必填参数

```html
<template>
  <div id="app">
    <audio-player :music-list="list"></audio-player>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      list: [
        {
          name: '可惜没如果',
          url: 'http://xxx.mp3',
          img:
            'http://p3.music.126.net/QXZRckFTN5375vdQSyG0jA==/109951166919095160.jpg?param=300x300',
          singer: '林俊杰',
        },
      ],
    }
  },
}
</script>

```
# License
vue-audio-player is open source and released under the MIT License.