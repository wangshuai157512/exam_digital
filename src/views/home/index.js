import axios from "axios";
const COLOR_VIA = "#D7D9DD";

/**
 * 地图
 * @param {Number} adCode 展示区域邮政编码
 * @param {Array} activ 激活的区域
 * `https://geo.datav.aliyun.com/areas_v3/bound/${adCode}.json`
 * `https://geo.datav.aliyun.com/areas_v3/bound/${adCode}_full.json`
 */
export const mapGetOptions = function (echarts, adCode = 130600) {
  return new Promise((resolve, reject) => {
    axios.get(`/geo/map.json`).then((json) => {
      axios.get(`/geo/map_full.json`).then(({ data }) => {
        echarts.registerMap("js2", json.data);
        echarts.registerMap("js", data);
        resolve();
      });
    });
  });
};

export const options = {
  geo: [
    {
      map: "js",
      aspectScale: 1.2,
      zoom: 1.4, //默认显示级别
      layoutSize: "100%",
      layoutCenter: ["50%", "53%"],
      itemStyle: {
        areaColor: "transparent",
        borderColor: "#03d8eb",
        borderWidth: 2
      },
      emphasis: {
        itemStyle: {
          areaColor: "#0f688c"
        },
        label: {
          show: 0,
          color: "#fff"
        }
      },
      zlevel: 3
    },
    {
      map: "js2",
      aspectScale: 1.2,
      zoom: 1.4, //默认显示级别
      layoutSize: "100%",
      layoutCenter: ["50%", "53%"],
      itemStyle: {
        areaColor: "#0f688c",
        borderColor: "#03d8eb",
        borderWidth: 2
      },
      zlevel: 2,
      silent: true
    },
    {
      map: "js2",
      aspectScale: 1.2,
      zoom: 1.4, //默认显示级别
      layoutSize: "100%",
      layoutCenter: ["50%", "57%"],
      itemStyle: {
        areaColor: "#0f688c",
        borderColor: "#329BF5",
        borderWidth: 0
      },
      zlevel: 1,
      silent: true
    }
  ]
};

// export const itOpt = {
//   name: "北京精英智通考场1",
//   value: [115.470659, 38.88662, 1],
//   itemStyle: { color: "#44fb69" },
//   label: {
//     color: "#fff",
//     formatter: "{b}",
//     position: "right",
//     show: false,
//     backgroundColor: {
//       image: "./image/tooltip.png",
//       width: 225,
//       height: 145
//     },
//     width: 224,
//     formatter: [
//       "{a|{b}}",
//       `{b|考试科目:${12}}`,
//       "{c|当前合格率:80%}",
//       "{c|考场状态:正在考试}"
//     ].join("\n"),
//     rich: {
//       wa: {
//         color: "#01e8f8",
//         fontSize: 16,
//         padding: [22, 0, 10, 12]
//       },
//       wb: {
//         color: "#01e8f8",
//         fontSize: 12,
//         padding: [0, 0, 0, 12]
//       },
//       wc: {
//         color: "#01e8f8",
//         fontSize: 12,
//         padding: [10, 0, 0, 12]
//       },
//       wd: {
//         color: "#fff",
//         fontSize: 12,
//         padding: [10, 0, 0, 12]
//       },
//       we: {
//         color: "#fff",
//         fontSize: 14,
//         padding: [8, 0, 0, 12]
//       },
//       wf: {
//         color: "",
//         fontSize: 14,
//         padding: [4, 4, 4, 4]
//       },
//       a: {
//         color: "#01e8f8",
//         fontSize: 16,
//         padding: [25, 0, 10, 12]
//       },
//       b: {
//         color: "#01e8f8",
//         fontSize: 12,
//         padding: [0, 0, 0, 12]
//       },
//       c: {
//         color: "#01e8f8",
//         fontSize: 12,
//         padding: [10, 0, 0, 12]
//       },
//       d: {
//         color: "#01e8f8",
//         fontSize: 12,
//         padding: [10, 0, 0, 12]
//       }
//     }
//   }
// };
/**
 * 预警图表
 * @param {EchartsDom} refEcharts 图表节点
 * @param {Number} num 激活的区域
 */

