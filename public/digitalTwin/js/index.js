import * as THREE from 'three'
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import Stats from 'three/addons/libs/stats.module.js';//Stats性能监视器
//  引入GUI js库
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as TWEEN from 'three/addons/libs/tween.module.js';

import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

// import * as CANNON from 'three/addons/cannon/cannon-es.js';
// import CannonDebugger from 'three/addons/cannon/cannon-es-debugger.js';

/**
 * author ： jx
 * description : digitalTwin3D
 */


var tempZ = "-90.89";


// 定义车模型、场景模型
let camera, controls, scene, labelRenderer, D3Render, tooltipContainer,
    followCar, sceneModel, scenePzModel, mesh_test, rigidBody,
    stats, renderer, clock, curCategory, trackPlaybackCar, sceneCenterMesh;
var boundaryBox;// 边界盒子
var poQiBoundaryBoxs = [];// 坡起边界盒子
var lineArray = []; // 科目三线路
var examAreaDataArray;// 考试区域数据
// 存储加载完成的模型

var examAreaCode = "FK001-2";//考试场地唯一码


const models = [];
const loader = new FBXLoader();// FBX模型加载器
const gltfLoader = new GLTFLoader();
var isGenSui = false;// 是否跟随 true 跟随
// 一个旋转方向的四元数
const ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
// 常量
const DISABLE_DEACTIVATION = 4;
var allBuildListArray = [];
var buildMap = new Map();
var buildStateMap = new Map();
var needFlyBuild = [];
var separateBuildState = true;// 记录每次点击操作动作的状态，上次动作未结束不允许进行下一次动作
var composer;
var outlinePass;

// 物理世界的一些变量r
var world;

var mainBuild = [];

// 一些默认材质
var materialDynamic =
    new THREE.MeshPhongMaterial({
        color: 0xfca400
    });
var materialStatic =
    new THREE.MeshPhongMaterial({
        color: 0x99999,
        transparent: true,
        opacity: 0
    });
var materialInteractive =
    new THREE.MeshPhongMaterial({ color: 0x990000 });
var materialRed =
    new THREE.MeshPhongMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0
    });
var materialGreen =
    new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0
    });
const common_material = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    wireframe: true,
    transparent: true,
    opacity: 0
});

var highlightMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
var defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

var gui;
// GUI控制器
if (debug) {

    gui = new GUI();

    //  定义gui控制器的位置或样式
    gui.domElement.style.right = '20px';
    gui.domElement.style.width = '200px';
    gui.domElement.style.top = '50px';

    const obj = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj, 'bool').name('显示场景').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "init",
            "examAreaCode": "FK001-2"
        };
        switchParam(obj);
    });


    const obj4 = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj4, 'bool').name('科目二大楼').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "changeView",
            "buildName": "ZhuTi01",
        };
        switchParam(obj);
    });

    const obj2 = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj2, 'bool').name('科目二候考室').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "changeView",
            "buildName": "ZhuTi01",
            "floor": "1",
            "roomName": "KeErHouKaoShi"
        };
        switchParam(obj);
    });

    const obj7 = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj7, 'bool').name('理论候考室大楼').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "changeView",
            "buildName": "ZhuTi02",
        };
        switchParam(obj);
    });

    const obj5 = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj5, 'bool').name('一楼理论自助考试区').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "changeView",
            "buildName": "ZhuTi02",
            "floor": "1",
            "roomName": "LiLunZiZhuKaoShiQu"
        };
        switchParam(obj);
    });


    const obj11 = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj11, 'bool').name('一楼C5理论候考室').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "changeView",
            "buildName": "ZhuTi02",
            "floor": "1",
            "roomName": "CWuKaoShiQu"
        };
        switchParam(obj);
    });

    const obj12 = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj12, 'bool').name('二楼理论考试区').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "changeView",
            "buildName": "ZhuTi02",
            "floor": "2",
            "roomName": "ErLouLiLunKaoShiQu"
        };
        switchParam(obj);
    });


    const obj8 = {
        bool: false,
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj8, 'bool').name('退出').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;

        var obj = {
            "type": "changeView",
            "buildName": "init",
        };
        switchParam(obj);


    });


}

/**
 * 重要！！！
 * 重要！！！
 * 重要！！！
 * 模型的名称一定要和模型的同事商量好采用 项目名_考场名_科目_楼栋名_层数(01代表一层以此类推 01,02)_层内物体(也可能是设备序号，预警使用)
 */
function MeshNameSplit(mesh) {

    if (mesh.name.indexOf("ZhuTi") > 0 && mesh.name.split("_").length == 5) { //代表楼层

        allBuildListArray.push(mesh);
        var meshName = interceptStr(mesh.name, "_", 3);
        buildMap.set(meshName, mesh.position.y);
        buildStateMap.set(meshName, "off");
    }


}


function interceptStr(str, ele, index) {
    let num = str.indexOf(ele) + 1;
    if (index <= 1) {
        str = str.substring(num);
        return str
    };
    str = str.substring(num);
    index--;
    return interceptStr(str, ele, index);
};


/**
 * 
 * @param {楼栋名称} buildName 
 * @param {显示第几层} showFloor 
 * @param {开或关，On是开启 off是关闭} offOn 
 */
