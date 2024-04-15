import * as THREE from 'three'
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import Stats from 'three/addons/libs/stats.module.js';//Stats性能监视器
//  引入GUI js库
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as TWEEN from 'three/addons/libs/tween.module.js';

/**
 * author ： jx
 * description : digitalTwin3D
 */


var tempZ = "-90.89";

var mesh_car;
var test_car;

// 定义车模型、场景模型
let camera, controls, scene, labelRenderer, tooltipContainer,
    followCar, sceneModel, scenePzModel, mesh_test, rigidBody,
    stats, renderer, clock, curCategory, trackPlaybackCar, sceneCenterMesh;
var boundaryBox;// 边界盒子
var poQiBoundaryBoxs = [];// 坡起边界盒子
// 存储加载完成的模型
var composer;
var examAreaCode = "FK001-2";//考试场地唯一码

// 此字段为了判断是否需要重新打开车载协议 ，如果打开将此状态置为null，如果触发关闭车载协议链接，将次状态置为 close
var vehicleProtoState;

var carsMap = new Map();
var deductMap = new Map();
var carPersonalMap = new Map();
var carStateMap = new Map();
var rigidBodyMap = new Map();// 车辆刚体map
var carEnterPoQiMap = new Map();// 当前存在的车辆map

// 轨迹回放的配置
var deductMap_trackPlayback = new Map();
var rigidBodyMap_trackPlayback = new Map();// 车辆刚体map
var carEnterPoQiMap_trackPlayback = new Map();// 当前存在的车辆map

const models = [];
var carArray = [];// 车辆数组
const loader = new FBXLoader();// FBX模型加载器
const gltfLoader = new GLTFLoader();
var isGenSui = false;// 是否跟随 true 跟随
// 一个旋转方向的四元数
const ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
// 常量
const DISABLE_DEACTIVATION = 4;

// 物理世界的一些变量
var world;
const carStateUiGroup = [];// 车辆状态UI
const shangPoGroup = [];// 上下坡触发器


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
var gui;
// GUI控制器
if (debug) {

    gui = new GUI();

    //  定义gui控制器的位置或样式
    gui.domElement.style.right = '0px';
    gui.domElement.style.width = '200px';
    gui.domElement.style.top = '50px';

    const obj = {
        bool: false,
        show: false
    };
    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj, 'bool').name('第三人称视角跟随').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        // console.log('obj.bool', value);
        // isGenSui = value;
        var obj = {
            "type": "trackPlayback",
            "examNo": "22023122217242900051",
            "startTime": "2022-11-30 01:52:25",
            "endTime": "2026-11-30 13:52:25",
            "playState": value
        };
        switchParam(obj);
        // createTrackWebSocket();
    });

    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj, 'show').name('删除刚体').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        console.log('obj.show', value);
        if (value) {
            //删除刚体
            var existBody = rigidBodyMap.get("C1-01");
            if (existBody) {
                removeRigiBody(existBody);
            }
        } else {
            //啥也不干
        }

    });
}

// 监听交互
listenMsg();

function init() {


    initGraphics();         // 初始化场景基本信息
    initPhysics();          // 初始化物理世界
    initSkyBox();           // 初始化天空盒

}

// 物理世界初始化
function initPhysics() {


    // 创建物理引擎世界
    world = new CANNON.World();
    world.gravity.set(0, -9.8, 0); // 设置重力
    world.defaultContactMaterial.friction = 0.5; // 设置默认摩擦系数
    // world.broadphase = new CANNON.NaiveBroadphase(); // 设置碰撞检测方法为 NaiveBroadphase

    // 碰撞算法
    world.broadphase = new CANNON.SAPBroadphase(world);

    // world.broadphase = new CANNON.SAPBroadphase(world);
    // 窗口切换事件
    function handleVisibilityChange() {
        if (world) {
            if (document.hidden) {
                // 窗口失去焦点，暂停物理模拟更新
                // world.pauseSimulation();
            } else {
                // 窗口重新聚焦，恢复物理模拟更新
                // world.resumeSimulation();
            }
        }

    }

    // 监听窗口切换事件
    document.addEventListener("visibilitychange", handleVisibilityChange, false);

}


/**
 * 
 * @param {位置} pos 
 * @param {初始化转向} quat 
 * @param {长} w 
 * @param {宽} l 
 * @param {高} h 
 * @param {质量} mass 
 * @param {系数} friction 
 */
function createRigidBody(pos, quat, w, l, h, mass, type) {
    if (!mass) mass = 0;

    var material = mass > 0 ? materialDynamic : materialStatic;
    if (type) {
        material = materialRed;
    }
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, l, h, 1, 1, 1),
        material
    );


    mesh.position.copy(pos);
    mesh.quaternion.copy(quat);

    if (debug && (type == "1car")) { // type == "dimian" ||  || type.indexOf("号") > -1
        const sceneFolder = gui.addFolder(type + '场景模型');
        // sceneFolder.close();
        sceneFolder.add(mesh.position, 'x', -1500, 1500).name("模型positionX轴").step(0.01);
        sceneFolder.add(mesh.position, 'y', -1500, 1500).name("模型positionY轴").step(0.01);
        sceneFolder.add(mesh.position, 'z', -1500, 1500).name("模型positionZ轴").step(0.01);

        sceneFolder.add(mesh.quaternion, 'x', -1500, 1500).name("模型quaternionX轴").step(0.01);
        sceneFolder.add(mesh.quaternion, 'y', -1500, 1500).name("模型quaternionY轴").step(0.01);
        sceneFolder.add(mesh.quaternion, 'z', -1500, 1500).name("模型quaternionZ轴").step(0.01);

        scene.add(mesh);
    }


    var rigidbody = new CANNON.Body({
        mass: mass, // 质量
        position: new CANNON.Vec3(pos.x, pos.y, pos.z), // 位置
        quaternion: quat, // 初始角度
        material: new CANNON.Material({ friction: 0.05, restitution: 0 }) //材质数据，里面规定了摩擦系数和弹性系数
    });

    var boxShape = new CANNON.Box(new CANNON.Vec3(w / 2, l / 2, h / 2)); // 盒子形状

    rigidbody.addShape(boxShape); // 添加形状到刚体



    rigidbody.allowSleep = true; // 允许休眠
    rigidbody.sleepSpeedLimit = 0.5; // 进入休眠所需速度限制
    rigidbody.collisionFilterGroup = 1; // 分组标志
    // rigidbody.collisionFilterMask = ~1; // 与其他分组发生碰撞
    rigidbody.fixedRotation = false; // 不固定旋转





    world.addBody(rigidbody); // 添加刚体到物理世界

    return rigidbody;
}

/**
 * 
 * @param {位置} pos 
 * @param {初始化转向} quat 
 * @param {长} w 
 * @param {宽} l 
 * @param {高} h 
 * @param {质量} mass 
 * @param {系数} friction 
 */
function createConvexPolyhedronRigidBody(pos, quat, vertices, faces, mass, type) {
    if (!mass) mass = 0;

    var material = mass > 0 ? materialDynamic : materialStatic;
    if (type) {
        material = materialRed;
    }



    var rigidbody = new CANNON.Body({
        mass: mass, // 质量
        position: new CANNON.Vec3(pos.x, pos.y, pos.z), // 位置
        quaternion: quat // 初始角度
    });

    const shape = new CANNON.ConvexPolyhedron({ vertices, faces });
    // var boxShape = new CANNON.Box(new CANNON.Vec3(w / 2, l / 2, h / 2)); // 盒子形状

    rigidbody.addShape(shape); // 添加形状到刚体

    world.addBody(rigidbody); // 添加刚体到物理世界

    // 将刚体显示出来
    if (debug) {
        addVisual(rigidbody, null);
    }


    return rigidbody;
}