const animation = {};
export const warnGetOptions = function (echarts, refEcharts, num = 50, key) {
  let angle = Math.floor(Math.random() * 361);
  const option = {
    // 标题
    title: [
      {
        text: num + "%\n处置进度",
        x: "center",
        y: "center",
        textStyle: {
          fontSize: "12",
          color: "#fff",
          fontFamily: "PingFang",
          fontWeight: "300"
        }
      }
    ],

    series: [
      //内圆
      {
        type: "pie",
        radius: "70%",
        center: ["50%", "50%"],
        animation: false,
        hoverAnimation: false,
        z: 3,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(18, 187, 193, 0.2)" // 渐变起始颜色，透明度为 0.2
              },
              {
                offset: 0.5,
                color: "rgba(18, 187, 193, 1)" // 渐变中间颜色，透明度为 1
              },
              {
                offset: 1,
                color: "rgba(18, 187, 193, 0.2)" // 渐变结束颜色，透明度为 0.2
              }
            ],
            false
          ),
          shadowColor: "rgb(18 187 193)",
          shadowBlur: 10
        },
        label: {
          show: false
        },
        tooltip: {
          show: false
        },
        data: [100]
      },
      //外圆
      {
        name: "ring5",
        type: "custom",
        coordinateSystem: "none",
        renderItem: function (params, api) {
          return {
            type: "arc",
            shape: {
              cx: api.getWidth() / 2,
              cy: api.getHeight() / 2,
              r: (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.85,
              startAngle: ((270 + -angle) * Math.PI) / 180,
              endAngle: ((40 + -angle) * Math.PI) / 180
            },
            style: {
              stroke: "#10476b",
              fill: "transparent",
              lineWidth: 1.5
            },
            silent: true
          };
        },
        data: [0]
      },
      {
        name: "ring5",
        type: "custom",
        coordinateSystem: "none",
        renderItem: function (params, api) {
          return {
            type: "arc",
            shape: {
              cx: api.getWidth() / 2,
              cy: api.getHeight() / 2,
              r: (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.85,
              startAngle: (0 * Math.PI) / 180,
              endAngle: (360 * Math.PI) / 180
            },
            style: {
              stroke: "#10476b",
              fill: "transparent",
              lineWidth: 1.5
            },
            silent: true
          };
        },
        data: [0]
      },

      {
        name: "ring5", //绿点
        type: "custom",
        coordinateSystem: "none",
        renderItem: function (params, api) {
          let x0 = api.getWidth() / 2;
          let y0 = api.getHeight() / 2;
          let r = (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.85;
          let point = getCirlPoint(x0, y0, r, 270 + -angle);
          return {
            type: "circle",
            shape: {
              cx: point.x,
              cy: point.y,
              r: 1.2
            },
            style: {
              stroke: "#0CD3DB", //绿
              fill: "#0CD3DB"
            },
            silent: true
          };
        },
        data: [0]
      }
    ]
  };

  //获取圆上面某点的坐标(x0,y0表示坐标，r半径，angle角度)
  function getCirlPoint(x0, y0, r, angle) {
    let x1 = x0 + r * Math.cos((angle * Math.PI) / 180);
    let y1 = y0 + r * Math.sin((angle * Math.PI) / 180);
    return {
      x: x1,
      y: y1
    };
  }

  function draw() {
    angle = angle - 0.5;
    refEcharts.setOption(option, true);
    animation[key] = window.requestAnimationFrame(draw);
  }

  cancelAnimationFrame(animation[key] || 0);
  draw();
};

/**
 * 科目合格率趋势
 * @param {Object} data 数据
 */
