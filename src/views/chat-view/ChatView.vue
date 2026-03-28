<template>
  <div class="chat">
    <div class="navigationBar">
    </div>
    <div class="main" :style="{ height: `calc(100% - ${boxHeight + 30}px)` }">
      <div class="messageList">
        <div class="message" id='user'>
          <div class="headshot">
            <img v-if="imageUrl2" :src="imageUrl2" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">星韵猫猫(NekoNocturne)</div>
            <div class="text">你好呀</div>
          </div>
        </div>
        <div class="message" id='system'>
          <div class="headshot">
            <img v-if="imageUrl" :src="imageUrl" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">薇斯塔</div>
            <div class="text">
              喵呜~ 您好！我是Future·Vesta，很高兴认识您！<br/><br/>
              请问您想探索哪个领域呢？未来科技？魔法奥秘？还是猫咪周边新发现？
              告诉我吧，我一定会尽力帮助您的！(我会尽力帮您的!)
            </div>
          </div>
        </div>
        <div class="message" id='user'>
          <div class="headshot">
            <img v-if="imageUrl2" :src="imageUrl2" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">星韵猫猫(NekoNocturne)</div>
            <div class="text">猫咪周边？</div>
          </div>
        </div>
        <div class="message" id='system'>
          <div class="headshot">
            <img v-if="imageUrl" :src="imageUrl" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">薇斯塔</div>
            <div class="text">
              喵呜~ 都喜欢的话题可真是太有趣了！那我们来聊聊吧～<br/><br/>
              您觉得哪个类型的猫咪周边最可爱呢？是那种圆滚滚的玩偶，还是细致刻画的耳饰呢？ (Hmm...🤔)
            </div>
          </div>
        </div>
        <div class="message" id='user'>
          <div class="headshot">
            <img v-if="imageUrl2" :src="imageUrl2" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">星韵猫猫(NekoNocturne)</div>
            <div class="text">圆滚滚的玩偶</div>
          </div>
        </div>
        <div class="message" id='system'>
          <div class="headshot">
            <img v-if="imageUrl" :src="imageUrl" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">薇斯塔</div>
            <div class="text">
              喵呜~ 圆滚滚的玩偶超可爱的！柔软又温暖，抱在怀里简直太舒服了～ 想想看，那种毛茸茸的绒质感，是不是很想摸一摸呢？
              (想像してみてください！)
            </div>
          </div>
        </div>
        <div class="message" id='user'>
          <div class="headshot">
            <img v-if="imageUrl2" :src="imageUrl2" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">星韵猫猫(NekoNocturne)</div>
            <div class="text">想~</div>
          </div>
        </div>
        <div class="message" id='system'>
          <div class="headshot">
            <img v-if="imageUrl" :src="imageUrl" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">薇斯塔</div>
            <div class="text">
              喵呜~ 那么你最喜欢什么样的玩偶呢？是软绵绵的兔子、蓬松蓬松的大熊还是毛茸茸的小猫咪呢？(你喜欢哪种呢?)
            </div>
          </div>
        </div>
        <div class="message" id='user'>
          <div class="headshot">
            <img v-if="imageUrl2" :src="imageUrl2" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">星韵猫猫(NekoNocturne)</div>
            <div class="text">小猫咪啦</div>
          </div>
        </div>
        <div class="message" id='system'>
          <div class="headshot">
            <img v-if="imageUrl" :src="imageUrl" alt="" style="width:100%;height:100%;" draggable="false"/>
          </div>
          <div class="data">
            <div class="name">薇斯塔</div>
            <div class="text">
              喵呜，当然！小猫咪是最棒的玩偶！柔软又可爱，抱着它睡觉一定很安心呢！(抱枕)<br/><br/>
              你想知道关于猫咪的神奇魔法吗？或者你想一起探索星尘网络中的最新科技发明喵？(好奇心)
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-box">
      <div class="box" :style="{ height: boxHeight + 20 + 'px' }">
        <AutoResizeTextarea v-model="userInput" @update-height="updateBoxHeight"/>
        <div class="sendButton" :style="{ backgroundColor: sendButtonColor }">
          <img class="sendBoxImg" src="/static/views/chat-view/svg/send.svg" alt="SVG Image" draggable="false">
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted, ref, watchEffect} from 'vue';
import axios from 'axios';
// @ts-expect-error: 我不到啊 build的时候就是会报错 后面改ts应该就好了吧 这里暂时不用了 就先不修了
import AutoResizeTextarea from './components/AutoResizeTextarea.vue';

