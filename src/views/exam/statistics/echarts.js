const COLOR_VIA = "#D7D9DD";
export function bar({ title, data }) {
  const maxNum = Math.max(...data.map((item) => item.b));
  const seep = Math.ceil(maxNum / 200);

  const option = {
    grid: {
      top: "20%",
      left: "1%",
      right: "1%",
      bottom: "3%",
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function (params) {
        console.log(params);
        var tar = params[1];
        return "1233123";
      }
    },
    title: {
      text: title,
      left: "center",
      top: 4,
      textStyle: {
        color: COLOR_VIA
      }
    },
    legend: {
      right: 60,
      top: 10,
      itemWidth: 24,
      itemHeight: 12,
      borderRadius: 50,
      icon: "roundRect",
      textStyle: {
        color: COLOR_VIA
      }
    },
    xAxis: {
      type: "category",
      axisLabel: {
        color: COLOR_VIA
      },
      data: data.map((item) => item.label)
    },
    yAxis: [
      {
        type: "value",
        name: "合格率%",
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          color: COLOR_VIA
        },
        nameTextStyle: { color: COLOR_VIA },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#ffffff3b"
          }
        }
      },
      {
        type: "value",
        name: "人数",
        min: 0,
        max: seep * 200,
        interval: seep * 40,
        axisLabel: {
          color: COLOR_VIA
        },
        nameTextStyle: { color: COLOR_VIA },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#ffffff3b"
          }
        }
      }
    ],
    series: [
      {
        name: "合格率%",
        type: "bar",
        barWidth: 12,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "#1d74cf"
              },
              {
                offset: 1,
                color: "#0f3554"
              }
            ]
          },
          borderColor: "#1d74cf"
        },
        data: data.map((item) => item.a)
      },
      {
        name: "人数",
        type: "bar",
        yAxisIndex: 1,
        barWidth: 12,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "#15d8c9"
              },
              {
                offset: 1,
                color: "#0f3453"
              }
            ]
          },
          borderColor: "#36eaff"
        },
        data: data.map((item) => item.b)
      }
    ]
  };

  return option;
}

export function bar1({ title, data }) {
  const option = {
    grid: {
      top: "20%",
      left: "1%",
      right: "1%",
      bottom: "3%",
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function (params) {
        console.log(params);
        var tar = params[1];
        return "1233123";
      }
    },
    title: {
      text: title,
      left: "center",
      top: 4,
      textStyle: {
        color: COLOR_VIA
      }
    },
    xAxis: {
      axisLabel: {
        color: COLOR_VIA
      },
      data: data.map((item) => item.label)
    },
    yAxis: [
      {
        type: "value",
        name: "扣分次数",
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          color: COLOR_VIA
        },
        nameTextStyle: { color: COLOR_VIA },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#ffffff3b"
          }
        }
      }
    ],
    series: {
      type: "bar",
      barWidth: 12,
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 1,
          x2: 0,
          y2: 0,
          colorStops: [
            {
              offset: 0,
              color: "#1d74cf"
            },
            {
              offset: 1,
              color: "#0f3554"
            }
          ]
        },
        borderColor: "#1d74cf"
      },
      data
    }
  };

  return option;
}
