数字孪生3D部分的一些帮助说明

修改环境：
    contatns.js文件中的env，目前是改变获取的websocket协议
开启日志：
    debug = true

文件说明：
    config：
        areaPosition.js 照相机在3D内的坐标，建议后期入库
        carStateImg.js 车辆状态的一些图片
        contants.js 一些默认值以及相关配置具体查看文件内部注释
        monitor.js 监控设备在3D内的坐标，建议后期入库
        subjectName.js 扣分代码获取对应的项目
        uiPosition.js 考试区域内的图片的UI图片地址以及在3D内的坐标
    css :
        3D内的一些样式
    image:
        3D内的相关图片
    threejs：
        3D主框架代码
    WuYao：
        模型存放位置
    js：
        引入的js

图标跳动频率，需要修改wuyao.css下的名为imgDiv_jump的class

扣分的图标的显示事件修改contatns.js下的deductMsgTime属性

对应的场景模型文件用对应的 考场编码-科目 命名一个文件夹并且放在digitalTwin文件夹下 场景名字固定为Scene.FBX
对应的车辆模型文件在上述考试场景下命名一个车型文件夹，
例如：
    创建C1文件夹，并将对应的C1车模型放入该文件夹下，命名固定为Car.FBX 
    创建C2文件夹，并将对应的C2车模型放入该文件夹下，命名固定为Car.FBX 
    

旋转动画的一些设置项：
    const LINEARNONE= "TWEEN.Easing.Linear.None"; // 线性过渡，即匀速动画。
    const QUADRATICIN= "TWEEN.Easing.Quadratic.In"; // 二次方的缓入动画。
    const QUADRATICOUT= "TWEEN.Easing.Quadratic.Out"; // 二次方的缓出动画。
    const QUADRATICINOUT= "TWEEN.Easing.Quadratic.InOut"; // 二次方的缓入缓出动画。
    const CUBICIN= "TWEEN.Easing.Cubic.In"; // 三次方的缓入动画。
    const CUBICOUT= "TWEEN.Easing.Cubic.Out"; // 三次方的缓出动画。
    const CUBICINOUT= "TWEEN.Easing.Cubic.InOut"; // 三次方的缓入缓出动画。
    const EXPONENTIALIN = "TWEEN.Easing.Exponential.In"; // 指数形式的缓入动画。
    const EXPONENTIALOUT = "TWEEN.Easing.Exponential.Out"; // 指数形式的缓出动画。
    const EXPONENTIALINOUT = "TWEEN.Easing.Exponential.InOut"; // 指数形式的缓入缓出动画。
    const BOUNCEIN = "TWEEN.Easing.Bounce.In"; // 反弹效果的缓入动画。
    const BOUNCEOUT = "TWEEN.Easing.Bounce.Out"; // 反弹效果的缓出动画。
    const BOUNCEINOUT = "TWEEN.Easing.Bounce.InOut"; // 反弹效果的缓入缓出动画。
    const ELASTICIN = "TWEEN.Easing.Elastic.In"; // 弹性效果的缓入动画。
    const ELASTICOUT = "TWEEN.Easing.Elastic.Out"; // 弹性效果的缓出动画。
    const ELASTICINOUT = "TWEEN.Easing.Elastic.InOut"; // 弹性效果的缓入缓出动画。