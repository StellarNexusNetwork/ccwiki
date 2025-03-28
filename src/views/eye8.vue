<template>
  <div class="Div">
    <div class="eyeList">
      <div class="logoDiv">
        <div class="logoP">
          <div class="logo">
            <img id="logo1" src="/static/eye8/svg/logo1.svg" alt="SVG Image" width='auto' height='230px'
                 draggable="false">
            <img id="logo2" src="/static/eye8/svg/logo2.svg" alt="SVG Image" width='auto' height='90px'
                 draggable="false">
          </div>
        </div>
        <div class="textDiv">
          <div class="card">
            <div class="pulse"></div>
          </div>
          <div class="textList">
            <h2>Web UI</h2>
            <p>Everything is under control.</p>
          </div>
        </div>
      </div>
      <div class="mainDiv">
        <div class="main">
          <div class="listW">
            <div class="option" :style="{ 'margin-right': oMarginRight }">
              <div class="titleDiv">
                <div class="title">未处理</div>
                <div class="data">12</div>
              </div>
              <ApexCharts class="charts" type="area" height="140" :options="chartOptions" :series="series"></ApexCharts>
            </div>
            <div class="option" :style="{ 'margin-left': oMarginRight }">
              <div class=" titleDiv">
                <div class="title">已处理</div>
                <div class="data">12</div>
              </div>
              <ApexCharts class="charts" type="area" height="140" :options="chartOptions" :series="series"></ApexCharts>
            </div>
          </div>
          <div class="listW" style="margin-top: 20px;">
            <div class="option" :style="{ 'margin-right': oMarginRight }">
              <div class="titleDiv">
                <div class="title">总量</div>
                <div class="data">12</div>
              </div>
              <ApexCharts class="charts" type="area" height="140" :options="chartOptions" :series="series"></ApexCharts>
            </div>
            <div class="option" :style="{ 'margin-left': oMarginRight }">
              <div class=" titleDiv">
                <div class="title">丢弃数</div>
                <div class="data">12</div>
              </div>
              <ApexCharts class="charts" type="area" height="140" :options="chartOptions" :series="series"></ApexCharts>
            </div>
          </div>
        </div>
        <div class="log">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import ApexCharts from 'vue3-apexcharts'
import {ref} from 'vue'

let oMarginRight = ref('10px')

const chartOptions = {
  chart: {type: 'area', height: 140, sparkline: {enabled: true}},
  stroke: {curve: 'smooth'},
  fill: {
    type: "gradient",
    gradient: {
      type: "vertical",
      opacityFrom: 1,
      opacityTo: 0,
      stops: [0, 100],
      colorStops: [
        {
          offset: 0,
          opacity: .2,
          color: "#04AAEB"
        },
        {
          offset: 100,
          opacity: 0,
          color: "#04AAEB"
        }
      ]
    }
  },
  yaxis: {min: 0},
  colors: ['#04AAEB'],
}

const series = [
  {
    name: '剩余未处理',
    data: [{
      x: 'Apple',
      y: 0
    }, {
      x: 'Orange',
      y: 66
    }, {
      x: '2.2',
      y: 11
    }, {
      x: '2.4',
      y: 30
    }],
  },
]


</script>

<style scoped>
.Div {
  display: flex;
  justify-content: center;
}

.Div .eyeList {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  align-items: center;
}

.Div .eyeList .logoDiv .textDiv {
  display: flex;
}

.Div .eyeList .logoDiv .textDiv .textList {
  margin-left: 35px;
  color: var(--color-text-title);
}

.Div .eyeList .logoDiv .textDiv .card .pulse {
  position: absolute;
  margin-top: 15px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--color-primary-normal);
}

.Div .eyeList .logoDiv .textDiv .card .pulse::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: .1px solid var(--color-primary-normal);
  animation: pulse 3s linear infinite;
  transform-origin: center;
  opacity: .8;
  scale: 0;
}

@keyframes pulse {

  70% {
    scale: 0;
    opacity: .8;
  }

  100% {
    scale: 3;
    opacity: 0;
  }

}

.Div .eyeList .logoDiv .textDiv .textList h2 {
  font-size: 26px;
  font-weight: 500;
  letter-spacing: .5px;
  margin: 0 0 2px;
}

.Div .eyeList .logoDiv .logoP {
  width: 100%;
  user-select: none;
  text-align: center;
}

.Div .eyeList .logoDiv .logoP .logo {
  display: grid;
  user-select: none;
  position: relative;
}

.Div .eyeList .logoDiv .logoP .logo #logo2 {
  grid-area: 1;
  position: absolute;
  /* animation: 1s linear 0s infinite normal none running init_loading2; */
  animation: Eye8_logoA1 10s infinite;
  /* animation: init_loading2 3s infinite; */
  margin-top: 70px;
  margin-left: 70px;
}

.Div .eyeList .mainDiv .main .listW {
  display: flex;
  flex-direction: row;
  margin-top: 30px;
}

.Div .eyeList .mainDiv .main .listW .option {
  width: 300px;
  height: 200px;
  border-radius: 15px;
  background-color: var(--color-background-1);
  box-shadow: 0 0 10px 0 var(--color-shadow-s);
  overflow: hidden;
}

.Div .eyeList .mainDiv .main .listW .option .titleDiv {
  width: 100%;
  height: 60px;
  padding: 10px;
}

.Div .eyeList .mainDiv .main .listW .option .titleDiv .title {
  font-size: 20px;
  font-family: RHRCN-M;
  color: var(--color-text-title);
}

.Div .eyeList .mainDiv .main .listW .option .titleDiv .data {
  font-size: 15px;
  font-family: MiSans;
  color: var(--color-text-body);
}

</style>