/**
 * 删除刚体
 */
function removeRigiBody(body) {
    // 从物理世界中移除刚体
    world.removeBody(body);
    body = null;
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
var carStatus = true;// 暂停播放停止更新车辆位置
var tempQuat;
// 设置固定的距离值
var cameraToCarDistance = 30;
function render() {

    stats.update(); //帧率显示

    world.step(1 / 60, 10);  //更新物理计算
    if (carStatus) {
        updateCarPhysics();     //更新车辆位置
    }



    if (isGenSui && followCar) {

        controls.enableZoom = false; // 启用或禁用照相机的缩放 false 禁用
        controls.enablePan = false; // 是否禁用平移操作 false 禁用

        // 鼠标没有任何状态时，跟随
        if (!mouseDown && animationOver) {
            camera.position.set(followCar.position.x - offsetX, camera.position.y, followCar.position.z - offsetZ);

        } else {//  鼠标左键按下时不要触发一直跟随，并且等待跳转动画完成
            // 同时需要修改摄像机和物体之间的距离，因为鼠标按下的一瞬间暂停了摄像机跟随物体，需要把这个时间物体和摄像机之间的距离重置回原来的，但是角度已鼠标放开时的角度为准
        }

        controls.target = followCar.position;

        // 更新照相机的方向
        camera.lookAt(followCar.position);

    } else {

        controls.enableZoom = true;// 启用或禁用照相机的缩放 true 启用 
        controls.enablePan = true; // 是否禁用平移操作 true 启用

        animationOver = false;
    }

    // 轨迹回放时隐藏其余车辆
    // if (trackPlaybackFlag) {
    //     hideAllCar();
    // }

    renderer.render(scene, camera);//周期性执行相机的渲染功能，更新canvas画布上的内容
    labelRenderer.render(scene, camera);// 2D渲染

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

    // 创建EffectComposer对象
    composer = new EffectComposer(renderer);

    // 创建RenderPass作为第一个通道，用于渲染场景
    var renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 创建其他后期处理效果通道（例如BloomPass）
    var bloomPass = new BloomPass();
    composer.addPass(bloomPass);

    // 创建最终输出通道（例如ShaderPass）
    // var finalPass = new ShaderPass(myShader);
    // composer.addPass(finalPass);


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
    camera = new THREE.PerspectiveCamera(50, width / height, 0.000001, 6000);

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
    cameraPositionSet("init", "", sceneCenterMesh);
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

    scene.background = null;

    // 创建一个三维坐标轴
    const axesHelper = new THREE.AxesHelper(300);
    if (debug) {
        scene.add(axesHelper);//添加三维坐标轴到场景中
    }
    // initAddExamAreaUI();
    init2DRenderer();

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

// 初始化天空盒
function initSkyBox() {
    // // 创建天空球
    const skyGeometry = new THREE.SphereGeometry(10000, 1000, 1000);
    const skyMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./common/skyBox/skybox.png'), side: THREE.DoubleSide });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);


    // 将天空球添加到场景
    scene.add(sky);

}

// 初始化检测进入坡起触发器
function initShangPoTrigger() {

    poQiTriggerCoordinate.forEach(ele => {
        // 将 btBoxShape 的轮廓表示为 Three.js 的网格 为了看见刚体
        const boxGeometry = new THREE.BoxGeometry(ele.depth, ele.height, ele.width);
        const boxMesh = new THREE.Mesh(boxGeometry, materialGreen);
        boxMesh.position.set(ele.pos.position_x, ele.pos.position_y, ele.pos.position_z);
        boxMesh.name = ele.name;
        // if (debug) {
        //     const sceneFolder_test = gui.addFolder(ele.remark + 'trigger');

        // sceneFolder_test.add(boxMesh.position, 'x', -150, 150).name("X轴").step(0.01);
        // sceneFolder_test.add(boxMesh.position, 'y', -150, 150).name("Y轴").step(0.01);
        // sceneFolder_test.add(boxMesh.position, 'z', -150, 150).name("Z轴").step(0.01);
        // }
        shangPoGroup.push(boxMesh);
        scene.add(boxMesh);
    })

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



    // console.log("controls.target", controls.target);

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

        viewLimit();

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


/** 考试车辆相关 begin */


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


// 创建一个map，用于保存已加载的模型
const loadedModels = new Map();

// 加载模型并将其添加到车辆数组中

// 创建一个map，用于保存已加载的模型
const loadedModelsByTrack = new Map();
function asyncInsertTrackPlaybackCar(carTransFormVo, carExamInfoVo) {

    // 使用Promise封装加载过程
    return new Promise((resolve, reject) => {

        var carNo = carTransFormVo.carId;

        if (trackPlaybackCar && trackPlaybackCar.name == carNo) {

            updateCarByTrackPlayback(carTransFormVo, carExamInfoVo);// 车辆移动

            resolve(null);

        } else {

            // 检查模型是否已加载
            if (loadedModelsByTrack.has(carNo)) {

                resolve(loadedModelsByTrack.get(carNo));
                return;
            }

            // 在加载队列中添加模型名称
            const isLoading = loadedModelsByTrack.get(carNo);
            if (isLoading) {
                // console.log('模型正在加载中，请稍候:', carNo);
                isLoading.then(resolve).catch(reject);
                return;
            }
            // 重复的车辆模型只加载一次，车型-车号 为一个唯一的模型
            const loadingPromise = new Promise((innerResolve, innerReject) => {

                // 加载车辆模型
                loader.load(carModelUrl.replace("EXAMAREACODE", examAreaCode).replace("CARTYPE", carExamInfoVo.carType.toUpperCase()), (model) => {

                    // 车辆朝向
                    var euler = new THREE.Euler(0, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 0, 'YXZ'); // 使用字符串表示旋转顺序
                    const q = new THREE.Quaternion(0, 0, 0, 1);
                    // q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
                    q.setFromEuler(euler);

                    // 获取模型的长宽高
                    var modelWHDObj = modelWHDCalculate(model, 0.01);

                    //设置模型缩放100倍 因为导入模型的单位和three.js的单位不一样
                    model.scale.set(0.01, 0.01, 0.01);

                    /**
                     * 优化一下，之前时都默认加了掉落的高度，此处检测模型是否在坡起范围，如果在坡起范围增加否则不增加
                     */
                    var posy = carTransFormVo.posy + 3;
                    model.position.set(1 * carTransFormVo.posx, carTransFormVo.posy, -1 * (carTransFormVo.posz));
                    var inPoQi = boundaryBoxContainObject(poQiBoundaryBoxs, model);
                    if (!inPoQi) {
                        posy = carTransFormVo.posy;
                    }

                    model.position.set(1 * carTransFormVo.posx, posy, -1 * (carTransFormVo.posz));
                    model.rotation.set(1 * carTransFormVo.eurx, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 1 * carTransFormVo.eurz);
                    // 模型的名字为 车辆的ID
                    model.name = carTransFormVo.carId;
                    model.rotation.order = 'YZX';// 旋转方向
                    // 车辆的具体数据放到模型的userData自定义数据字段中，方便后续读取车辆信息
                    model.userData = carExamInfoVo;

                    scene.add(model);

                    /**
                     * 删除历史刚体
                     */
                    var existBody = rigidBodyMap_trackPlayback.get(model.name);
                    if (existBody) {
                        removeRigiBody(existBody);
                    }

                    // 创建 Cannon.js 刚体和形状
                    // var carBody = createRigidBody(model.position, q, modelWHDObj.width, modelWHDObj.height, modelWHDObj.depth, 500);

                    var resultPos = new THREE.Vector3(model.position.x, model.position.y, model.position.z + c1CarCheckZ);
                    var carBody = createRigidBody(resultPos, q, modelWHDObj.width, modelWHDObj.height, modelWHDObj.depth, 500); // 不展示mesh

                    // 车辆以及对应的刚体
                    rigidBodyMap_trackPlayback.set(model.name, carBody);
                    carEnterPoQiMap_trackPlayback.set(model.name, false);

                    trackPlaybackCar = model;
                    followCar = model;

                    //车辆添加图标
                    insertCarUI(model);

                    // 追踪视角默认偏移量
                    offsetX = 15, offsetY = 20, offsetZ = 15;
                    animationOver = false;// 动画效果结束状态 false 未结束

                    // 动画效果跳转
                    var tween = createTween(followCar.position.x - offsetX, offsetY, followCar.position.z - offsetZ, 1000, "car");
                    tween.start(); // 开始动画

                    // 将加载的模型添加到已加载模型的缓存中
                    loadedModelsByTrack.set(model.name, model);

                    // 返回模型数组和重复项判断结果
                    resolve(model);

                }, (event) => {
                    // 控制台打印加载进度
                    // console.log((event.loaded / event.total * 100) + '% loaded2');
                }, (error) => {
                    // 控制台打印加载失败
                    console.error(error);
                });
            })

            // 添加标志到加载中模型缓存中
            loadedModelsByTrack.set(carNo, loadingPromise);

            // 返回加载完成的Promise对象
            loadingPromise.then(resolve).catch(reject);

        }
    });
}

// 更新车辆物理刚体的位置
function updateCarPhysics() {

    rigidBodyMap_trackPlayback.forEach((body, carName) => {
        const car = scene.getObjectByName(carName);

        if (body && car) {
            car.position.copy(body.position);// 车辆模型与物理车辆模型位置同步
            car.quaternion.copy(body.quaternion);// 车辆模型与物理车辆模型位置同步

            // 此处检测是否进入坡起
            var carBox = new THREE.Box3().setFromObject(car);
            shangPoGroup.forEach(obj => {
                var triggerBox = new THREE.Box3().setFromObject(obj);
                if (carBox.intersectsBox(triggerBox) && !carEnterPoQiMap_trackPlayback.get(carName) && obj.name == "shangpo") {

                    // 如果发生碰撞，执行相应的处理逻辑
                    if (debug) {
                        console.log("准备上坡！");
                    }


                    carEnterPoQiMap_trackPlayback.set(carName, true);
                } else if (carBox.intersectsBox(triggerBox) && carEnterPoQiMap_trackPlayback.get(carName) && obj.name == "xiapo") {

                    if (debug) {
                        console.log("驶离坡起！");
                    }
                    carEnterPoQiMap_trackPlayback.set(carName, false);
                }
            })

        }

        // console.log("bodyPosition", body.position);
    });
}


// 轨迹回放后台协议推送更改刚体位置
function updateRigidBodyMap_trackPlayback(car, pos, quaternion) {
    if (car) {
        var body = rigidBodyMap_trackPlayback.get(car.name);
        if (body) {

            body.position.copy(pos);
            var inPoQi = boundaryBoxContainObject(poQiBoundaryBoxs, car);
            // var enterPoQi = carEnterPoQiMap_trackPlayback.get(car.name);
            if (inPoQi) {
                // console.log("坡起范围内");

            } else {
                body.quaternion.copy(quaternion);

                // console.log("不在坡起范围内");
            }
        }
    }
}


/**
 * 轨迹回放更新车辆
 * @param {考试车辆坐标信息} carTransFormVo 
 * @param {考试车辆基本信息} carExamInfoVo 
 */
function updateCarByTrackPlayback(carTransFormVo, carExamInfoVo) {

    //carId 就是 car名称 car.name是模型的名称 车型-序号组成名称 示例：C1-01 
    var carId = carTransFormVo.carId;

    var car = scene.getObjectByName(carId);

    // 更新坐标
    if (car) {

        // car.position.set(carTransFormVo.posx, car.position.y, -1 * (carTransFormVo.posz));
        // car.rotation.set(0, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 0);

        // 初始化第一获取到的协议角度
        var euler = new THREE.Euler(0, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 0, 'YXZ'); // 使用字符串表示旋转顺序

        // 将 y 角度限制在范围内（例如 -180 到 180）
        if (euler.y > Math.PI) {
            euler.y -= 2 * Math.PI;
        } else if (euler.y < -Math.PI) {
            euler.y += 2 * Math.PI;
        }

        var quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);

        updateRigidBodyMap_trackPlayback(
            car,
            new THREE.Vector3(carTransFormVo.posx, car.position.y, -1 * (carTransFormVo.posz)),
            quaternion
        );


        // 更新车辆信息
        car.userData = carExamInfoVo;


        // 展示扣分信息
        showDeduct(car, carExamInfoVo.deduct, "track", carExamInfoVo.deductTime);
    }




}

/**
 * 
 * @param {扣分车辆} car 
 * @param {扣分代码} deductCode 
 * @param {类型，是轨迹回放还是正常车载发送 如果存在且值为track代表轨迹回放} type 
 */
async function showDeduct(car, deductCode, type, deductTime) {

    var carId = car.name;
    // 显示扣分信息
    if ((curCategory == EXAMCAR || trackPlaybackFlag) && deductCode) {// 如果在考试车辆场景内 才触发扣分UI展示

        // 扣分代码
        // 调取UI提供的获取扣分详情以及分值的方法 只有在考试车辆模块中触发
        var deductInfo = await top.getCodePoint(deductCode);

        if (deductInfo) {
            var deductScore = deductInfo.kfz; // 扣分值
            var deductDesp = deductInfo.xmmc;// 扣分信息

            //更新车辆图标以及lable信息 顺序不要放到下面，因为里面会先清除，后添加
            insertCarUI(car);

            if (type && "track" == type) {

                if (!deductTime) {
                    deductTime = TimeUtils.getCurrentTimeAndColon();
                }

                if (deductMap_trackPlayback.has(carId)) {
                    var oldCode = deductMap_trackPlayback.get(carId);
                    if (oldCode != deductCode) {// 如果和历史扣分的code不一致，证明有新的扣分，显示扣分信息
                        deductMap_trackPlayback.set(carId, deductCode);

                        show(car, deductTime, deductScore, deductDesp, deductMap_trackPlayback);
                    }

                } else {
                    deductMap_trackPlayback.set(carId, deductCode);

                    show(car, deductTime, deductScore, deductDesp, deductMap_trackPlayback);
                }

            } else {

                var curTime = TimeUtils.getCurrentTimeAndColon();
                if (deductMap.has(carId)) {
                    var oldCode = deductMap.get(carId);
                    if (oldCode != deductCode) {// 如果和历史扣分的code不一致，证明有新的扣分，显示扣分信息
                        deductMap.set(carId, deductCode);

                        show(car, curTime, deductScore, deductDesp, deductMap);
                    }

                } else {
                    deductMap.set(carId, deductCode);

                    show(car, curTime, deductScore, deductDesp, deductMap);
                }
            }


        } else {
            console.log('未在数据库中查询到扣分信息！');
        }
        // console.log("扣分信息：" + deductInfo.xmmc);

    }

    function show(car, deductTime, deductScore, deductDesp, deductMapParam) {
        var dom;
        car.children.forEach(ele => {
            if (ele.name.split("__")[1] == car.name) {
                dom = ele.element;
            }
        })
        if (dom) {

            showDeductInfo(dom, deductTime, deductScore, deductDesp);
            setTimeout(function () {
                removeEleByClassName(dom, "deductInfoSimpleDiv");
                removeEleByClassName(dom, "deductInfoDiv");
                deductMapParam.delete(car.name);

            }, deductMsgTime);
        }
    }

}

// 添加车辆UI 和添加考试人员UI共用
function insertCarUI(car) {

    // 车辆基本信息
    var carExamInfo = car.userData;

    if (carExamInfo && car.visible) {

        var carStateObj = backCarState(carExamInfo.carType, carExamInfo.examState, carExamInfo.examScore);

        if (carStateObj) {

            // 轨迹回放的话图标显示车辆的 后期优化此处代码，过于冗余
            if (trackPlaybackFlag) {
                var carNo = carExamInfo.carType + "-" + carExamInfo.carId;
                // 创建包含文字的 HTML 元素
                var divElement = document.createElement('div');
                divElement.className = "carImgDiv";
                divElement.id = car.id;
                divElement.style.left = "0px";
                divElement.style.top = "-70px";
                var imgElement = document.createElement('img');

                var spanElement = document.createElement('span');
                spanElement.innerHTML = carNo;

                // 跟随状态下，当前跟踪车辆显示带光的图片
                if (followCar && isGenSui && followCar.name == carNo) {
                    imgElement.src = carStateObj.url_shan;
                    spanElement.classList.add("codeSpan");
                    spanElement.classList.add("codeSpanShan");
                } else {
                    imgElement.src = carStateObj.url;
                    spanElement.className = "codeSpan";
                }

                // 创建 CSS2DObject 并设置样式
                divElement.append(imgElement);
                divElement.append(spanElement);

                var imgObject = new CSS2DObject(divElement);

                /**
                 * carState__Str1__Str2 解释
                 * carState代表是考试车辆的模块 固定方便后面从这个名称中获取对应的类型
                 * Str1 是考试车辆的唯一编号 车型-车号  示例：C1-01
                 * Str2 由3部分组成 车辆唯一编号（车型-车号） 考生名字 考试分数/车辆状态
                 *  */
                var name;
                if (carStateObj.examStateName == "空闲") {
                    name = "carState__" + carNo + "__" + carNo + " " + carExamInfo.examineeName + " "
                        + carStateObj.examStateName;
                } else {
                    name = "carState__" + carNo + "__" + carNo + " " + carExamInfo.examineeName + " "
                        + carExamInfo.examScore + "分/" + carStateObj.examStateName;
                }

                imgObject.name = name;

                // 添加入组，方便操作
                carStateUiGroup.push(imgObject);

                car.add(imgObject);

                divElement.addEventListener('click', function (event) {
                    // 处理点击事件的代码
                    // console.log("_this", this);
                    commonClick(this, name);
                });

                // 鼠标移入事件监听
                divElement.addEventListener('mouseover', function () {
                    commonMouseover(this, name.split("__")[2], examCarLableWidth, examCarLableRight);
                });

                // 鼠标移出事件监听
                divElement.addEventListener('mouseout', function () {
                    removeEleByClassName(this, "lable");
                });
            }
        }
    }

}


// 清理指定车辆UI
function cleanCarUI(car) {
    var carStateGroup = new THREE.Group();

    if (car) {
        switch (curCategory) {// 当前所处分类

            case EXAMCAR:

                var children = car.children;
                children.forEach(e => {
                    if (e.name.indexOf("carState") > -1) {

                        carStateGroup.add(e);
                        var element = e.element;
                        element.remove();

                        // 将CSS2DObject对象置为null，以便释放内存
                        e = null;

                    }
                });
                break;

            case EXAMPERSONAL:

                var children = car.children;
                children.forEach(e => {
                    if (e.name.indexOf("personal") > -1 || e.name.indexOf("carState") > -1) {

                        carStateGroup.add(e);
                        var element = e.element;
                        element.remove();

                        // 将CSS2DObject对象置为null，以便释放内存
                        e = null;

                    }
                });

                break;
        }

        scene.remove(carStateGroup);
    }

}

// 优化俯视角看到的车辆跟随UI
function optimizeCarState(distance) {

    // console.log("视角距离", distance);

    carArray.forEach(element => {


        // 车辆基本信息
        var carExamInfo = element.userData;

        if (carExamInfo) {
            var carStateObj = backCarState(carExamInfo.carType, carExamInfo.examState, carExamInfo.examScore);

            if (carStateObj) {
                element.children.forEach(ele => {
                    var carId = ele.name.split("__")[1];
                    if (carId == carExamInfo.carId) {
                        var css2Obj = ele;
                        css2Obj.element.style.left = "0px";

                        if (distance < 50) {
                            css2Obj.element.style.top = "-70px";
                        } else {
                            css2Obj.element.style.top = "-50px";
                        }


                        // if (getCameraAndMeshAngleDaYu75()) {
                        //     css2Obj.element.style.top = "-50px";
                        // } else if (!getCameraAndMeshAngleDaYu75() && distance < 40) {
                        //     css2Obj.element.style.top = "-150px";
                        // } else if (!getCameraAndMeshAngleDaYu75() && distance > 40 && distance < 70) {
                        //     css2Obj.element.style.top = "-80px";
                        // } else if (!getCameraAndMeshAngleDaYu75() && distance > 70) {
                        //     css2Obj.element.style.top = "-50px";
                        // }


                    }
                })

            }

        }

    });
}

// 返回科目2名称
function getSubjectName(examSubjectId) {

    if (examSubjectId) {

        return getValueByNestedKey(subjectJson, examSubjectId);
    } else {
        return "分配中";
    }
}

/**
 * 返回车辆状态信息
 * @param {车辆类型} carType 
 * @param {考试车辆状态 0=未进行考试 / 1=分配完成 / 2=考试中 / 3=考试结束} state 
 * @param {分数} score 
 * @returns 
 */
function backCarState(carType, state, score) {

    var obj = {};
    /**
     * 状态为结束时，计算分数小于90并且是大型车或其他车辆小于80 考试状态标记为不合格 
     */
    if (state == 3 && ((score < 90 && (carType == "A1" || carType == "A2" || carType == "A3" || carType == "B1" || carType == "B2")) || score < 80)) {// 不及格
        // 设置属性
        obj.examStateName = carState.unqualified.name;
        obj.url = carState.unqualified.url;
        obj.url_shan = carState.unqualified.url_shan;
        obj.url_personal = carState.unqualified.url_personal;

    } else if (state == 3 && ((score >= 90 && (carType == "A1" || carType == "A2" || carType == "A3" || carType == "B1" || carType == "B2")) || score >= 80)) {// 及格
        // 设置属性
        obj.examStateName = carState.qualified.name;
        obj.url = carState.qualified.url;
        obj.url_shan = carState.qualified.url_shan;
        obj.url_personal = carState.qualified.url_personal;

    } else if (state == 0) {
        // 设置属性
        obj.examStateName = carState.idle.name;
        obj.url = carState.idle.url;
        obj.url_shan = carState.idle.url_shan;
        obj.url_personal = carState.idle.url_personal;
    } else if (state == 2) {
        // 设置属性
        obj.examStateName = carState.inExam.name;
        obj.url = carState.inExam.url;
        obj.url_shan = carState.inExam.url_shan;
        obj.url_personal = carState.inExam.url_personal;
    } else if (state == 1) {
        // 设置属性
        obj.examStateName = carState.assigned.name;
        obj.url = carState.assigned.url;
        obj.url_shan = carState.assigned.url_shan;
        obj.url_personal = carState.assigned.url_personal;
    }

    return obj;
}

/**
 * 显示扣分信息
 * @param {当前dom} _this 
 * @param {时间} time 
 * @param {所扣分数} score 
 * @param {扣分详细内容} content 
 */
function showDeductInfo(_this, time, score, content) {


    // 先删除之前的元素

    removeEleByClassName(_this, "deductInfoSimpleDiv");
    removeEleByClassName(_this, "deductInfoDiv");

    if (isGenSui) {
        // 创建一个容器元素
        var deductContainer = document.createElement('div');

        // 设置容器的样式
        deductContainer.className = "deductInfoDiv";
        deductContainer.style.width = examCarDeductDetailWidth;
        deductContainer.style.right = examCarDeductDetailRight;

        // 创建文字元素并添加到容器中
        // 时间
        var timeText = document.createElement('span');
        timeText.innerHTML = time + " ";

        // 扣分
        var deductText = document.createElement('span');
        deductText.innerHTML = "扣" + score + "分"

        // 扣分详细内容
        var contentText = document.createElement('span');
        contentText.innerHTML = content;

        // 关闭
        var closeText = document.createElement('span');
        closeText.innerHTML = "x";

        //绑定关闭事件
        closeText.addEventListener('click', function (event) {
            // 处理点击事件的代码
            this.parentElement.remove();
            removeEleByClassName(_this, "lable");
            event.stopPropagation();
        });

        deductContainer.appendChild(timeText);
        deductContainer.appendChild(deductText);
        deductContainer.appendChild(closeText);
        deductContainer.appendChild(contentText);

        // 拼接dom
        _this.appendChild(deductContainer);

    } else {

        // 创建一个容器元素
        var deductContainer = document.createElement('div');

        // 设置容器的样式
        deductContainer.className = "deductInfoSimpleDiv";
        deductContainer.style.width = examCarDeductSimpleWidth;
        deductContainer.style.right = examCarDeductSimpleRight;

        // 扣分
        var deductText = document.createElement('div');
        deductText.innerHTML = "扣" + score + "分"

        deductContainer.appendChild(deductText);

        // 拼接dom
        _this.appendChild(deductContainer);
    }


}

// 切换类目清除考试车辆UI
function clearExamCarUI() {

    var carStateGroup = new THREE.Group();
    // 从父元素中移除HTML标签
    carArray.forEach(ele => {
        var children = ele.children;
        children.forEach(e => {
            if (e.name.indexOf("carState") > -1) {

                carStateGroup.add(e);
                var element = e.element;
                element.remove();

                // 将CSS2DObject对象置为null，以便释放内存
                e = null;

            }
        })
    });
    scene.remove(carStateGroup);
}

// 点击左侧列表车，视角自动跟随该车辆
function perspectiveFollowing(param) {

    // 跳转车辆第一视角 统一跳转 参数需要进行过滤获取车号即可 传过来的一般是 车型-车号 C1-01
    carArray.forEach(element => {
        if (element.name == param) {
            followCar = element;
            var dom = document.getElementById(element.id);
            blingIcon(dom);
        }
    });

    if (followCar) {

        isGenSui = true;
        // 每次点击重置偏移量
        offsetX = 15, offsetY = 20, offsetZ = 15;
        animationOver = false;// 动画效果结束状态 false 未结束

        // 动画效果跳转
        var tween = createTween(followCar.position.x - offsetX, offsetY, followCar.position.z - offsetZ, 1000, "car");
        tween.start(); // 开始动画

    }

}

/** 考试车辆相关 end */




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
        if (top.webglMessagePort) {
            top.webglMessagePort.postMessage(arr[1]);
        }

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
function cameraPositionSet(type, number, obj, isQuanJing) {

    // controls.reset();


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

        if ("init" == type) {
            // 去除跳动的样式
            removeClass("imgDiv_jump");
            removeClass("codeSpanShan");
            replaceAllShanImg();
        } else {
            // 图标特效，具有对应的id，以及目前只在考试区域 或者监控设备模块才有
            if (positionObj.class_id) {
                var dom = document.getElementById(positionObj.class_id);
                if (dom) {
                    jumpIcon(dom);
                }
            }
        }


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
                1000,
                null,
                obj,
                null,
                targetPos
            );


            tween.start(); // 开始动画
        }

        //  设置相机的位置
        camera.rotation.set(positionObj.rotation_x, positionObj.rotation_y, positionObj.rotation_z);


    } else {
        if (debug) {
            alert("未配置此项坐标：" + type);
        }

    }


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