const userInput = ref(''); // 定义一个 ref 来存储用户的输入

const imageUrl = ref(''); // 创建响应式变量
const imageUrl2 = ref(''); // 创建响应式变量
const boxHeight = ref(38); // 默认高度为30px
const sendButtonColor = ref('#d7d7d7');

const updateBoxHeight = (height: number) => {
  if (height < 300) {
    boxHeight.value = height;
  } else {
    boxHeight.value = 300;
  }
};

// 定义一个函数来获取图片
const fetchImage = () => {
  axios({
    url: 'http://localhost:5000/get-image/system', // 请求服务器返回图片的 URL
    method: 'GET',
    responseType: 'blob', // 将响应类型设置为 blob 以处理二进制文件
  }).then((response) => {
    // 使用 URL.createObjectURL 将二进制数据转换为可显示的图片 URL
    imageUrl.value = URL.createObjectURL(response.data);
  }).catch((error) => {
    console.error('获取图片失败:', error);
  });

  axios({
    url: 'http://localhost:5000/get-image/user', // 请求服务器返回图片的 URL
    method: 'GET',
    responseType: 'blob', // 将响应类型设置为 blob 以处理二进制文件
  }).then((response) => {
    // 使用 URL.createObjectURL 将二进制数据转换为可显示的图片 URL
    imageUrl2.value = URL.createObjectURL(response.data);
  }).catch((error) => {
    console.error('获取图片失败:', error);
  });
};

// 使用 onMounted 让组件挂载时调用 fetchImage
onMounted(() => {
  fetchImage();
});

watchEffect(() => {
  if (userInput.value.trim() === '') {
    sendButtonColor.value = '#d7d7d7';
  } else {
    sendButtonColor.value = '#494949';
  }
});
</script>
<style scoped>
.chat {
  width: 100%;
  height: 100%;
  display: flex;
}

.chat .navigationBar {
  width: 0;
  height: 100%;
}

.chat .main {
  width: 100%;
  height: calc(100% - 70px);
  padding: 25px;
  overflow-y: scroll;
}

.chat .main .messageList .message {
  display: flex;
  margin-bottom: 30px;
}

.chat .main .messageList #system {
  padding-right: 40px;
}


.chat .main .messageList #user {
  padding-left: 40px;
  flex-direction: row-reverse;
}

.chat .main .messageList .message .headshot {
  width: 40px;
  height: 40px;
  min-width: 40px;
  overflow: hidden;
  border-radius: 10px;
  user-select: none;
}

.chat .main .messageList #system .headshot {
  margin-right: 10px;
}

.chat .main .messageList #user .headshot {
  margin-left: 10px;
}

.chat .main .messageList .message .data {
  display: flex;
  flex-direction: column;
}

.chat .main .messageList #user .data {
  justify-content: flex-end;
}

.chat .main .messageList .message .data .name {
  margin-top: -4px;
  margin-bottom: 3px;
  font-size: 12px;
  color: #999;
  /* user-select: none; */
}

.chat .main .messageList .message .data .text {
  border-radius: 10px;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
}

.chat .main .messageList #system .data .text {
  background: #f0f0f0;
  color: #000000;
  align-self: flex-start;
}

.chat .main .messageList #user .data .text {
  background: #0099ff;
  color: #fff;
  align-self: flex-end;
}

.input-box {
  position: fixed;
  display: flex;
  width: calc(100% - 50px);
  min-height: 70px;
  max-height: 500px;
  bottom: 0;
  background: #fafafa;
  text-align: center;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10px;
  padding-top: 10px;
}

.input-box .box {
  display: flex;
  width: 70%;
  border-radius: 29px;
  /* background: #f4f4f4; */
  background: #f0f0f0;
  justify-content: flex-end;
  align-items: flex-end;
  padding-bottom: 10px;
  padding-left: 60px;
}

.input-box .box .sendButton {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0099ff;
  margin: 10px 10px 0;
  padding: 10px;
}

.input-box .box .sendButton .sendBoxImg {
  width: 100%;
  height: 100%;
  user-select: none;
}
</style>
