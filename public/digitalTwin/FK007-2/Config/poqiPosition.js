/** 坡道的刚体坐标 */
var poQiCoordinate =  [
    {
        "name": "1号上坡",
        "width": 4.8,
        "depth": 20,
        "rotateDirection": "x",
        "rotationAngle": -22.5,
        "pos": {
            "position_x": -68.2,
            "position_y": 0.66,
            "position_z": 90.47
        }
    },
    {
        "name": "1号中段",
        "width": 4.8,
        "depth": 4.8,
        "rotateDirection": "x",
        "rotationAngle": 1,
        "pos": {
            "position_x": -68.2,
            "position_y": 2.05,
            "position_z": 102.7
        }
    },
    {
        "name": "1号下坡",
        "width": 4.8,
        "depth": 14.5,
        "rotateDirection": "x", 
        "rotationAngle": 18,
        "pos": {
            "position_x": -68.2,
            "position_y": 0.8,
            "position_z": 112.15
        }
    },
    {
        "name": "2号上坡",
        "width": 4.8,
        "depth": 20,
        "rotateDirection": "x",
        "rotationAngle": -22.5,
        "pos": {
            "position_x": -76.64,
            "position_y": 0.67,
            "position_z": 90.47
        }
    },
    {
        "name": "2号中段",
        "width": 4.8,
        "depth": 4.8,
        "rotateDirection": "x",
        "rotationAngle": 1,
        "pos": {
            "position_x": -76.64,
            "position_y": 2.05,
            "position_z": 102.7
        }
    },
    {
        "name": "2号下坡",
        "width": 4.8,
        "depth": 14.5,
        "rotateDirection": "x", 
        "rotationAngle": 18,
        "pos": {
            "position_x": -76.64,
            "position_y": 0.8,
            "position_z": 112.15
        }
    },
    {
        "name": "3号上坡",
        "width": 4.8,
        "depth": 20,
        "rotateDirection": "x",
        "rotationAngle": -22.5,
        "pos": {
            "position_x": -85.09,
            "position_y": 0.65,
            "position_z": 90.07
        }
    },
    {
        "name": "3号中段",
        "width": 4.8,
        "depth": 4.8,
        "rotateDirection": "x",
        "rotationAngle": 1,
        "pos": {
            "position_x": -85.1,
            "position_y": 2.04,
            "position_z": 102.3
        }
    },
    {
        "name": "3号下坡",
        "width": 4.8,
        "depth": 14.5,
        "rotateDirection": "x", 
        "rotationAngle": 18,
        "pos": {
            "position_x": -85.09,
            "position_y": 0.79,
            "position_z": 111.75
        }
    },
    {
        "name": "4号上坡",
        "width": 4.8,
        "depth": 20,
        "rotateDirection": "x",
        "rotationAngle": -22.5,
        "pos": {
            "position_x": -93.35,
            "position_y": 0.65,
            "position_z": 90.07
        }
    },
    {
        "name": "4号中段",
        "width": 4.8,
        "depth": 4.8,
        "rotateDirection": "x",
        "rotationAngle": 1,
        "pos": {
            "position_x": -93.35,
            "position_y": 2.04,
            "position_z": 102.3
        }
    },
    {
        "name": "4号下坡",
        "width": 4.8,
        "depth": 14.5,
        "rotateDirection": "x", 
        "rotationAngle": 18,
        "pos": {
            "position_x": -93.35,
            "position_y": 0.79,
            "position_z": 111.75
        }
    }
];


/** 坡道盒子 */
var poQiBoxCoordinate = [
    {
        "name": "1号坡道",
        "width": 6,
        "height": 60,
        "depth": 46,
        "pos": {
            "position_x": -68,
            "position_y": 0,
            "position_z": 96.5
        }
    },
    {
        "name": "2号坡道",
        "width": 6,
        "height": 60,
        "depth": 46,
        "pos": {
            "position_x": -76.5,
            "position_y": 0,
            "position_z": 96.5
        }
    },
    {
        "name": "3号坡道",
        "width": 6,
        "height": 60,
        "depth": 46,
        "pos": {
            "position_x": -85,
            "position_y": 0,
            "position_z": 96.5
        }
    },
    {
        "name": "4号坡道",
        "width": 6,
        "height": 60,
        "depth": 46,
        "pos": {
            "position_x": -93.5,
            "position_y": 0,
            "position_z": 96.5
        }
    }
];


// 上下坡检测触发器
var poQiTriggerCoordinate =  [
    {
        "remark": "1号上坡触发器",
        "name": "shangpo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -68,
            "position_y": 0,
            "position_z": 78.67
        }
    },
    {
        "remark": "1号下坡触发器",
        "name": "xiapo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -68.34,
            "position_y": 0,
            "position_z": 122
        }
    },
    {
        "remark": "2号上坡触发器",
        "name": "shangpo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -76.5,
            "position_y": 0,
            "position_z": 78.67
        }
    },
    {
        "remark": "2号下坡触发器",
        "name": "xiapo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -76.6,
            "position_y": 0,
            "position_z": 122
        }
    },
    {
        "remark": "3号上坡触发器",
        "name": "shangpo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -85,
            "position_y": 0,
            "position_z": 78.67
        }
    },
    {
        "remark": "3号下坡触发器",
        "name": "xiapo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -85,
            "position_y": 0,
            "position_z": 122
        }
    },
    {
        "remark": "4号上坡触发器",
        "name": "shangpo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -93.5,
            "position_y": 0,
            "position_z": 78.67
        }
    },
    {
        "remark": "4号下坡触发器",
        "name": "xiapo",
        "width": 2,
        "height": 6,
        "depth": 5,
        "pos": {
            "position_x": -93.5,
            "position_y": 0,
            "position_z": 122
        }
    }
];