// 判断返回是哪个类目类型字符串 例：考试区域 考试车辆 考生人员 监控设备
function backExamType(param) {

    var examAreaType = "zhijiao,daoku,quxian,cefang,poqi,quanjing";
    var examCarType = "carState";
    var examPersonalType = "personal";
    var examMonitorType = "monitor";
    if (param) {

        var paramArray = param.split("__");
        if (examAreaType.indexOf(paramArray[0]) > -1) {
            return "area";
        } else if (examCarType.indexOf(paramArray[0]) > -1) {
            return "carState";
        } else if (examPersonalType.indexOf(paramArray[0]) > -1) {
            return "personal";
        } else if (examMonitorType.indexOf(paramArray[0]) > -1) {
            return "monitor";
        } else {
            return "";
        }

    } else {

        return '';
    }
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

// 返回带闪光的图片
function backReplaceImgSrc(imgUrl) {
    const imageName = imgUrl.match(/\/([^\/]+)$/)[1];
    const imageNameShan = imageName.split(".")[0] + "_shan";
    const rsUrl = imageNameShan + "." + imageName.split(".")[1];
    return rsUrl;
}

// 返回不带闪光的图片
function backReplaceImgSrcNoShan(imgUrl) {
    const imageName = imgUrl.match(/\/([^\/]+)$/)[1];
    const imageNameNoShan = imageName.split(".")[0].replace("_shan", "");
    const rsUrl = imageNameNoShan + "." + imageName.split(".")[1];
    return rsUrl;
}

function removeClass(className) {
    const elements = document.querySelectorAll("." + className); // 选择具有特定 class 名称的元素

    elements.forEach(element => {
        element.classList.remove(className); // 删除该 class 名称
    });
}

function replaceAllShanImg() {

    // 获取页面上的所有图片元素
    var images = document.getElementsByTagName('img');

    // 遍历所有的图片元素
    for (var i = 0; i < images.length; i++) {
        var img = images[i];
        var replaceSrc = backReplaceImgSrcNoShan(img.src);
        img.src = imgPath + replaceSrc;
    }
}

var preEle;
/**
 * 调整icon为跳动状态
 * @param {需要调整的dom} _this 
 */
function jumpIcon(_this) {

    if (_this) {
        // 去除跳动的样式
        removeClass("imgDiv_jump");
        removeClass("codeSpanShan");
        if (preEle) {
            const preImg = preEle.querySelector("img:first-child"); // 获取第一个子级图片元素
            preImg.src = imgPath + backReplaceImgSrcNoShan(preImg.src);
        }

        const imgDiv = _this.querySelector(":first-child"); // 获取第一个子元素
        imgDiv.classList.add("imgDiv_jump");
        const img = _this.querySelector("img:first-child"); // 获取第一个子级图片元素
        img.src = imgPath + backReplaceImgSrc(img.src);
        const span = _this.querySelector(":first-child span"); // 获取第一个子级图片元素
        if (span) {
            span.classList.add("codeSpanShan");
        }

        preEle = _this;

    }

}

/**
 * 切换icon为带光圈的
 * @param {切换闪光图片的dom} _this 
 */
function blingIcon(_this) {
    if (_this) {

        removeClass("codeSpanShan");

        if (preEle) {
            const preImg = preEle.querySelector("img:first-child"); // 获取第一个子级图片元素
            preImg.src = imgPath + backReplaceImgSrcNoShan(preImg.src);
        }

        const img = _this.querySelector("img:first-child"); // 获取第一个子级图片元素
        if (!(img.src.indexOf("_shan") > -1)) {// 包含闪光的不做处理
            img.src = imgPath + backReplaceImgSrc(img.src);
        }

        const span = _this.querySelector(":first-child span"); // 获取第一个子级图片元素
        if (span) {
            span.classList.add("codeSpanShan");
        }

        preEle = _this;

    }
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
// 监听UI点击事件
function listenMsg() {

    if (top.webglMessagePort) {
        top.webglMessagePort.onmessage = function (msg) {
            console.log("back msg : " + msg.data);
            if (msg.data) {
                switchParam(JSON.parse(msg.data));
            }

        };
    } else {
        var msg = {
            "data": {
                "type": "inTrackPlayback",
                "examAreaCode": "FK001-2",
                "examNo": "22023122211405200034",
                "startTime": "2023-12-22 11:41:41",
                "endTime": "2023-12-22 11:50:20",
                "playState": true
            }
        };
        if (msg.data) {
            switchParam(msg.data);// 自己测试
        }
    }

}


var trackPlaybackFlag = false;// 轨迹回放状态 true 处于轨迹回放 false 反之
var uuid = generateUUID();// 用于生成给后台传输的唯一ID


function track(obj, from) {

    console.log("1111------" + from);

    trackPlaybackFlag = true;   // 是否开启轨迹回放标志位
    isGenSui = true;    // 开启轨迹回放默认第一视角跟随
    /**
     * 给后端传递参数，返回对应轨迹回放的协议
     */

    // 为了防止车辆突然卡在坡起当中出现bug，在切换项目以及快进时重新加载车辆，防止出现此bug
    if (obj.changeStatus) {
        if (followCar) {
            loadedModelsByTrack.delete(followCar.name); // 删除模型map中存储的车辆
            cleanCarUI(followCar);// 删除UI
            scene.remove(followCar);
        }
        trackPlaybackCar = null;// 删除之前的车辆，重新加载
    }

    var msgObj = {};
    if (obj.isDrag) {
        closeSocket_track(); // 关闭轨迹回放的WS链接 ，后面会 重新打开，释放资源
        uuid = generateUUID();// 用于生成给后台传输的唯一ID
    }
    msgObj.id = uuid;
    msgObj.ksxh = obj.examNo;
    msgObj.kssj = obj.startTime;
    msgObj.jssj = obj.endTime;


    // 判断轨迹回放的播放状态 如果暂停将后台的WS协议关闭
    if (obj.playState) {
        carStatus = true;
        createTrackWebSocket(msgObj);
    } else {
        carStatus = false;
        closeSocket_track(); // 关闭轨迹回放的WS链接
    }
}

// 监听传递的参数跳转对应的场景
function switchParam(obj) {

    if (obj) {

        switch (obj.type) {

            case INTRACKPLAYBACK: // 进入轨迹回放

                if (obj.examAreaCode) {

                    examAreaCode = obj.examAreaCode;
                    // examAreaCode = "FK001-2";

                    var exist = checkFileExists(sceneUrl.replace("EXAMAREACODE", examAreaCode));

                    if (exist) {
                        // 加载每个考试区域对应的私有文件
                        var scriptsToLoad = [
                            "./" + examAreaCode + "/Config/areaPosition.js",
                            "./" + examAreaCode + "/Config/imagePosition.js",
                            "./" + examAreaCode + "/Config/monitor.js",
                            "./" + examAreaCode + "/Config/uiPosition.js",
                            "./" + examAreaCode + "/Config/poqiPosition.js",
                            "./" + examAreaCode + "/Config/config.js",
                        ];
                        // 按需加载json文件
                        loadScripts(scriptsToLoad, function () {
                            // 外部JavaScript文件加载完成后执行的回调函数
                            // 在这里可以调用外部脚本中的函数或执行其他操作

                            init();
                            // 加载场景模型
                            function loadModel() {
                                return new Promise(function (resolve, reject) {

                                    loader.load(sceneUrl.replace("EXAMAREACODE", examAreaCode), (model) => {

                                        // 获取模型的长宽高
                                        var modelWHDObj = modelWHDCalculate(model, 0.01);

                                        // model.scale.set(1, 1, 1);
                                        model.scale.set(0.01, 0.01, 0.01);
                                        // model.position.set(0, 0, 0);

                                        if (debug) {
                                            const sceneFolder = gui.addFolder('场景模型');
                                            // sceneFolder.close();
                                            sceneFolder.add(model.position, 'x', -1500, 1500).name("模型X轴").step(1);
                                            sceneFolder.add(model.position, 'y', -1500, 1500).name("模型Y轴").step(1);
                                            sceneFolder.add(model.position, 'z', -1500, 1500).name("模型Z轴").step(1);
                                        }


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

                                        if (debug) {// 设置边界盒子的GUI
                                            const sceneFolder = gui.addFolder('边界盒子模型');
                                            // sceneFolder.close();
                                            sceneFolder.add(scene_box.position, 'x', -1500, 1500).name("模型X轴").step(1);
                                            sceneFolder.add(scene_box.position, 'y', -1500, 1500).name("模型Y轴").step(1);
                                            sceneFolder.add(scene_box.position, 'z', -1500, 1500).name("模型Z轴").step(1);
                                        }

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

                                        initPoQiBox();

                                        scene.add(model);

                                        resolve(models);

                                    }, (event) => {

                                        // 控制台打印加载进度
                                        console.log((event.loaded / event.total * 100) + '% loaded1');

                                        if (top.loadScene) {
                                            top.loadScene(event.loaded / event.total * 100);
                                        }

                                    }, (error) => {

                                        // 控制台打印加载失败
                                        // console.error(error);


                                    });
                                })
                            }

                            //  模型加载完之后，可以获取模型对象
                            loadModel().then(function (model) {

                                model.forEach(ele => {
                                    if (ele.name == "sceneMain") {
                                        sceneModel = ele;

                                    }
                                })

                                // 初始化地面

                                // 初始化地面
                                /**
                                 * 获取模型的长宽 以及对应的position 创建对应地面
                                 */
                                const qua = new THREE.Quaternion(0, 0, 0, 1);
                                // createRigidBody(new THREE.Vector3(52.78, -0.5, 81.08), qua, 500, 1, 500, 0, "dimian");
                                // createRigidBody2(model[0], new THREE.Vector3(0, 0, 0), qua, 0);

                                const floorShape = new CANNON.Plane();
                                const floorBody = new CANNON.Body();
                                // mass 为 0 表示固定在这里。
                                floorBody.mass = 0;
                                floorBody.addShape(floorShape);
                                // 地板的位置进行旋转。在 Cannon 中没有旋转的 api，必须使用四元数进行操作。
                                // 对 floorBody 的四元数 quaternion 设置角度，第一个入参为所延的轴向，第二个参数为旋转的角度。
                                floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI / 2);
                                // floorBody.quaternion.copy(qua);
                                // floorBody.position.set(0, 20, 0);
                                world.addBody(floorBody);

                                /**
                                 * 获取模型的长宽 以及对应的position 创建对应地面
                                 */
                                // const qua = new THREE.Quaternion(0, 0, 0, 1);
                                // createRigidBody(new THREE.Vector3(52.78, -0.5, 81.08), qua, 500, 1, 500, 0, "dimian");

                                initPoQiRigidbody();

                                initControls();

                                // 待场景加载完执行
                                initShangPoTrigger();   // 初始化检测是否上坡触发器
                                // render();

                                // 轨迹回放
                                track(obj, "init");

                                // 升级版渲染，浏览器即时切换也会运行
                                const fn = updateCanvas(() => { render() }, 150);
                                fn(fn);

                            });

                            // 初始化坡道盒子
                            function initPoQiBox() {
                                poQiBoxCoordinate.forEach(ele => {

                                    // 创建坡道边界盒子，用来判断车辆是否在上坡区域内
                                    const geometry_podao = new THREE.BoxGeometry(ele.width, ele.height, ele.depth);
                                    const mesh_podao = new THREE.Mesh(geometry_podao, common_material);

                                    // 位置手动设置是因为，在做模型的时候0,0位置以基站坐标为准所以，0,0点不是模型的中心点，需要手动设置便捷盒子所处的位置
                                    mesh_podao.position.set(ele.pos.position_x, ele.pos.position_y, ele.pos.position_z);

                                    if (debug) {// 设置边界盒子的GUI
                                        const sceneFolder = gui.addFolder(ele.name + '坡道边界盒子模型');
                                        sceneFolder.close();
                                        sceneFolder.add(mesh_podao.position, 'x', -1500, 1500).name("模型X轴").step(0.1);
                                        sceneFolder.add(mesh_podao.position, 'y', -1500, 1500).name("模型Y轴").step(0.1);
                                        sceneFolder.add(mesh_podao.position, 'z', -1500, 1500).name("模型Z轴").step(0.1);
                                    }

                                    poQiBoundaryBoxs.push(new THREE.Box3().setFromObject(mesh_podao));
                                    // poQiBoundaryBox = new THREE.Box3().setFromObject(mesh_podao);// 坡起边界盒子

                                    scene.add(mesh_podao);

                                    // 调试的时候打开，可以看到坡道盒子
                                    common_material.visible = debug;
                                })
                            }

                            // 初始化坡道刚体
                            function initPoQiRigidbody() {
                                poQiCoordinate.forEach(ele => {

                                    const quaternion = new THREE.Quaternion(0, 0, 0, 1);
                                    if (ele.rotateDirection == "x") {
                                        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / ele.rotationAngle);
                                    } else if (ele.rotateDirection == "y") {
                                        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / ele.rotationAngle);
                                    } else if (ele.rotateDirection == "z") {
                                        quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / ele.rotationAngle);
                                    }
                                    createRigidBody(
                                        new THREE.Vector3(ele.pos.position_x, ele.pos.position_y, ele.pos.position_z),
                                        quaternion, ele.width, 1, ele.depth, 0, ele.name
                                    );
                                })
                            }




                        });

                    } else {
                        alert("没有对应场景");
                    }

                }
                break;
            case CHANGETRACKPLAYBACK: // 选择性播放轨迹回放
                // 轨迹回放
                track(obj, "change");
                break;

            default:
                console.log("请传入参数类型！");
        }
    } else {
        console.log("请传入操作的类目！");
    }
}