function separateBuild(buildName, showFloor, offOn, roomName, clickFloorName) {

    var appointBuildFloorArray = [];
    allBuildListArray.forEach(ele => {

        if (ele.name.indexOf(buildName) > -1) {
            appointBuildFloorArray.push(ele);
        }

    })

    if (showFloor >= appointBuildFloorArray.length) {
        console.log("超出总楼层...");
    } else {

        for (let index = 0; index < appointBuildFloorArray.length; index++) {
            var floorName = appointBuildFloorArray[index].name;
            var h = (floorName.split("_")[4] - 1) * 300;
            var positionY = appointBuildFloorArray[index].position.y;
            var pos = new THREE.Vector3(appointBuildFloorArray[index].position.x, positionY + h, appointBuildFloorArray[index].position.z);
            buildStateMap.set(buildName + "_" + floorName.split("_")[4], "on");

            separateBuildTween(appointBuildFloorArray[index], pos, cameraPositionSet, roomName, clickFloorName);

        }
        // appointBuildFloorArray.forEach(ele => {

        // var floor = parseInt(ele.name.split("_")[4]);

        // if (floor > showFloor) {
        //     if (offOn == "on") {
        //         var positionY = ele.position.y;
        //         var pos = new THREE.Vector3(ele.position.x, positionY + 300, ele.position.z);
        //         buildStateMap.set(buildName + "_" + showFloor, "on");
        //         separateBuildTween(ele, pos, cameraPositionSet, roomName);
        //         // separateBuildTween(ele, pos);
        //     } else {

        //         buildStateMap.set(buildName + "_" + showFloor, "off");
        //         var eleName = interceptStr(ele.name, "_", 3);
        //         var buildOrginalPosY = buildMap.get(eleName);
        //         // var pos = new THREE.Vector3(ele.position.x, ele.position.y - 2800, ele.position.z);
        //         var pos = new THREE.Vector3(ele.position.x, buildOrginalPosY, ele.position.z);
        //         separateBuildTween(ele, pos);
        //     }
        // }

        // })
    }

}

function mergeBuild(buildName, showFloor) {
    var appointBuildFloorArray = [];
    allBuildListArray.forEach(ele => {

        if (ele.name.indexOf(buildName) > -1) {
            appointBuildFloorArray.push(ele);
            ele.visible = true;
        }

    })
    if (showFloor >= appointBuildFloorArray.length) {
        console.log("超出总楼层...");
    } else {

        for (let index = 0; index < appointBuildFloorArray.length; index++) {
            var floorName = appointBuildFloorArray[index].name;
            var h = (floorName.split("_")[4] - 1) * 300;
            var positionY = appointBuildFloorArray[index].position.y;
            var pos = new THREE.Vector3(appointBuildFloorArray[index].position.x, positionY - h, appointBuildFloorArray[index].position.z);
            buildStateMap.set(buildName + "_" + floorName.split("_")[4], "off");

            separateBuildTween(appointBuildFloorArray[index], pos, null, null, null, true);

        }
    }
}

// 监听交互
listenMsg();

function init() {


    initGraphics();         // 初始化场景基本信息
    // initPhysics();          // 初始化物理世界
    // initSkyBox();           // 初始化天空盒
    if (debug) {
        // materializationPhysics();           // 物理世界实体化
    }

    // console.log("scene.background", scene);
    // scene.background = new THREE.Color(0x000000); // 黑色背景

}

var mouseDown = false, offsetX = 15, offsetY = 20, offsetZ = 15;

// 鼠标按下
function onMouseDown(event) {

    if (event.button === 0) {
        mouseDown = true;
        // setTimeout(() => {// 防止点击事件冲突
        //     event.target.click();
        // }, 1000);
    }
}

// 鼠标放开
function onMouseUp(event) {

    mouseDown = false;

    if (followCar && isGenSui) {

        // 修改鼠标转动之后相机和车辆模型的偏移量，为了重新设置旋转过后相机的位置
        offsetX = - (camera.position.x - followCar.position.x);
        // offsetY = (camera.position.y - followCar.position.y);
        offsetZ = - (camera.position.z - followCar.position.z);

        // console.log("offsetX", offsetX);
        // console.log("offsetY", offsetY);
        // console.log("offsetZ", offsetZ);
        // console.log("camera.position", camera.position);
    }

}

// 监听鼠标事件
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);

var animationOver = false;// 动画结束标识
var animationState = false;// 过度动画播放状态
var tempQuat;
// 设置固定的距离值
var cameraToCarDistance = 30;
function render() {


    stats.update(); //帧率显示

    // Update the CannonDebugger meshes
    // cannonDebugger.update();

    // testBoxBody.position.x += 0.01;

    renderer.render(scene, camera);//周期性执行相机的渲染功能，更新canvas画布上的内容
    composer.render();

    labelRenderer.render(scene, camera);// 2D渲染
    D3Render.render(scene, camera);// 3D渲染

    // 处于动画运动状态，不做视角的改变防止射线获取异常
    // console.log("animationState", animationState);
    if (!animationState) {
        updateControlsTarget();
    }

    // 过渡动画渲染
    TWEEN.update();

    // requestAnimationFrame(render);

    // console.log("执行中......");
}