export const subjectGetOptions = function (data) {
  return {
    title: {
      text: "单位 %",
      left: "left", // 位置，可以根据需要调整
      textStyle: {
        color: "#AAAAAA", // 标题颜色
        fontSize: 12 // 标题字体大小.
      }
    },
    grid: {
      top: "18%",
      left: "1%",
      right: "8%",
      bottom: "3%",
      containLabel: true
    },
    legend: {
      itemWidth: 16,
      itemHeight: 8,
      borderRadius: 50,
      icon: "roundRect",
      data: ["理论考试", "科目二", "科目三"],
      textStyle: {
        color: COLOR_VIA
      },
      top: "-2%",
      right: "2%"
    },
    tooltip: {
      trigger: "axis",
      borderColor: "#314F70",
      backgroundColor: "rgba(22,46,82,0.8)",
      textStyle: {
        color: "#FFF"
      },
      formatter: function (info) {
        let result = "";
        let content = "";
        info.map((item) => {
          if (item.data && item.data.empty) {
            result = "";
          } else {
            content += `${item.marker} ${item.seriesName} ${
              item.value >= 0 ? item.value + "%" : ""
            }<br/>`;
            result = `<span style='font-size: 14px;'>${item.name}</span> <br/> ${content}`;
          }
        });
        return result;
      },
      axisPointer: {
        type: "line",
        crossStyle: {
          color: "#999"
        },
        label: {
          formatter: " "
        }
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.label,
      axisLabel: {
        rotate: 0, // 设置标签倾斜角度
        color: COLOR_VIA
      },
      lineStyle: {
        color: "#FFFFFF"
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: COLOR_VIA,
        formatter: "{value}"
      },
      min: 0,
      max: 100,
      interval: 20,
      splitLine: {
        show: true,
        lineStyle: {
          color: "#909399"
        }
      }
    },
    series: [
      {
        name: "理论考试",
        type: "line",
        color: "#ffbf37",
        smooth: false,
        symbol: "none",
        data: data.ll
      },
      {
        name: "科目二",
        type: "line",
        color: "#2a71ff",
        symbol: "none",
        smooth: false,
        data: data.km2
      },
      {
        name: "科目三",
        type: "line",
        symbol: "none",
        color: "#03f4ff",
        smooth: false,
        data: data.km3
      }
    ]
  };
};

/**
 * 扣分分析
 * @param {Array} data 数据
 */
export function getDeductOptions(data, ref) {
  const { height } = ref.getBoundingClientRect();
  const itemGap = (height - 3 * 20) / 2;
  const color = [
    "#9bd342",
    "#ff6969",
    "#00adef",
    "#ab4cd3",
    "#ffda00",
    "#d3d3d2"
  ];

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}"
    },
    legend: {
      top: "middle",
      right: "0",
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      itemGap,
      orient: "vertical",
      align: "left",
      textStyle: {
        color: "#fff"
      }
    },
    series: [
      {
        name: "扣分分析",
        type: "pie",
        center: ["20%", "50%"],
        radius: ["50%", "90%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center"
        },
        labelLine: {
          show: false
        },
        data,
        color
      }
    ]
  };
}

/**
 * 异地考生分析
 * @param {Array} data 数据
 */
export function getAbroadOptions(data, title = "") {
  return {
    title: {
      text: title,
      textStyle: {
        color: COLOR_VIA
      }
    },
    grid: {
      top: "20%",
      left: "1%",
      right: "1%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      axisLabel: {
        color: COLOR_VIA
      },
      type: "category",
      data: data.map((o) => o.name)
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: COLOR_VIA
      },
      splitLine: {
        lineStyle: {
          color: "#ffffff3b"
        }
      }
    },
    series: [
      {
        data: data.map((o) => o.value),
        type: "bar",
        barWidth: 12,
        color: "#0099ff",
        itemStyle: {
          borderRadius: [100, 100, 0, 0]
        }
      }
    ]
  };
}

/**
 * 考生情况统计
 * @param {Array} data 数据
 */
export function getCandidateOptions(xdata, data, title) {
  return {
    grid: {
      top: "20%",
      left: "1%",
      right: "1%",
      bottom: "3%",
      containLabel: true
    },
    legend: {
      top: "8%",
      left: "1%",
      textStyle: {
        color: COLOR_VIA
      }
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    xAxis: {
      axisLabel: {
        color: COLOR_VIA
      },
      type: "category",
      data: xdata
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: COLOR_VIA
      },
      splitLine: {
        lineStyle: {
          color: "#ffffff3b"
        }
      }
    },
    series: title.map((name, index) => {
      return {
        name,
        data: data[index],
        type: "bar",
        barWidth: 12,
        itemStyle: {
          borderRadius: [100, 100, 0, 0]
        }
      };
    })
  };
}