/** 和前端交互的 通信方式 end*/


/** 车载协议相关  begin*/

// 扣分类
class DeductVo {
    /**
     * 
     * @param {车辆ID} carId 
     * @param {扣分代码} deductCode 
     * @param {扣分值} score 
     * @param {扣分信息} desc 
     * @param {扣分事件} time 
     */
    constructor(carId, deductCode, deductScore, deductDesc, deductTime, timestamp) {
        this.carId = carId;
        this.deductCode = deductCode;
        this.deductScore = deductScore;
        this.deductDesc = deductDesc;
        this.deductTime = deductTime;
        this.timestamp = timestamp;
    }
}

// 考试车辆位置
class CarTransFormVo {
    /**
     * 
     * @param {车辆ID} carId 
     * @param {坐标X轴} posx  
     * @param {坐标Y轴} posy  
     * @param {坐标Z轴} posz  
     * @param {俯仰角} eurx  
     * @param {航向角} eury  
     * @param {翻滚角} eurz  
     */
    constructor(carId, posx, posy, posz, eurx, eury, eurz) {
        this.carId = carId;
        this.posx = posx;
        this.posy = posy;
        this.posz = posz;
        this.eurx = eurx;
        this.eury = eury;
        this.eurz = eurz;
    }
}

// 考试车辆基本信息
class CarExamInfoVo {
    /**
     * 
     * @param {车辆类型} carType 
     * @param {车辆ID} carId 
     * @param {考生姓名} examineeName 
     * @param {考试分数} examScore 
     * @param {考试状态} examState 
     * @param {在考项目编号} examSubjectId 
     * @param {在考项目名称} examSubjectName 
     * @param {考试流水号} waterId 
     * @param {证件号码} identityID 
     * @param {扣分项} deduct 
     * @param {扣分时间} deductTime 
     */
    constructor(carType, carId, examineeName, examScore, examState, examSubjectId, examSubjectName, waterId, identityID, deduct, deductTime) {

        this.carType = carType;
        this.carId = carId;
        this.examineeName = examineeName;
        this.examScore = examScore;
        this.examState = examState;
        this.examSubjectId = examSubjectId;
        this.examSubjectName = examSubjectName;
        this.waterId = waterId;
        this.identityID = identityID;
        this.deduct = deduct;
        this.deductTime = deductTime;
        /**
         * 分数小于90并且是大型车考试状态标记为不合格
         */
        // if (examScore < 90 && (carType == "A1" || carType == "A2" || carType == "A3" || carType == "B1" || carType == "B2")) {
        //     examState == "unqualified";
        // } else if (examScore < 80) {
        //     examState == "unqualified";
        // } else if (examState == 0) {
        //     examState == ""
        // }
    }
}