// 初始化几何体相关
function initGraphics() {
    //  创建一个三维场景scene
    scene = new THREE.Scene();
    window.scene = scene;

    clock = new THREE.Clock();//创建一个时钟对象
    /**
     * 渲染器设置
     */
    // 实例化渲染器
    renderer = new THREE.WebGL1Renderer({
        antialias: true, // 开启抗锯齿功能，可以让渲染的图像边缘更加平滑，但这可能会在性能上带来一些损耗。
        alpha: true,// 设置对数深度缓冲区，优化深度冲突问题
        logarithmicDepthBuffer: true, // 启用对数深度缓冲区，这在处理远程物体时能够更好地优化深度冲突问题。它可以提供更好的深度排序和渲染效果。
        preserveDrawingBuffer: true // 启用保留绘制缓冲区，可以在渲染后将画布内容保存为图像。这对于截屏或者实现类似"保存为图片"的功能非常有用。
    });
    renderer.setPixelRatio(window.devicePixelRatio); // 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.domElement.pointerEvents = 'none';
    // // 设置Canvas的CSS样式，将其层级设置为较低的值
    // renderer.domElement.style.position = 'relative';
    // renderer.domElement.style.zIndex = '0';


    // 设置场景背景色的alpha通道值为0 透明背景
    renderer.setClearColor(0x000000, 0);

    //  canvas画布添加到网页页面
    document.body.appendChild(renderer.domElement);

    //创建stats对象 显示帧率
    stats = new Stats();
    //stats.domElement:web页面上输出计算结果，一个div元素
    if (debug) {
        document.body.appendChild(stats.domElement);
    }

    /**
     * 相机设置
     */
    //  定义相机输出画布的尺寸（单位：像素px）
    const width = window.innerWidth;
    const height = window.innerHeight;

    //  设置相机的四个参数
    //  创建一个透视投影相机对象
    //  30:视场角度；width / height:Canvas画布宽高比；1：近裁截面 3000：远裁截面
    camera = new THREE.PerspectiveCamera(50, width / height, 0.002, 2000);
    // camera = new THREE.PerspectiveCamera(60, width / height, 0.2, 2000);

    // 高光
    composer = new EffectComposer(renderer);
    var renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);


    // 物体边缘发光通道
    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);


    /**
     * 相机控件轨道控制器
     */
    //  设置相机控件轨道控制器OrbitControls

    controls = new OrbitControls(camera, renderer.domElement);
    // 设置平移范围
    // controls.minPan = new THREE.Vector2(-100, -100);
    // controls.maxPan = new THREE.Vector2(100, 100);

    controls.update();


    // 初始化相机位置为90度俯视角
    cameraPositionSet("indexInit", "", sceneCenterMesh);
    if (debug) {
        const cameraFolder = gui.addFolder('相机');
        // cameraFolder.close();
        cameraFolder.add(camera.position, 'x', -1500, 1500).name("相机角度X轴").step(0.1);
        cameraFolder.add(camera.position, 'y', -1500, 1500).name("相机角度Y轴").step(0.1);
        cameraFolder.add(camera.position, 'z', -1500, 1500).name("相机角度Z轴").step(0.1);
        cameraFolder.add(camera.rotation, 'x', -10, 10).name("相机旋转X轴").step(0.00001);
        cameraFolder.add(camera.rotation, 'y', -10, 10).name("相机角度Y轴").step(0.00001);
        cameraFolder.add(camera.rotation, 'z', -10, 10).name("相机角度Z轴").step(0.00001);
    }



    // scene.add(camera);

    // const cameraHelper = new THREE.CameraHelper( camera );
    // scene.add( cameraHelper );

    //  添加一个环境光 
    const ambient = new THREE.AmbientLight(0xffffff, 10);//颜色 亮度
    scene.add(ambient);

    // scene.background = null;

    // 创建一个三维坐标轴
    const axesHelper = new THREE.AxesHelper(300);
    if (debug) {
        scene.add(axesHelper);//添加三维坐标轴到场景中
    }
    // initAddExamAreaUI();
    init2DRenderer();
    initD3();

    // 事件监听
    window.addEventListener('resize', onWindowResize, false);
}

// 窗口自适应
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// 初始化2D渲染器
function init2DRenderer() {
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';// 阻止当前dom的所有触发事件
    labelRenderer.domElement.className = 'labelDiv';
    document.body.appendChild(labelRenderer.domElement);

}

function initD3() {
    // 创建一个CSS3渲染器CSS3DRenderer
    D3Render = new CSS3DRenderer();
    D3Render.setSize(window.innerWidth, window.innerHeight);
    // HTML标签<div id="tag"></div>外面父元素叠加到canvas画布上且重合
    D3Render.domElement.style.position = "absolute";
    D3Render.domElement.style.top = "0px";
    //设置.pointerEvents=none，解决HTML元素标签对threejs canvas画布鼠标事件的遮挡
    D3Render.domElement.style.pointerEvents = "none";
    labelRenderer.domElement.className = 'labelD3Div';
    // const containerDom = document.getElementById(this.id);
    document.body.appendChild(D3Render.domElement);
}

// 初始化天空盒
function initSkyBox() {
    // // 创建天空球
    // const skyGeometry = new THREE.SphereGeometry(1000, 100, 100);
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('./common/skyBox/skybox.png', function (textur) {
        textur.encoding = THREE.sRGBEncoding; // 设置颜色空间为sRGB
    });

    // 设置纹理的重复属性以实现平铺效果
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(1, 1); // 设置横向和纵向的重复次数，这里设置为横向和纵向各重复4次


    scene.background = texture;

    // const skyMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    // // const skyMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./common/skyBox/skybox.png'), side: THREE.DoubleSide });
    // const sky = new THREE.Mesh(skyGeometry, skyMaterial);

    // // 将天空球添加到场景
    // scene.add(sky);

}



// 初始化鼠标视角控制器
function initControls() {

    updateControlsTarget();

    // 创建 Tween 动画
    const rotationDamping = { x: 0, y: 0, z: 0 }; // 初始阻尼值
    const targetDamping = { x: 0.5, y: 0.5, z: 0.5 }; // 目标阻尼值
    const tween = new TWEEN.Tween(rotationDamping).to(targetDamping, 3000); // 设置动画时长为3秒
    tween.onUpdate(() => {
        controls.rotateSpeed = rotationDamping.x; // 将阻尼值应用到旋转控制器的速度属性上
    });
    tween.start();

    camera.up.set(0, 1, 0); // 使用左手坐标系时，将 up 向量设置为 (0, 1, 0)

    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.maxDistance = maxDistances;// 缩放最大距离
    // controls.minDistance = minDistances;// 缩放最小距离

    // console.log("camera.position.y",camera.position.y);
    controls.enableDamping = true;
    controls.dampingFactor = 0.3;

    controls.zoomSpeed = 0.2;// 缩放阻尼

    // 你能够垂直旋转的角度的上限，范围是0到Math.PI，其默认值为Math.PI。
    controls.maxPolarAngle = Math.PI / 2.1;

    // controls.enableRotate = true;


    //  如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
    controls.addEventListener('change', function () {

        // console.log("controls.target", controls.target);

        // viewLimit();

    });//监听鼠标、键盘事件

}



function viewLimit() {

    // const scale = controls.scale;
    // console.log("scale", scale);
    if (boundaryBox) {

        // 检查相机位置是否超出边界
        const cameraPosition = camera.position.clone();
        // const cameraRotation = camera.rotation.clone();

        if (boundaryBox.containsPoint(cameraPosition)) {// 判断相机翻转，不允许翻转

            controls.saveState();
        } else {
            console.log("相机出界了");
            // 将相机位置限制在边界范围内
            cameraPosition.clamp(boundaryBox.min, boundaryBox.max);
            camera.position.copy(cameraPosition);
            // camera.rotation.set(-1.580795325373094,cameraRotation.y,cameraRotation.z);
            controls.reset();
        }
    }

}


