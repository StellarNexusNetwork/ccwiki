<template>
    <div class="Div">
        <div class="eyeList">
            <div class="logoDiv">
                <div class="logo">
                    <img id="logo1" src="/static/eye8/svg/logo1.svg" alt="SVG Image" width='auto' height='230px' draggable="false">
                    <img id="logo2" src="/static/eye8/svg/logo2.svg" alt="SVG Image" width='auto' height='90px' draggable="false">
                </div>
            </div>
            <div class="mainDiv">
                <div class="main">
                    <div class="option">
                        <div class="titleDiv">
                            <div class="title">剩余人数</div>
                            <div class="data">12</div>
                        </div>
                        <ApexCharts class="charts" type="area" height="140" :options="chartOptions" :series="series"></ApexCharts>
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


const chartOptions = {
    chart: { type: 'area', height: 140, sparkline: { enabled: true } },
    stroke: { curve: 'smooth' },
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
    yaxis: { min: 0 },
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

.Div .eyeList .logoDiv {
    width: 100%;
    user-select: none;
}

.Div .eyeList .logoDiv .logo {
    display: grid;
    user-select: none;
    position: relative;
}

.Div .eyeList .logoDiv .logo #logo2 {
    grid-area: 1;
    position: absolute;
    /* animation: 1s linear 0s infinite normal none running init_loading2; */
    animation: Eye8_logoA1 10s infinite;
    /* animation: init_loading2 3s infinite; */
    margin-top: 70px;
    margin-left: 70px;
}

.Div .eyeList .mainDiv .main .option {
    width: 300px;
    height: 200px;
    border-radius: 15px;
    background-color: #fefefe;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.Div .eyeList .mainDiv .main .option .titleDiv {
    width: 100%;
    height: 60px;
    padding: 10px;
}

.Div .eyeList .mainDiv .main .option .titleDiv .title {
    font-size: 20px;
    font-family: RHRCN-M;
}

.Div .eyeList .mainDiv .main .option .titleDiv .data {
    font-size: 15px;
    font-family: MiSans;
    color: #727272;
}

.Div .eyeList .mainDiv .main .option .charts {}
</style>