/** 车载协议相关  end*/

/**
 * 轨迹回放处理 begin
 */

function trackProtoHandler(msg) {

    return new Promise(async function (resolve, reject) {
        // msg = "$header,C1,2,司空半兰,100,20231110172837100070,2,1,46.9925016692,-43.2076740270,19.622200,257.250000,-2.190000,0.000000,0,0,-5759604.1676039500,1738465.0167516796,0.000000,0.000000,0.000000,0.000000+440881199511100007,2190311100007,02002002222222222222,0,^^,0+2500,1.08,1100000010001004000000001,0.000000,2,1+FK001,2,z*$header,C1,2,司空半兰,100,20231110172837100070,2,1,47.0472158772,-43.2032332063,19.621900,256.520000,-2.250000,0.000000,0,0,-5759604.1676039500,1738465.0167516796,0.000000,0.000000,0.000000,0.000000+440881199511100007,2190311100007,02002002222222222222,0,^^,0+2500,0.99,1100000010001004000000001,0.000000,2,1+FK001,2,z*","
        if (msg) {

            // 解析中转服务器的协议
            var dataArr = decodeURIComponent(msg).split("+");
            if (dataArr && (dataArr.length == 4 || dataArr.length == 5)) {// 正常的协议长度 如果是轨迹回放，后面会拼一个对应协议的扣分时间戳

                var examAreaArr = dataArr[3].split(",");// 考试区域信息
                if (((examAreaArr[0] + "-" + examAreaArr[1]) == examAreaCode) || ("51000203" == examAreaCode)) {// 筛选协议，只获取当前考场的socket协议

                    var headerArr = dataArr[0].split(",");// 车辆基本信息以及坐标
                    if (headerArr && headerArr.length > 0 && headerArr[0] == "$header") {// 协议中是否包含$header 包含才做处理

                        var examInfoArr = dataArr[1].split(",");// 考试信息

                        // var subjectName = getSubjectName("20100");
                        // var carExamInfoVo = new CarExamInfoVo("C1", '0' + (index + 1), "王大拿" + (index + 1), randomScore(), random(), "20100", subjectName, "2190311100007", "440881199511100007", "10^侧方停车出库时不使用或错误使用转向灯^20405");


                        var carId = headerArr[1] + "-" + formatNumber(headerArr[2]); // 车辆id 由 车型-车号 组成

                        // cType.sign = DateTime.Now.ToString("HHmmss");
                        // cType.cartype = headerArr[1];
                        // carMap.set(carId,)
                        // 车辆位置信息
                        var carTransForm = new CarTransFormVo(
                            carId,
                            parseFloat(headerArr[8]),   // 车辆position.x
                            1,                          // 车辆position.y
                            parseFloat(headerArr[9]),   // 车辆position.z
                            0,                          // 车辆rotation.x
                            parseFloat(headerArr[11] - 180),    // 车辆rotation.y
                            parseFloat(headerArr[13]),  // 车辆rotation.z
                        )

                        var subjectName = getSubjectName(examInfoArr[3]);

                        // 获取车载协议传过来的扣分代码
                        var deductCode, deductTime;
                        var deductCodes = examInfoArr[4];

                        var codeArr = deductCodes.split("^");
                        if (codeArr.length > 0) {
                            deductCode = codeArr[2];// 只拿最新的扣分代码
                        }

                        /**原协议只到* 后期新增的信息放到了*后面，目前只有轨迹回放这么做，目前只添加了一项扣分时间戳 */
                        var supplementInfoArray = msg.split("*");
                        if (supplementInfoArray && supplementInfoArray.length == 2) {
                            deductTime = TimeUtils.formatHHmmssTimeStamp(supplementInfoArray[1]);
                        } else {
                            deductTime = TimeUtils.getCurrentTimeAndColon();
                        }
                        // 创建车辆对象
                        var carExamInfo = new CarExamInfoVo(
                            headerArr[1],   // 车辆类型
                            formatNumber(headerArr[2]),// 车辆号码
                            headerArr[3],   // 考生姓名
                            headerArr[4],   // 考试分数
                            headerArr[6],   // 考试状态
                            examInfoArr[3], // 在考项目编号
                            subjectName,    // 在考项目名称
                            examInfoArr[1], // 考试流水号
                            examInfoArr[0], // 证件号
                            deductCode,     // 扣分项
                            deductTime      // 扣分时间
                        );

                        // 添加车辆以及更新
                        asyncInsertTrackPlaybackCar(carTransForm, carExamInfo).then(function (car) {

                            if (car) {

                                followCar = car;

                                showDeduct(car, carExamInfo.deduct, "track", deductTime);

                                // 给UI推送消息 告诉UI轨迹回放播放成功
                                if (top.webglMessagePort) {
                                    top.webglMessagePort.postMessage("playSuccess");
                                }


                                resolve(car);
                            } else {
                                resolve();
                            }

                        })


                    } else {
                        resolve();
                    }

                } else {
                    resolve();
                }

            } else {
                console.log("中转服务器传递信息有误！" + msg);
                resolve();
            }

        } else {
            console.log("未加载到中转服务器车载协议信息！" + msg);
            resolve();
        }
    })

}