// 更新鼠标转动控制器所对方向
function updateControlsTarget(obj) {

    if (obj) {
        controls.target = obj.position;
        controls.update();
    } else {
        if (sceneModel) {

            // 创建射线对象Ray
            const raycaster = new THREE.Raycaster();
            // 创建射线可视化对象
            // const rayVisual = new THREE.Line();

            // console.log("camera.position", camera.position);
            const origin = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

            // console.log("camera", camera);
            // 获取相机的方向向量
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            // console.log("cameraDirection.x, cameraDirection.y, cameraDirection.z", cameraDirection.x, cameraDirection.y, cameraDirection.z);
            const direction = new THREE.Vector3(cameraDirection.x, cameraDirection.y, cameraDirection.z).normalize();

            // 设置射线起点
            raycaster.ray.origin = origin;
            raycaster.ray.direction = direction;

            // console.log("direction", direction);

            // 计算射线与模型的相交
            const intersects = raycaster.intersectObject(sceneModel, true);

            // console.log("intersects", intersects);

            if (intersects && intersects.length > 0) {
                if (intersects[intersects.length - 1]) {
                    const targetPosition = intersects[intersects.length - 1].point;

                    // console.log(targetPosition);

                    controls.target = targetPosition;
                    controls.update();
                }
            }

        }
    }
}

/**
 * 获得目标位置
 */
function getTargets() {
    if (sceneModel) {

        // 创建射线对象Ray
        const raycaster = new THREE.Raycaster();
        // 创建射线可视化对象
        // const rayVisual = new THREE.Line();

        // console.log("camera.position", camera.position);
        const origin = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

        // console.log("camera", camera);
        // 获取相机的方向向量
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        // console.log("cameraDirection.x, cameraDirection.y, cameraDirection.z", cameraDirection.x, cameraDirection.y, cameraDirection.z);
        const direction = new THREE.Vector3(cameraDirection.x, cameraDirection.y, cameraDirection.z).normalize();

        // 设置射线起点
        raycaster.ray.origin = origin;
        raycaster.ray.direction = direction;

        // console.log("direction", direction);

        // 计算射线与模型的相交
        const intersects = raycaster.intersectObject(sceneModel, true);

        // console.log("intersects", intersects);

        if (intersects && intersects.length > 0) {
            if (intersects[intersects.length - 1]) {
                const targetPosition = intersects[intersects.length - 1].point;

                // console.log(targetPosition);

                return targetPosition;
            }
        }

    }
}

/**
 * 创建切换坐标动画
 * @param {跳转到的x坐标} x 
 * @param {跳转到的y坐标} y 
 * @param {跳转到的z坐标} z 
 * @param {过渡动画时间} time 
 * @param {逻辑判断一些类型} type 
 * @returns 
 */
function createTween(x, y, z, time, type, obj, quat, targetPos) {


    // 创建一个Tween对象用于过渡动画
    var tween = new TWEEN.Tween(camera.position)
        .to({ x: x, y: y, z: z }, time) // 设定最终的位置和过渡时间
        .easing(TWEEN.Easing.Linear.None) // 设定缓动函数
        .onUpdate(function (obj) { // 动画更新时的回调函数

            // 锁定视角
            if (targetPos) {
                // const targetPosition = new THREE.Vector3(targetPos.pos.position_x, targetPos.pos.position_y, targetPos.pos.position_z);
                // 计算初始方向向量
                // const direction = targetPosition.clone().sub(camera.position).normalize();
                // 将目标位置稍微延伸一点，避免立方体直接朝向目标位置
                // const extendedTargetPosition = targetPosition.clone().add(direction.clone().multiplyScalar(0.1));

                camera.lookAt(targetPos.pos.position_x, targetPos.pos.position_y, targetPos.pos.position_z);
                // controls.target = new THREE.Vector3(targetPos.pos.position_x, targetPos.pos.position_y, targetPos.pos.position_z);
            }

            controls.enabled = false; // 启用或禁用OrbitControls false 禁用

        }).onStart(function () {

            // 锁定视角
            if (targetPos) {
                camera.lookAt(targetPos.pos.position_x, targetPos.pos.position_y, targetPos.pos.position_z);
                // controls.target = new THREE.Vector3(targetPos.pos.position_x, targetPos.pos.position_y, targetPos.pos.position_z);
            }
            animationState = true;
        }).onComplete(function () {// 过渡动画结束时的回调函数
            // 动画结束标识

            animationState = false;
            controls.enabled = true; // 启用或禁用OrbitControls true 启用
            switch (type) {
                case "car":

                    animationOver = true;
                    // 在 Tween 运动完成时执行的操作
                    // console.log('Tween 完成');

                    break;
                default:
                    // updateControlsTarget(obj);
                    break;
            }

        });

    return tween;
}


// 定义一个函数，接受一个 JSON 对象和一个 key 字符串（可以是多层嵌套的，用点号分隔）
function getValueByNestedKey(jsonObject, nestedKey) {
    // 将嵌套的 key 字符串拆分成数组
    const keys = nestedKey.split('.');

    // 逐层访问 JSON 对象
    let result = jsonObject;
    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];

        // 检查当前 key 是否存在于 JSON 对象中
        if (result.hasOwnProperty(currentKey)) {
            // 更新 result 为当前 key 对应的值
            result = result[currentKey];
        } else {
            // 如果 key 不存在，可以返回一个默认值或者抛出一个错误，视情况而定
            return null;
        }
    }

    // 返回最终的值
    return result;
}


function getMeshByName(scene, name) {

    return scene.getObjectByName(name);
}

// 判断网格模型数组中是否包含名为name的网格模型
function containsMeshWithName(meshes, name) {
    if (name && meshes.length > 0) {
        for (var i = 0; i < meshes.length; i++) {
            if (meshes[i] && meshes[i].name === name) {
                return meshes[i];
            }
        }
    }
    return null;
}

// 判断Map对象中是否包含某个网格对象
function containsMeshByName(map, name) {
    if (name && map) {
        for (let [mesh, value] of map) {
            if (mesh.name === name) {
                return true;
            }
        }
    }
    return false;
}


