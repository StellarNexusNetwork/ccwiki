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
                    <ApexCharts type="area" height="160" :options="chartOptions" :series="series"></ApexCharts>
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
    chart: { type: 'area', height: 160, sparkline: { enabled: true } },
    xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    },
    stroke: { curve: 'straight' },
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
                    color: "#ffffff"
                },
                {
                    offset: 100,
                    opacity: 0,
                    color: "#ffffff"
                }
            ]
        }
    },
    yaxis: { min: 0 },
    colors: ['#DCE6EC'],
    title: { text: '$424,652', offsetX: 0, style: { fontSize: '24px' } },
    subtitle: { text: 'Sales', offsetX: 0, style: { fontSize: '14px' } },
}

const series = [
    {
        name: '剩余未处理',
        data: [15, 50, 18, 90, 30, 65],
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
</style>