/**
 * 轨迹回放处理 end
 */
// 创建 WebSocket 连接

// 轨迹回放的websocket
var socket_track;
// 调取轨迹回放 ，获取轨迹回放的协议
function createTrackWebSocket(msgObj) {


    // 轨迹回放的websocket
    socket_track = new WebSocket(trackProtoUrl.replace("RANDOM", msgObj.id));

    // // 监听连接打开事件
    socket_track.addEventListener('open', (event) => {
        // console.log('Socket连接已打开');
        var message = JSON.stringify(msgObj);
        sendMessageTrack(message);
    });
    // 
    // // 监听接收消息事件
    socket_track.addEventListener('message', (event) => {
        const receivedData = event.data;

        trackProtoHandler(receivedData);
        // console.log('收到消息:', receivedData);
    });

    // // 监听连接关闭事件
    socket_track.addEventListener('close', (event) => {
        console.log('Socket连接已关闭');
    });

    // // 监听连接错误事件
    socket_track.addEventListener('error', (event) => {
        console.error('Socket连接发生错误:', event);
    });

    // 发送消息
    /**
     * 
     * @param {给WX的信息，WX收到信息推送协议} message 
     * @param {播放状态，如果是true播放，如果是否则不播放} playState 
     */
    function sendMessageTrack(message) {
        if (socket_track.readyState === WebSocket.OPEN) {

            // console.log('已发送消息:', message);

            if (message) {
                socket_track.send(message);
            }

            // message = "{\"id\":\"" + uuid + "\", \"ksxh\":\"22023121916255000021\", \"jssj\":\"99999999999\", \"kssj\":\"0\"}";

        } else {
            console.error('Socket连接未打开，无法发送消息');
        }
    }


}