/** 通用以及一些工具类 begin */
// 标签通用跳转，根据传入参数判断
function commonClick(_this, name, obj, isQuanJing) {

    var bakParam = backExamType(name);
    var arr = name.split("__");
    if (bakParam == "area") {   // 跳转考试区域

        // jumpIcon(_this);
        cameraPositionSet(arr[0], arr[1], obj, isQuanJing);

    } else if (bakParam == "carState") {    // 跳转车辆详情

        // 给UI推送消息
        top.webglMessagePort.postMessage(arr[1]);

        perspectiveFollowing(arr[1]);
        // 跳转左侧详情页面 通过下面的方法发送

    } else if (bakParam == "personal") {    // 跳转考生详情

        // 给UI推送消息
        top.webglMessagePort.postMessage(arr[1]);
    } else if (bakParam == "monitor") {     // 跳转监控详情

        // jumpIcon(_this);
        // 给UI推送消息
        top.webglMessagePort.postMessage(arr[1]);
        cameraPositionSet(arr[1], null, obj, isQuanJing);
    }

}

/**
 * 相机位置初始化设置
 * @param {配置文件中的key} type 
 * @param {配置文件中可能存在的二级key} number 
 * @param {3D模型对象} obj 
 * 在areaPosition.json文件中具体查看，coordinate来自areaPosition
 * 示例及字段释义：
 * type = daoku/poqi/cefang/quxian/zhijiao/init（初始化重置位置）等为必填 也有可能是监控设备的视频序号
 * number = 具体倒库/坡起/侧方/曲线/直角的编号
 * obj = 目标对象 里面有一些对应的坐标以及角度 可能用不到
 * isQuanJing = 是否全景
 */
function cameraPositionSet(type, number, obj, isQuanJing, time) {

    // controls.reset();
    var tm = 1000;
    if (time) {
        tm = time
    }

    isGenSui = false;

    var positionObj;
    // console.log(getValueByNestedKey(coordinate,type + "." + number));
    // 获得要跳转的目标坐标
    if (!number) {
        positionObj = getValueByNestedKey(coordinate, type);
    } else {
        positionObj = getValueByNestedKey(coordinate, type + "." + number);
    }

    if (positionObj) {



        // 初始化第一获取到的协议角度
        // var euler = new THREE.Euler(positionObj.rotation_x, positionObj.rotation_y, positionObj.rotation_z, 'XYZ'); // 使用字符串表示旋转顺序
        // const quat = new THREE.Quaternion();
        // quat.setFromEuler(euler);
        var targetPos = null;
        if (number) {
            targetPos = uiCoordinate.find(obj => obj.number.includes(number));
        } else if (type) {
            targetPos = getValueByNestedKey(uiMonitor, type);
        }


        // 临时处理 全景跳转使用动画有异常，跳转全景设备先不使用过度动画
        if (isQuanJing) {
            camera.position.set(positionObj.position_x, positionObj.position_y, positionObj.position_z);
        } else {
            // 创建过渡动画
            var tween = createTween(
                positionObj.position_x,
                positionObj.position_y,
                positionObj.position_z,
                tm,
                null,
                obj,
                null,
                targetPos
            );


            tween.start(); // 开始动画
        }

        //  设置相机的位置
        camera.rotation.set(positionObj.rotation_x, positionObj.rotation_y, positionObj.rotation_z);

        return positionObj.position_y;

    } else {

        console.log("未配置此项坐标：" + type + "." + number);
        if (debug) {
            // alert("未配置此项坐标：" + type + "." + number);
        }

    }

    return '';
}


/**
 * 鼠标放上显示标签
 * @param {当前dom} _this 
 * @param {显示内容} word 
 * @param {宽度} width 
 * @param {距右} right
 */
function commonMouseover(_this, word, width, right) {

    // 先删除之前的元素
    removeEleByClassName(_this, "lable");

    // 创建一个容器元素
    tooltipContainer = document.createElement('div');

    // 设置容器的样式
    tooltipContainer.className = "lable";
    tooltipContainer.style.width = width;
    tooltipContainer.style.right = right;

    // 创建一个文字元素并添加到容器中
    var tooltipText = document.createElement('span');
    tooltipText.innerHTML = word;
    tooltipContainer.appendChild(tooltipText);

    _this.appendChild(tooltipContainer);

}

/**
 * 删除所有当前dom下某个指定的名为className的dom
 * @param {当前DOM} _this 
 * @param {删除的class名称} className 
 */
function removeEleByClassName(_this, className) {
    // 获取元素下所有具有特定类名的子元素
    var elementsToRemove = _this.getElementsByClassName(className); // 用你想要删除的类名替换 'yourClassName'

    // 将 HTMLCollection 转换为数组，以便于遍历并删除元素
    var elementsArray = Array.from(elementsToRemove);

    // 遍历数组并删除子元素
    elementsArray.forEach(function (element) {
        _this.removeChild(element);
    });
}

/**
 * 计算模型的长宽高
 * @param {模型} model 
 * @param {缩放比例} scale 
 */
function modelWHDCalculate(model, scale) {

    var obj = {};
    // 计算模型原始边界框
    var bbox = new THREE.Box3().setFromObject(model);

    // 获取缩放后的边界框
    var scaledBbox = bbox.clone().applyMatrix4(model.matrixWorld);

    // 获取缩放后的长宽高
    var width = Math.abs(scaledBbox.max.x - scaledBbox.min.x) * scale;
    var height = Math.abs(scaledBbox.max.y - scaledBbox.min.y) * scale;
    var depth = Math.abs(scaledBbox.max.z - scaledBbox.min.z) * scale;

    obj.width = width;
    obj.height = height;
    obj.depth = depth;

    return obj;
}

/**
 * 判断fromObj是否进入targetObjBox（目标包围盒）
 * @param {目标包围盒} targetObjBox 
 * @param {物体} fromObj 
 * @returns 
 */
