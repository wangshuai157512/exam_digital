export function getExamIneeOpt(data) {
  return {
    color: ["#21DF95", "#FF6969", "#00ADEF", "#FFDA00", "#FCFFFF"],
    tooltip: {
      trigger: "item",
      formatter: "{b}"
    },
    legend: {
      top: "middle",
      right: "15%",
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      // itemGap: 30,
      orient: "vertical",
      align: "left",
      textStyle: {
        color: "#fff",
        fontSize: 14
      }
    },
    series: [
      {
        name: "考生人数统计",
        type: "pie",
        center: ["20%", "50%"],
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center"
        },
        labelLine: {
          show: false
        },
        data
      }
    ]
  };
}

export function getTodayWarn(data) {
  return {
    color: ["#c00000", "#ff6c00", "#ffbf37"],
    tooltip: {
      trigger: "item",
      position: ["30%", "30%"]
    },
    legend: {
      top: "middle",
      right: "6%",
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      orient: "vertical",
      align: "left",
      itemGap: 15,
      textStyle: {
        color: "#fff"
      }
    },
    series: [
      {
        name: "今日预警统计",
        type: "pie",
        center: ["30%", "50%"],
        radius: ["30%", "50%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center"
        },
        labelLine: {
          show: false
        },
        data
      }
    ]
  };
}