// 关闭连接
function closeSocket_track() {

    if (socket_track && socket_track.readyState === WebSocket.OPEN) {

        socket_track.close();
    }

}

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


/**
 * 显示刚体
 * @param {刚体} body 
 * @param {材质} material 
 * @returns 
 */
function addVisual(body, material) {

    // Materials
    var material = material || new THREE.MeshPhongMaterial({
        color: 0xff0000
    });

    let shape = body.shapes[0];
    // 注：这里默认body中只有一个shape，若body中有多个shape，请使用for循环进行遍历
    let mesh;

    switch (shape.type) {
        case CANNON.Shape.types.SPHERE:
            var sphere_geometry = new THREE.SphereGeometry(shape.radius, 30, 30);
            mesh = new THREE.Mesh(sphere_geometry, material);
            break;

        case CANNON.Shape.types.PARTICLE:
            mesh = new THREE.Mesh(this.particleGeo, this.particleMaterial);
            var s = this.settings;
            mesh.scale.set(s.particleSize, s.particleSize, s.particleSize);
            break;

        case CANNON.Shape.types.BOX:
            var box_geometry = new THREE.BoxGeometry(shape.halfExtents.x * 2,
                shape.halfExtents.y * 2,
                shape.halfExtents.z * 2);
            mesh = new THREE.Mesh(box_geometry, material);
            break;

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
            var geo = new THREE.Geometry();

            // Add vertices
            for (var i = 0; i < shape.vertices.length; i++) {
                var v = shape.vertices[i];
                geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
            }

            for (var i = 0; i < shape.faces.length; i++) {
                var face = shape.faces[i];

                // add triangles
                var a = face[0];
                for (var j = 1; j < face.length - 1; j++) {
                    var b = face[j];
                    var c = face[j + 1];
                    geo.faces.push(new THREE.Face3(a, b, c));
                }
            }
            geo.computeBoundingSphere();
            geo.computeFaceNormals();
            mesh = new THREE.Mesh(geo, material);
            break;

        case CANNON.Shape.types.TRIMESH:
            var geometry = new THREE.Geometry();

            var v0 = new CANNON.Vec3();
            var v1 = new CANNON.Vec3();
            var v2 = new CANNON.Vec3();
            for (var i = 0; i < shape.indices.length / 3; i++) {
                shape.getTriangleVertices(i, v0, v1, v2);
                geometry.vertices.push(
                    new THREE.Vector3(v0.x, v0.y, v0.z),
                    new THREE.Vector3(v1.x, v1.y, v1.z),
                    new THREE.Vector3(v2.x, v2.y, v2.z)
                );
                var j = geometry.vertices.length - 3;
                geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
            }
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            mesh = new THREE.Mesh(geometry, material);
            break;

        default:
            throw "Visual type not recognized: " + shape.type;
    }

    mesh.receiveShadow = true;
    mesh.castShadow = true;
    if (mesh.children) {
        for (var i = 0; i < mesh.children.length; i++) {
            mesh.children[i].castShadow = true;
            mesh.children[i].receiveShadow = true;
            if (mesh.children[i]) {
                for (var j = 0; j < mesh.children[i].length; j++) {
                    mesh.children[i].children[j].castShadow = true;
                    mesh.children[i].children[j].receiveShadow = true;
                }
            }
        }
    }

    mesh.receiveShadow = true;
    mesh.castShadow = true;

    scene.add(mesh);

    return mesh;
}