function boundaryBoxContainObject(targetObjBox, fromObj) {

    var flag = false;
    // 获取物体的包围盒
    const objectBox = new THREE.Box3();
    objectBox.setFromObject(fromObj);

    for (const item of targetObjBox) {
        if (item.containsBox(objectBox)) {
            // console.log("在坡起范围内！");
            flag = true;
            break;
        }
        // console.log("不在坡起范围内！");
    }

    return flag;
}

/** 通用以及一些工具类 end */


/** 和前端交互的 通信方式 begin*/

function getVerticesFromModel(mesh) {
    var vertices = [];
    const positions = mesh.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const vertex = new CANNON.Vec3(positions[i] * 0.01, positions[i + 1] * 0.01, positions[i + 2] * 0.01);
        vertices.push(vertex);
    }


    // var geometry = mesh.geometry;
    // geometry.computeBoundingBox(); //计算边界盒子
    // geometry.computeVertexNormals(); //计算顶点法线

    // var positionAttribute = geometry.getAttribute('position');
    // for (var i = 0; i < positionAttribute.count; i++) {
    //     var vertex = new THREE.Vector3();
    //     vertex.fromBufferAttribute(positionAttribute, i);  // 提取顶点
    //     vertices.push(vertex);
    // }

    return vertices;
}

function getChildModels(object) {
    var childModels = [];

    object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            // 如果子节点是Mesh对象，则视为子模型
            childModels.push(child);
        }
    });

    return childModels;
}

function scaleChildModels(childModels, scale) {
    for (var i = 0; i < childModels.length; i++) {
        var child = childModels[i];
        child.scale.set(scale, scale, scale);
    }
}

function scaleVertices(vertices, scale) {
    for (var i = 0; i < vertices.length; i++) {
        vertices[i].multiplyScalar(scale);
    }
}


function separateBuildTween(mesh, pos, callback, roomName, clickFloorName, isMerge) {


    // camera.lookAt(0, 0, 0);

    // 创建Tween对象
    var tween = new TWEEN.Tween(mesh.position);

    // 设置建筑物分离动画的目标属性
    tween.to(pos, 1500);
    // 启动Tween动画
    tween.start();

    // setTimeout(() => {
    //     // 在动画完成的过程中执行特定操作
    //     if (callback && roomName) {
    //         callback(roomName);
    //     }
    // }, 1000);

    // 处理Tween动画的完成事件
    tween.onComplete(function () {
        console.log("建筑物分离动画完成！");

        if (!isMerge) {
            allBuildListArray.forEach(ele => {

                if (!(ele.name.indexOf(clickFloorName) > -1)) {
                    ele.visible = false;
                }

            });

            if (callback && roomName) {
                callback(roomName);
            }
            separateBuildState = true;
        }


    });

}

// 监听UI点击事件
function listenMsg() {
    window.id = top.message.length;

    top.message.push(
        function (msg) {
            // console.log("back msg : " + msg.data);
            console.log("window", window.id);
            if (msg.data) {


                switchParam(JSON.parse(msg.data));
            }
        }
    )

    top.webglMessagePort.onmessage = function (msg) {

        if (JSON.parse(msg.data).type === "init") {

            console.log("msg.data", msg.data);
            switchParam(JSON.parse(msg.data));

            return
        }

        for (let index = 0; index < top.message.length; index++) {
            top.message[index](msg);

        }
    };
}

var mainConfig;
// 监听传递的参数跳转对应的场景
async function switchParam(obj) {
    if (obj) {

        switch (obj.type) {

            case INIT:          // 初始化考试地点唯一编号，如果中转站中有多个考场的协议，要用此字段进行筛选

                if (obj.examAreaCode) {

                    examAreaCode = obj.examAreaCode;
                    // examAreaCode = "FK001-2";

                    var exist = checkFileExists(sceneIndexUrl.replace("EXAMAREACODE", examAreaCode));

                    if (exist) {
                        // 加载每个考试区域对应的私有文件
                        var scriptsToLoad = [
                            "./" + examAreaCode + "/Config/areaPosition.js",
                            "./" + examAreaCode + "/Config/imagePosition.js",
                            "./" + examAreaCode + "/Config/monitor.js",
                            "./" + examAreaCode + "/Config/uiPosition.js",
                            "./" + examAreaCode + "/Config/poqiPosition.js",
                            "./" + examAreaCode + "/Config/config.js",
                            "./" + examAreaCode + "/Config/line.js",
                        ];

                        console.log("examAreaCode", examAreaCode);
                        // 按需加载json文件
                        loadScripts(scriptsToLoad, function () {
                            // 外部JavaScript文件加载完成后执行的回调函数
                            // 在这里可以调用外部脚本中的函数或执行其他操作
                            console.log("examAreaCode_loadScripts", examAreaCode);
                            init();
                            // 加载场景模型
                            function loadModel() {
                                return new Promise(function (resolve, reject) {

                                    loader.load(sceneIndexUrl.replace("EXAMAREACODE", examAreaCode), (model) => {

                                        // 获取模型的长宽高
                                        // var modelWHDObj = modelWHDCalculate(model, 1);
                                        var modelWHDObj = modelWHDCalculate(model, 0.01);

                                        // model.scale.set(1, 1, 1);
                                        model.scale.set(0.01, 0.01, 0.01);
                                        // model.position.set(0, 0, 0);

                                        // if (debug) {
                                        //     const sceneFolder = gui.addFolder('场景模型');
                                        //     // sceneFolder.close();
                                        //     sceneFolder.add(model.position, 'x', -1500, 1500).name("模型X轴").step(1);
                                        //     sceneFolder.add(model.position, 'y', -1500, 1500).name("模型Y轴").step(1);
                                        //     sceneFolder.add(model.position, 'z', -1500, 1500).name("模型Z轴").step(1);
                                        // }


                                        model.rotation.set(0, 0, 0);
                                        model.name = "sceneMain";
                                        // console.log("model", model);
                                        models.push(model);

                                        // 计算模型的中心点
                                        const modelCenter = new THREE.Vector3();
                                        const box = new THREE.Box3();
                                        box.setFromObject(model); // 计算模型的包围盒
                                        box.getCenter(modelCenter); // 获取包围盒的中心点坐标

                                        /**
                                         * 获得场景的长宽
                                         */
                                        const geometry = new THREE.BoxGeometry(modelWHDObj.width + coordinate.sceneReserveWidthHeightDepth.width, coordinate.sceneReserveWidthHeightDepth.height, modelWHDObj.depth + coordinate.sceneReserveWidthHeightDepth.depth); // 长宽预留 
                                        const scene_box = new THREE.Mesh(geometry, common_material);
                                        // 位置手动设置是因为，在做模型的时候0,0位置以基站坐标为准所以，0,0点不是模型的中心点，需要手动设置便捷盒子所处的位置
                                        scene_box.position.set(modelCenter.x, coordinate.sceneCenter.position_y, modelCenter.z);
                                        // 创建场景边界盒子对象
                                        boundaryBox = new THREE.Box3().setFromObject(scene_box);

                                        // if (debug) {// 设置边界盒子的GUI
                                        //     const sceneFolder = gui.addFolder('边界盒子模型');
                                        //     // sceneFolder.close();
                                        //     sceneFolder.add(scene_box.position, 'x', -1500, 1500).name("模型X轴").step(1);
                                        //     sceneFolder.add(scene_box.position, 'y', -1500, 1500).name("模型Y轴").step(1);
                                        //     sceneFolder.add(scene_box.position, 'z', -1500, 1500).name("模型Z轴").step(1);
                                        // }

                                        scene.add(scene_box);

                                        // 场景中心添加一个盒子，用来作为场景中心点
                                        const sceneCenterGeometry = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3);
                                        const sceneCenterMaterial = new THREE.MeshBasicMaterial({
                                            color: 0xffffff,
                                            wireframe: true,
                                            transparent: true,
                                            opacity: 0
                                        });
                                        sceneCenterMesh = new THREE.Mesh(sceneCenterGeometry, sceneCenterMaterial);
                                        sceneCenterMesh.position.set(coordinate.curSceneCenter.position_x, 0, coordinate.curSceneCenter.position_z);

                                        // scene.add(box);
                                        // 将模型添加到场景中
                                        scene.add(sceneCenterMesh);


                                        scene.add(model);

                                        console.log("scene_model********", model);
                                        // 创建进入考场监管
                                        var divContainerElement = document.createElement('div');

                                        var buttonDivContainerElement = document.createElement('div');
                                        buttonDivContainerElement.className = "buttonDiv";
                                        var imgElement = document.createElement('img');
                                        imgElement.className = "inButton";
                                        imgElement.src = "./image/inButton.png";
                                        buttonDivContainerElement.append(imgElement);


                                        var spanElement = document.createElement('span');
                                        spanElement.innerHTML = "进入考场监管";
                                        spanElement.className = "inButtonSpan";
                                        buttonDivContainerElement.append(spanElement);


                                        var imgElement_Line = document.createElement('img');
                                        imgElement_Line.className = "middleLine_index";
                                        imgElement_Line.src = "./image/middleLine.png";
                                        divContainerElement.append(imgElement_Line);
                                        divContainerElement.append(buttonDivContainerElement);

                                        const divCSS2D = new CSS2DObject(divContainerElement);

                                        divCSS2D.position.set(modelCenter.x + 30, 30, modelCenter.z);

                                        scene.add(divCSS2D);

                                        // 鼠标点击事件
                                        divContainerElement.addEventListener('click', function (event) {

                                            var data = {
                                                "type": "router",
                                                "data": examAreaCode
                                            }

                                            top.webglMessagePort.postMessage(data);
                                        });

                                        // model.visible = false;
                                        resolve(models);

                                    }, (event) => {

                                        // 控制台打印加载进度
                                        console.log((event.loaded / event.total * 100) + '% loaded1');

                                        if (top.loadScene) {
                                            top.loadScene(event.loaded / event.total * 100);
                                        }


                                    }, (error) => {

                                        // 控制台打印加载失败
                                        console.error(error);


                                    });


                                })
                            }

                            //  模型加载完之后，可以获取模型对象
                            loadModel().then(function (model) {

                                model.forEach(ele => {
                                    if (ele.name == "sceneMain") {
                                        sceneModel = ele;

                                    }

                                    // 初始化楼层数组
                                    ele.children.forEach(eles => {
                                        if (eles.name.indexOf("ZhuTi") > -1 && eles.name.split("_").length == 4) {
                                            eles.children.forEach(floorEle => {
                                                MeshNameSplit(floorEle);
                                            })
                                        }

                                    })
                                })


                                // console.log("buildMap", buildMap);

                                // console.log("model", model);
                                initControls();


                                // 升级版渲染，浏览器即时切换也会运行
                                const fn = updateCanvas(() => { render() }, 1);
                                fn(fn);


                            });


                        });

                    } else {
                        alert("没有对应场景");
                    }

                }
                break;
            case CHANGEVIEW:


                var examCode = obj.examCode;
                var buildName = obj.buildName;
                var floor = obj.floor;
                var roomName = obj.roomName;

                if (buildName.indexOf("init") > -1) {

                    var posY = cameraPositionSet(buildName, null, null, null, 1000);

                    // 如果点击的是建筑，将其他未关闭的楼层关闭
                    buildStateMap.forEach((value, key) => {
                        if (value == "on") {
                            var build = key.split("_");
                            mergeBuild(build[0], build[1]);
                        }
                    })

                    allBuildListArray.forEach(ele => {

                        ele.visible = true;
                    })

                    var mainScene = scene.getObjectByName("sceneMain");

                    if (mainScene) {
                        mainScene.children.forEach(ele => {
                            ele.visible = true;
                        });

                    }
                } else {

                    // 每次动作必须等上次动作完成后进行
                    if (separateBuildState && examAreaCode == "FK001-2") {

                        separateBuildState = false;
                        setTimeout(() => {
                            separateBuildState = true;
                        }, 4000);// 不管有没有后续操作，2s后状态重置

                        var posY = cameraPositionSet(buildName, null, null, null, 1000);

                        if (floor) {
                            /**
                            * 隐藏除要看的楼层外的其他物体
                            */
                            if (buildName.indexOf("ZhuTi") > -1) {

                                // console.log("scene_*", scene);
                                var mainScene = scene.getObjectByName("sceneMain");

                                var modelNamePrefix = getValueByNestedKey(modelNamePreFix, examCode);
                                var mesh = scene.getObjectByName(modelNamePrefix + buildName);
                                var showBuild = [];
                                var showFloor = [];
                                for (let index = 1; index <= floor; index++) {
                                    showBuild.push(modelNamePrefix + buildName);
                                    showFloor.push(modelNamePrefix + buildName + "_" + index);

                                }
                                // console.log("showFloor", showFloor);

                                if (mainScene) {
                                    mainScene.children.forEach(ele => {
                                        // console.log("eleName", ele.name);
                                        if (!showBuild.includes(ele.name)) {
                                            ele.visible = false;
                                        } else {
                                            // console.log("ele_*********", ele);
                                        }
                                    });

                                }


                                var modelNamePrefix = getValueByNestedKey(modelNamePreFix, examCode);
                                var mesh = scene.getObjectByName(modelNamePrefix + buildName);
                                mesh.visible = true;


                                allBuildListArray.forEach(ele => {

                                    if (ele.name.indexOf(buildName) > -1) {
                                        ele.visible = true;
                                    } else {
                                        ele.visible = false;
                                    }

                                })

                            }

                            var isMerge = false;
                            // 如果点击的是建筑，将其他未关闭的楼层关闭
                            buildStateMap.forEach((value, key) => {
                                if (value == "on") {
                                    var build = key.split("_");
                                    mergeBuild(build[0], build[1]);
                                    isMerge = true;
                                }
                            })
                            if (isMerge) {
                                await sleep(2000);
                            }

                            // 判断当前点击的楼层是否和上次一样，如果一样并且只是切换房间，只做视角的切换不重新分离大楼
                            // 如何判断楼层是否一样，判断buildStateMap中对应的楼层是否是on，如果是on则说明点击的是同一层楼
                            if (buildStateMap.get(buildName + "_" + floor) == "on" && roomName) {
                                cameraPositionSet(roomName);
                            } else {
                                // 点击楼层跳转动画
                                if (camera.position.y == posY) {
                                    var buildState = buildStateMap.get(buildName + "_" + floor) == "off" ? "on" : "off";
                                    separateBuild(buildName, floor, buildState, roomName, buildName + "_" + floor);
                                } else {
                                    setTimeout(() => {

                                        var buildState = buildStateMap.get(buildName + "_" + floor) == "off" ? "on" : "off";
                                        separateBuild(buildName, floor, buildState, roomName, buildName + "_" + floor);
                                    }, 1000);
                                }

                            }


                        } else {

                            separateBuildState = true;

                            // console.log("scene_*", scene);
                            var mainScene = scene.getObjectByName("sceneMain");



                            if (mainScene) {
                                mainScene.children.forEach(ele => {
                                    // console.log("eleName", ele.name);
                                    if (!(ele.name.indexOf(buildName) > -1)) {
                                        ele.visible = false;
                                    }
                                });

                            }

                            var modelNamePrefix = getValueByNestedKey(modelNamePreFix, examCode);
                            var mesh = scene.getObjectByName(modelNamePrefix + buildName);
                            mesh.visible = true;

                            allBuildListArray.forEach(ele => {

                                if (ele.name.indexOf(buildName) > -1) {
                                    ele.visible = true;
                                } else {
                                    ele.visible = false;
                                }

                            })

                            // 如果点击的是建筑，将其他未关闭的楼层关闭
                            buildStateMap.forEach((value, key) => {
                                if (value == "on") {
                                    var build = key.split("_");
                                    mergeBuild(build[0], build[1]);
                                }
                            })
                        }

                    }




                    /**
                     * 高亮显示对应模型
                     */
                    // if (buildName.indexOf("ZhuTi") > -1) {

                    //     console.log("scene_*", scene);

                    //     var modelNamePrefix = getValueByNestedKey(modelNamePreFix, examCode);
                    //     var mesh = scene.getObjectByName(modelNamePrefix + buildName);

                    //     if (mesh) {
                    //         var selectedObjects = [];
                    //         mesh.traverse(function (object) {
                    //             if (object instanceof THREE.Mesh) {

                    //                 selectedObjects.push(object);
                    //             }
                    //         });

                    //         // outlinePass.selectedObjects = selectedObjects; // 指定要高亮的模型
                    //         outlinePass.selectedObjects = selectedObjects; // 指定要高亮的模型

                    //         // outlinePass.selectedObjects = [cube]; // 指定要高亮的模型
                    //         outlinePass.edgeStrength = 6 // 边框的亮度
                    //         outlinePass.edgeGlow = 1 // 光晕[0,1]
                    //         outlinePass.usePatternTexture = false // 是否使用父级的材质
                    //         outlinePass.edgeThickness = 4 // 边框宽度
                    //         outlinePass.downSampleRatio = 3 // 边框弯曲度
                    //         outlinePass.pulsePeriod = 1 // 呼吸闪烁的速度
                    //         outlinePass.visibleEdgeColor.set('#ffffff'); // 可见轮廓线颜色
                    //         // outlinePass.hiddenEdgeColor.set('#000000'); // 隐藏轮廓线颜色
                    //         // outlinePass.clear = true
                    //         composer.addPass(outlinePass);
                    //     }

                    // } else {

                    //     composer.batchRemovePass(composer.passes);

                    // }

                }


                break;
            default:
                console.log("请传入参数类型！");
        }

    } else {
        console.log("请传入操作的类目！");
    }
}

/** 和前端交互的 通信方式 end*/


// 解决切换屏幕车辆翻滚的问题，因为渲染的问题，车辆突然出现造成车辆与刚体的碰撞，从而引发物理效果，解决方案是屏幕切换了也正常运行render函数
function updateCanvas(callback, ms) {
    let timer, animation;
    return function (run) {
        clearTimeout(timer);
        cancelAnimationFrame(animation);

        callback();

        timer = setTimeout(run, ms, run);

        animation = window.requestAnimationFrame(() => {
            run(run);
        });
    };
}