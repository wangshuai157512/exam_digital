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
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import Stats from 'three/addons/libs/stats.module.js';//Stats性能监视器
//  引入GUI js库
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as TWEEN from 'three/addons/libs/tween.module.js';

import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

// import * as CANNON from 'three/addons/cannon/cannon-es.js';
// import CannonDebugger from 'three/addons/cannon/cannon-es-debugger.js';

/**
 * author ： jx
 * description : digitalTwin3D
 */


var tempZ = "-90.89";

var mesh_car;
var test_car;

// 定义车模型、场景模型
let camera, controls, scene, labelRenderer, D3Render, tooltipContainer,
    followCar, sceneModel, scenePzModel, mesh_test, rigidBody,
    stats, renderer, clock, curCategory, trackPlaybackCar, sceneCenterMesh;
var boundaryBox;// 边界盒子
var poQiBoundaryBoxs = [];// 坡起边界盒子
var lineArray = []; // 科目三线路
var examProjectDataArray;// 考试项目数据
var warnInfoObj;// 预警信息数据
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

var allBuildListArray = [];
var buildMap = new Map();
var buildStateMap = new Map();
var separateBuildState = true;// 记录每次点击操作动作的状态，上次动作未结束不允许进行下一次动作
var composer;
var outlinePass;

// 物理世界的一些变量r
var world;
var areaUiGroup = new THREE.Group(); // 考试区域UI组
var lineUiGroup = new THREE.Group(); // 考试区域中的线路UI组
const monitorUiGroup = new THREE.Group(); // 监控设备UI组
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
        show: false,
        warn: false
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

    // 改变的obj属性数据类型是布尔值，交互界面是单选框
    gui.add(obj, 'warn').name('预警').onChange(function (value) {
        // 点击单选框，控制台打印obj.bool变化
        console.log('obj.warn', value);
        if (value) {
            var obj = {
                "yjfl": "3",
                "sbbh": "" // 设备编号
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
    if (debug) {
        // materializationPhysics();           // 物理世界实体化
    }

}

// var testBoxBody;
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

    // var sphereShape = new CANNON.Box(new CANNON.Vec3(1 * 0.5, 1 * 0.5, 1 * 0.5));
    // var sphereBody = new CANNON.Body({ mass: 600, shape: sphereShape });
    // sphereBody.position.set(35.46546772598559, 10.799993736908672, 80.29761526603919);
    // world.addBody(sphereBody);



    // var sphereShape2 = new CANNON.Box(new CANNON.Vec3(1 * 0.5, 1 * 0.5, 1 * 0.5));
    // testBoxBody = new CANNON.Body({ mass: 600, shape: sphereShape2 });
    // testBoxBody.position.set(32.46546772598559, 10.799993736908672, 80.29761526603919);
    // world.addBody(testBoxBody);


}


var cannonDebugger;
// 物理世界实体化
// function materializationPhysics() {
//     cannonDebugger = CannonDebugger(scene, world);
// }

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

    mesh.name = "板子" + type;
    mesh.position.copy(pos);
    mesh.quaternion.copy(quat);

    // var rigidbody = createRigidBody2(mesh, pos, quat, mass);

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
        quaternion: quat // 初始角度
    });

    var boxShape = new CANNON.Box(new CANNON.Vec3(w / 2, l / 2, h / 2)); // 盒子形状

    rigidbody.addShape(boxShape); // 添加形状到刚体

    world.addBody(rigidbody); // 添加刚体到物理世界

    return rigidbody;
}

function createRigidBody2(model, pos, quat, mass) {



    var trimesh;
    var shape;

    var vertices = [];/* 顶点坐标数组 */
    var indices = []; // 空的索引数组

    if (model.geometry instanceof THREE.BufferGeometry) {

        // 如果使用BufferGeometry创建的模型
        var positionAttribute = model.geometry.getAttribute("position");

        if (positionAttribute !== undefined) {
            var vertexPositions = positionAttribute.array;

            // 输出每个顶点的坐标
            for (var i = 0; i < vertexPositions.length; i += 3) {
                var x = vertexPositions[i];
                var y = vertexPositions[i + 1];
                var z = vertexPositions[i + 2];

                // console.log("顶点", Math.floor(i / 3) + 1, "坐标：", x, y, z);
                // vertices.push(x * 0.01);
                // vertices.push(y * 0.01);
                // vertices.push(z * 0.01);

                vertices.push(new CANNON.Vec3(x * 0.01, y * 0.01, z * 0.01));
            }
        }


        // 通过遍历顶点坐标数组生成三角面的索引数据
        for (var i = 0; i < vertices.length / 3; i += 3) {
            // indices.push(i, i + 1, i + 2); // 顺序连接每个连续的三个顶点
            indices.push([i, i + 1, i + 2]); // 顺序连接每个连续的三个顶点
        }
    } else {

        model.traverse((child) => {

            if (child.isMesh && child.name.search(/Solid/) == -1 && child.name.search(/Cube019/) == -1 && child.name.search(/Cube020/) == -1 && child.name != 'Plane009') {

                child.castShadow = true;
                child.receiveShadow = true;
                // trimesh类型  不规则格点网  两个参数第一个是顶点参数， 第二个是索引
                // 新的CANNON.Trimesh class可用于trimesh碰撞。目前它仅限于球面和平面碰撞。

                if (child.geometry.attributes.position != null) {

                    if (child.geometry instanceof THREE.BufferGeometry) {
                        // 如果使用BufferGeometry创建的模型
                        var positionAttribute = child.geometry.getAttribute("position");

                        if (positionAttribute !== undefined) {
                            var vertexPositions = positionAttribute.array;

                            // 输出每个顶点的坐标
                            for (var i = 0; i < vertexPositions.length; i += 3) {
                                var x = vertexPositions[i];
                                var y = vertexPositions[i + 1];
                                var z = vertexPositions[i + 2];

                                // console.log("顶点", Math.floor(i / 3) + 1, "坐标：", x, y, z);
                                // vertices.push(x * 0.01);
                                // vertices.push(y * 0.01);
                                // vertices.push(z * 0.01);

                                vertices.push(new CANNON.Vec3(x * 0.01, y * 0.01, z * 0.01));
                            }
                        }


                        // 通过遍历顶点坐标数组生成三角面的索引数据
                        for (var i = 0; i < vertices.length / 3; i += 3) {
                            // indices.push(i, i + 1, i + 2); // 顺序连接每个连续的三个顶点
                            indices.push([i, i + 1, i + 2]); // 顺序连接每个连续的三个顶点
                        }
                    }


                }


            }
        })
    }
    // CannonJS的凸多面体ConvexPolyhedron
    // const bodyShape = new CANNON.ConvexPolyhedron({ vertices, indices });
    const bodyShape = new CANNON.ConvexPolyhedron(vertices, indices);

    // trimesh = new CANNON.Trimesh(
    //     vertices,
    //     indices
    // );
    // shape = new CANNON.ConvexPolyhedron({vertices, indices});

    // var boxShape = new CANNON.Box(new CANNON.Vec3(w / 2, l / 2, h / 2)); // 盒子形状

    var rigidbody = new CANNON.Body({
        mass: mass,
        position: new CANNON.Vec3(pos.x, pos.y, pos.z), // 位置
        quaternion: quat, // 初始角度
        shape: bodyShape,
        material: materialGreen
    });

    // rigidbody.addShape(trimesh); // 添加形状到刚体



    addVisual(rigidbody);

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
function createConvexPolyhedronRigidBody(model, pos, quat, mass) {

    // var compoundShape = new CANNON.Compound();

    var rigidBody;


    model.traverse((child) => {

        if (child.isMesh && child.name.search(/Solid/) == -1 && child.name.search(/Cube019/) == -1 && child.name.search(/Cube020/) == -1 && child.name != 'Plane009') {

            var vertices = [];/* 顶点坐标数组 */
            var indices = []; // 空的索引数组

            child.castShadow = true;
            child.receiveShadow = true;
            // trimesh类型  不规则格点网  两个参数第一个是顶点参数， 第二个是索引
            // 新的CANNON.Trimesh class可用于trimesh碰撞。目前它仅限于球面和平面碰撞。

            if (child.geometry.attributes.position != null) {

                if (child.geometry instanceof THREE.BufferGeometry) {
                    // 如果使用BufferGeometry创建的模型
                    var positionAttribute = child.geometry.getAttribute("position");

                    if (positionAttribute !== undefined) {
                        var vertexPositions = positionAttribute.array;

                        // 输出每个顶点的坐标
                        for (var i = 0; i < vertexPositions.length; i += 3) {
                            var x = vertexPositions[i];
                            var y = vertexPositions[i + 1];
                            var z = vertexPositions[i + 2];

                            // console.log("顶点", Math.floor(i / 3) + 1, "坐标：", x, y, z);
                            // vertices.push(x * 0.01);
                            // vertices.push(y * 0.01);
                            // vertices.push(z * 0.01);

                            vertices.push(new CANNON.Vec3(x * 0.01, y * 0.01, z * 0.01));
                        }
                    }


                    // 通过遍历顶点坐标数组生成三角面的索引数据
                    for (var i = 0; i < vertices.length / 3; i += 3) {
                        // indices.push(i, i + 1, i + 2); // 顺序连接每个连续的三个顶点
                        indices.push([i, i + 1, i + 2]); // 顺序连接每个连续的三个顶点
                    }
                }


            }

            const convexShape = new CANNON.ConvexPolyhedron(
                vertices,
                indices
            )
            // 创建刚体
            const convexBody = new CANNON.Body({
                // 刚体的质量mass，质量为0的物体为静止的物体
                mass: mass,
                // 刚体形状
                shape: convexShape,
                material: materialGreen
            })
            // 获取世界位置和旋转给到物理世界
            // Three.js获得世界坐标.getWorldPosition(target)   将值复制到参数target
            // 通过.getWorldScale(target )方法可以获得一个模型的世界缩放系数
            // 通过.getWorldQuaternion(THREE.Quaternion)方法可以获得一个模型的世界空间中旋转的四元数   传入的参数接收返回的四元数
            console.log(child.name, child.getWorldPosition(new THREE.Vector3()));

            // trimeshBody.position.copy(child.getWorldPosition(new THREE.Vector3()));
            convexBody.position.copy(pos);
            convexBody.quaternion.copy(quat);

            rigidBody = convexBody;

            // 添加刚体到物理世界
            world.addBody(rigidBody);

        }
    })

    return rigidBody;
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
var tempQuat;
// 设置固定的距离值
var cameraToCarDistance = 30;
function render() {

    stats.update(); //帧率显示

    world.step(1 / 60, 10);  //更新物理计算
    // Update the CannonDebugger meshes
    // cannonDebugger.update();
    updateCarPhysics();     //更新车辆位置

    // testBoxBody.position.x += 0.01;


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
    D3Render.render(scene, camera);// 3D渲染
    composer.render();

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
    // camera = new THREE.PerspectiveCamera(50, width / height, 0.000001, 6000);
    camera = new THREE.PerspectiveCamera(50, width / height, 0.002, 8000);
    // camera = new THREE.PerspectiveCamera(50, width / height, 0.002, 400000);

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

    // scene.background = null;

    // 创建一个三维坐标轴
    const axesHelper = new THREE.AxesHelper(300);
    if (debug) {
        scene.add(axesHelper);//添加三维坐标轴到场景中
    }
    // initAddExamProjectUI();
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
    // const skyGeometry = new THREE.SphereGeometry(2000, 200, 2000);

    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('./common/skyBox/skybox.png', function (textur) {
        textur.encoding = THREE.sRGBEncoding; // 设置颜色空间为sRGB
    });


    scene.background = texture;

}

// 初始化检测进入坡起触发器
function initShangPoTrigger() {

    poQiTriggerCoordinate.forEach(ele => {
        // 将 btBoxShape 的轮廓表示为 Three.js 的网格 为了看见刚体
        const boxGeometry = new THREE.BoxGeometry(ele.depth, ele.height, ele.width);
        const boxMesh = new THREE.Mesh(boxGeometry, materialGreen);
        boxMesh.position.set(ele.pos.position_x, ele.pos.position_y, ele.pos.position_z);
        boxMesh.name = ele.name;
        if (debug) {
            const sceneFolder_test = gui.addFolder(ele.remark + 'trigger');

            sceneFolder_test.add(boxMesh.position, 'x', -150, 150).name("X轴").step(0.01);
            sceneFolder_test.add(boxMesh.position, 'y', -150, 150).name("Y轴").step(0.01);
            sceneFolder_test.add(boxMesh.position, 'z', -150, 150).name("Z轴").step(0.01);
        }
        shangPoGroup.push(boxMesh);
        scene.add(boxMesh);
    })

}



// 初始化鼠标视角控制器
function initControls() {

    updateControlsTarget();

    // // 创建 Tween 动画
    // const rotationDamping = { x: 0, y: 0, z: 0 }; // 初始阻尼值
    // const targetDamping = { x: 0.5, y: 0.5, z: 0.5 }; // 目标阻尼值
    // const tween = new TWEEN.Tween(rotationDamping).to(targetDamping, 3000); // 设置动画时长为3秒
    // tween.onUpdate(() => {
    //     controls.rotateSpeed = rotationDamping.x; // 将阻尼值应用到旋转控制器的速度属性上
    // });
    // tween.start();

    camera.up.set(0, 1, 0); // 使用左手坐标系时，将 up 向量设置为 (0, 1, 0)

    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.maxDistance = maxDistances;// 缩放最大距离
    // controls.minDistance = minDistances;// 缩放最小距离

    // console.log("camera.position.y",camera.position.y);
    controls.enableDamping = true;
    controls.dampingFactor = 0.3;

    controls.zoomSpeed = 0.2;// 缩放阻尼
    controls.rotateSpeed = 0.1; // 将拖动速度设为原来的一半
    controls.panSpeed = 0.2; // 将拖动速度设为原来的一半

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


/** 考试项目相关 begin*/
var intervalId;
// 考试项目UI初始化添加
async function initAddExamProjectUI() {

    clearExamProjectUI();
    areaUiGroup.clear();




    /**
     * 根据考试项目显示对应不同的数据
     */
    if (examAreaCode) {

        var examAreaCodeArr = examAreaCode.split("-");

        if (examAreaCodeArr[1] == "2") {// 科目二初始化直接显示项目图标
            uiCoordinate.forEach(element => {

                // 创建包含文字的 HTML 元素
                var divContainerElement = document.createElement('div');
                divContainerElement.className = "imgContainerDiv";
                divContainerElement.id = element.class_id;
                var divElement = document.createElement('div');
                divElement.className = "imgDiv";
                var imgElement = document.createElement('img');
                imgElement.src = element.url;
                var spanElement = document.createElement('span');
                spanElement.innerHTML = element.code;
                spanElement.className = "codeSpan";

                // 创建 CSS2DObject 并设置样式
                divElement.append(imgElement);
                divElement.append(spanElement);
                divContainerElement.append(divElement);

                var imgObject = new CSS2DObject(divContainerElement);
                imgObject.position.set(
                    element.pos.position_x,
                    element.pos.position_y,
                    element.pos.position_z
                );
                imgObject.name = element.name;

                if (debug) {
                    const sceneFolder_test = gui.addFolder(element.name);
                    sceneFolder_test.close();
                    sceneFolder_test.add(imgObject.position, 'x', -1500, 1500).name("X轴").step(0.01);
                    sceneFolder_test.add(imgObject.position, 'y', -1500, 1500).name("Y轴").step(0.01);
                    sceneFolder_test.add(imgObject.position, 'z', -1500, 1500).name("Z轴").step(0.01);
                }

                divContainerElement.addEventListener('click', function (event) {
                    commonClick(this, element.name, imgObject);
                });

                // 鼠标移入事件监听
                divContainerElement.addEventListener('mouseover', function () {    // 通过接口获取科目三考试区域相关信息

                    var state = getSubjectState("", element.number);
                    commonMouseover(this, element.name.split("__")[2] + " - " + state, examAreaLableWidth, examAreaLableRight);
                });

                // 鼠标移出事件监听
                divContainerElement.addEventListener('mouseout', function () {
                    removeEleByClassName(this, "lable");
                });

                areaUiGroup.add(imgObject);

            });

            scene.add(areaUiGroup);

        } else if (examAreaCodeArr[1] == "3") {// 科目三初始化显示线路，点击线路之后再显示项目图标详情

            clearInterval(intervalId);
            examProjectDataArray = await top.getExamArea();

            examProjectDataArray.forEach(element => {

                // 配置的线路对象
                var lineObj = getValueByNestedKey(lines, element.id);
                if (lineObj) {
                    var geometry = new LineGeometry();
                    var pointArr = lineObj.pointArr;
                    geometry.setPositions(pointArr);
                    var material = new LineMaterial({
                        color: lineObj.rgb_color,
                        linewidth: lineObj.linewidth
                    });
                    material.resolution.set(window.innerWidth, window.innerHeight);
                    var line = new Line2(geometry, material);
                    line.computeLineDistances();

                    /**
                     * 初始化箭头
                     */
                    for (var i = 0; i < lineObj.arrowNum; i++) {
                        var geometry_Arrow = new LineGeometry();
                        var arrowParam = "arrow_" + i;
                        var arrow = lineObj[arrowParam];
                        geometry_Arrow.setPositions(arrow);
                        var material_Arrow = new LineMaterial({
                            color: lineObj.rgb_color,
                            linewidth: lineObj.linewidth
                        });
                        material_Arrow.resolution.set(window.innerWidth, window.innerHeight);
                        var line_Arrow = new Line2(geometry_Arrow, material_Arrow);
                        line_Arrow.computeLineDistances();

                        lineArray.push(line_Arrow);

                        scene.add(line_Arrow);
                    }

                    scene.add(line);


                    // 创建包含文字的 HTML 元素
                    var lineDivElement = document.createElement('div');
                    lineDivElement.className = "lineDiv";
                    lineDivElement.id = element.id;
                    var spanElement = document.createElement('span');
                    spanElement.innerHTML = element.name;
                    spanElement.className = "lineNameSpan";

                    spanElement.style.background = lineObj.bg_color;

                    // 创建 CSS2DObject 并设置样式
                    lineDivElement.append(spanElement);

                    var imgObject = new CSS2DObject(lineDivElement);
                    imgObject.position.set(
                        lineObj.pos.position_x,
                        lineObj.pos.position_y,
                        lineObj.pos.position_z
                    );
                    imgObject.name = element.name;

                    if (debug) {
                        const sceneFolder_test = gui.addFolder(element.name);
                        sceneFolder_test.close();
                        sceneFolder_test.add(imgObject.position, 'x', -1500, 1500).name("X轴").step(0.01);
                        sceneFolder_test.add(imgObject.position, 'y', -1500, 1500).name("Y轴").step(0.01);
                        sceneFolder_test.add(imgObject.position, 'z', -1500, 1500).name("Z轴").step(0.01);
                    }


                    lineDivElement.addEventListener('click', function (event) {
                        initSubjectThreeLine(element.id);
                        cameraPositionSet(element.id, null, null);
                        clearExamProjectLineUI();
                    });

                    lineUiGroup.add(imgObject);


                    // // 鼠标移入事件监听
                    // lineDivElement.addEventListener('mouseover', function () {
                    //     commonMouseover(this, element.name.split("__")[2], examAreaLableWidth, examAreaLableRight);
                    // });

                    // // 鼠标移出事件监听
                    // lineDivElement.addEventListener('mouseout', function () {
                    //     removeEleByClassName(this, "lable");
                    // });


                    // lineArray.add(imgObject);
                }

            })

            scene.add(lineUiGroup);

            intervalId = setInterval(async function () {
                if (top.getExamArea) {
                    examProjectDataArray = await top.getExamArea();
                }
            }, 5000);
        }

    }




}


/**
 * 初始化科目三每个路线图对应的图标
 * @param {线路号} lineNo 
 * @param {科目编码} number 
 */
function initSubjectThreeLine(lineNo, number) {


    clearExamProjectUI();
    uiCoordinate.forEach(element => {

        if (element.name.split("__")[0] == lineNo) {
            // 创建包含文字的 HTML 元素
            var divContainerElement = document.createElement('div');
            divContainerElement.className = "imgContainerDiv";
            divContainerElement.id = element.class_id;
            var divElement = document.createElement('div');
            divElement.className = "imgDiv";
            var imgElement = document.createElement('img');
            imgElement.src = element.url;
            var spanElement = document.createElement('span');
            spanElement.innerHTML = element.code;
            spanElement.className = "codeSpan";

            // 创建 CSS2DObject 并设置样式
            divElement.append(imgElement);
            divElement.append(spanElement);
            divContainerElement.append(divElement);

            var imgObject = new CSS2DObject(divContainerElement);
            imgObject.position.set(
                element.pos.position_x,
                element.pos.position_y,
                element.pos.position_z
            );
            imgObject.name = element.name;

            if (debug) {
                const sceneFolder_test = gui.addFolder(element.name);
                sceneFolder_test.close();
                sceneFolder_test.add(imgObject.position, 'x', -1500, 1500).name("X轴").step(0.01);
                sceneFolder_test.add(imgObject.position, 'y', -1500, 1500).name("Y轴").step(0.01);
                sceneFolder_test.add(imgObject.position, 'z', -1500, 1500).name("Z轴").step(0.01);
            }

            // 如果存在科目编码则直接跳转至对应科目
            if (number == element.number) {
                cameraPositionSet(lineNo, number, null);
                jumpIcon(divContainerElement);
            }


            divContainerElement.addEventListener('click', function (event) {
                commonClick(this, element.name, imgObject);
            });

            // 鼠标移入事件监听
            divContainerElement.addEventListener('mouseover', function () {

                var lineName = getLineName(lineNo);
                var state = getSubjectState(lineNo, number);
                commonMouseover(this, element.name.split("__")[2] + " - " + lineName + " - " + state, examAreaLableWidth, examAreaLableRight);
            });

            // 鼠标移出事件监听
            divContainerElement.addEventListener('mouseout', function () {
                removeEleByClassName(this, "lable");
            });

            areaUiGroup.add(imgObject);

        }


    });

    scene.add(areaUiGroup);

    if (!number) {
        cameraPositionSet(lineNo, null, null);
    }
}

/**
 * 根据线路号获取对应的线路名称
 * @param {线路号} lineNo 
 */
function getLineName(lineNo) {

    var lineName = '';
    if (examProjectDataArray) {
        examProjectDataArray.forEach(ele => {
            if (ele.id == lineNo) {
                lineName = ele.name;
            }
        })
    }
    return lineName;
}

/**
 * 根据科目编号查询对应科目状态
 * @param {所有科目的数组} data 
 * @param {要查询的线路号} lineNo
 * @param {要查询的科目编号} subjectNumber 
 */
function getSubjectState(lineNo, subjectNumber) {

    // console.log("examProjectDataArray", examProjectDataArray);

    var state = "空闲中";
    if (examProjectDataArray) {
        examProjectDataArray.forEach(ele => {
            if (lineNo && ele.id == lineNo) { // 线路号存在则说明是科目三
                ele.list.forEach(obj => {
                    if (obj.xmqym == subjectNumber && obj.occupy > 0) {
                        state = "占用";
                    }
                })
            } else {
                ele.list.forEach(obj => {
                    if (obj.xmqym == subjectNumber && obj.occupy > 0) {
                        state = "占用";
                    }
                })
            }
        })
    }
    return state;
}

// 切换类目清除考试项目UI
function clearExamProjectUI() {

    if (areaUiGroup) {
        // 从父元素中移除HTML标签
        areaUiGroup.children.forEach(ele => {
            var element = ele.element;
            element.remove();

            // 将CSS2DObject对象置为null，以便释放内存
            ele = null;
        });

        // var elements = document.getElementsByClassName("imgContainerDiv");
        // var eleLength = elements.length;
        // for (var i = 0; i < eleLength; i++) {
        //     if (elements[i] != null) {
        //         elements[i].remove();
        //     }
        // }
        scene.remove(areaUiGroup);
        areaUiGroup = new THREE.Group();
    }

    if (lineUiGroup) {
        lineUiGroup.children.forEach(ele => {
            var element = ele.element;
            element.remove();
            // element.parentNode.removeChild(element);

            // 将CSS2DObject对象置为null，以便释放内存
            ele = null;
        });

        scene.remove(lineUiGroup);
        lineUiGroup = new THREE.Group();

        lineArray.forEach(ele => {
            scene.remove(ele);
        })
    }

}

// 切换类目清除考试区域线路UI
function clearExamProjectLineUI() {

    lineUiGroup.children.forEach(ele => {
        var element = ele.element;
        element.remove();
        // element.parentNode.removeChild(element);

        // 将CSS2DObject对象置为null，以便释放内存
        ele = null;
    });
    scene.remove(lineUiGroup);

    lineArray.forEach(ele => {
        scene.remove(ele);
    })
}
/** 考试项目相关 end */


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
function asyncInsertCar(carTransFormVo, carExamInfoVo) {

    // 使用Promise封装加载过程
    return new Promise((resolve, reject) => {


        var carNo = carExamInfoVo.carType + "-" + carExamInfoVo.carId;

        var car = containsMeshWithName(carArray, carNo);
        if (car) {

            updateCar(carTransFormVo, carExamInfoVo);// 车辆移动
            carsMap.set(car.id, TimeUtils.getCurrentTime());// 更新车辆的时间戳，方便定时监测该车辆多久没有传递过信号

            resolve(null);
            // console.log("car.position", car.position);
        } else {


            /**
             *                ！ 
             *               ！！
             *              ！！！
             *             ！！！！
             *            ！！！！！
             *             ！！！！
             *              ！！！
             *               ！！
             *                ！
             * 此处后期要做优化，重复的车型模型只加载一次，使用clone方法创建新的车辆
             *                ！ 
             *               ！！
             *              ！！！
             *             ！！！！
             *            ！！！！！
             *             ！！！！
             *              ！！！
             *               ！！
             *                ！
             */

            // 检查模型是否已加载
            if (loadedModels.has(carNo)) {
                // console.log('模型已加载，忽略重复加载:', carNo);
                resolve(loadedModels.get(carNo));
                return;
            }

            // 在加载队列中添加模型名称
            const isLoading = loadedModels.get(carNo);
            if (isLoading) {
                // console.log('模型正在加载中，请稍候:', carNo);
                isLoading.then(resolve).catch(reject);
                return;
            }
            // 重复的车辆模型只加载一次，车型-车号 为一个唯一的模型
            const loadingPromise = new Promise((innerResolve, innerReject) => {

                // 加载车辆模型
                loader.load(carModelUrl.replace("EXAMAREACODE", examAreaCode).replace("CARTYPE", carExamInfoVo.carType.toUpperCase()), (model) => {


                    // 车辆沿Y轴旋转90度 面向前方
                    // const q = new THREE.Quaternion(0, 0, 0, 1);
                    // q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / rotationMulti);

                    // 车辆朝向
                    var euler = new THREE.Euler(0, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 0, 'YXZ'); // 使用字符串表示旋转顺序
                    const q = new THREE.Quaternion(0, 0, 0, 1);
                    // q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
                    q.setFromEuler(euler);

                    // 获取模型的长宽高
                    // var modelWHDObj = modelWHDCalculate(model, 1);
                    var modelWHDObj = modelWHDCalculate(model, 0.01);

                    //设置模型缩放100倍 因为导入模型的单位和three.js的单位不一样
                    model.scale.set(0.01, 0.01, 0.01);

                    // console.log("车辆模型", model);





                    /**
                     * 优化一下，之前时都默认加了掉落的高度，此处检测模型是否在坡起范围，如果在坡起范围增加否则不增加
                    */
                    // var posy = carTransFormVo.posy + 15;
                    var posy = carTransFormVo.posy;
                    model.position.set(1 * carTransFormVo.posx, carTransFormVo.posy, -1 * (carTransFormVo.posz));
                    // model.position.set(1 * carTransFormVo.posx, carTransFormVo.posy, -1 * (tempZ));
                    var inPoQi = boundaryBoxContainObject(poQiBoundaryBoxs, model);
                    if (inPoQi) {
                        posy = 3.5;
                    }

                    model.position.set(1 * carTransFormVo.posx, posy, -1 * (carTransFormVo.posz + c1CarCheckZ));
                    // model.position.set(1 * carTransFormVo.posx, posy, -1 * (tempZ));
                    model.rotation.set(1 * carTransFormVo.eurx, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 1 * carTransFormVo.eurz);

                    // 模型的名字为 车辆的ID
                    model.name = carTransFormVo.carId;

                    model.rotation.order = 'YZX';// 旋转方向

                    model.userData = carExamInfoVo;
                    var ojj = scene.getObjectByName("sceneMain");
                    // ojj.visible = false;


                    // var bod = createConvexPolyhedronRigidBody(model, model.position, q, 0);

                    if (debug) {

                        mesh_car = new THREE.Mesh(
                            new THREE.BoxGeometry(modelWHDObj.width, modelWHDObj.height, modelWHDObj.depth, 1, 1, 1),
                            materialGreen
                        );

                        // var pos = new THREE.Vector3(-76.7930178195, 10, - (tempZ - 0.91) );
                        // var pos = new THREE.Vector3(model.position.x, model.position.y, model.position.z);
                        var pos = new THREE.Vector3(model.position.x, model.position.y, model.position.z);
                        var rota = new THREE.Vector3(0, -0.012217304763960109, 0);
                        mesh_car.position.set(pos.x, pos.y, pos.z);
                        mesh_car.rotation.set(rota.x, rota.y, rota.z);


                        // scene.add(mesh_car);

                        const sceneFolder_test = gui.addFolder('Car');
                        // sceneFolder_test.close();

                        sceneFolder_test.add(mesh_car.position, 'x', -150, 150).name("X轴").step(0.01);
                        sceneFolder_test.add(mesh_car.position, 'y', -150, 150).name("Y轴").step(0.01);
                        sceneFolder_test.add(mesh_car.position, 'z', -150, 150).name("Z轴").step(0.01);

                        sceneFolder_test.add(mesh_car.rotation, 'x', -150, 150).name("旋转X轴").step(0.01);
                        sceneFolder_test.add(mesh_car.rotation, 'y', -150, 150).name("旋转Y轴").step(0.01);
                        sceneFolder_test.add(mesh_car.rotation, 'z', -150, 150).name("旋转Z轴").step(0.01);
                    }

                    // 将模型添加到场景中
                    models.push(model);

                    //车辆添加图标
                    insertCarUI(model);

                    scene.add(model);

                    carsMap.set(model.id, TimeUtils.getCurrentTime());//  更新车辆的时间戳，方便定时监测该车辆多久没有传递过信号

                    // initPhysicsCar(model, ZERO_QUATERNION, w, h, l);


                    /**
                     * 删除历史刚体
                     */
                    var existBody = rigidBodyMap.get(model.name);
                    if (existBody) {
                        removeRigiBody(existBody);
                    }

                    // 创建 Cannon.js 刚体和形状
                    // c1CarCheck为需要校正的距离 说明看对应的config.js
                    var resultPos = new THREE.Vector3(model.position.x, model.position.y, model.position.z + c1CarCheckZ);
                    // model.position.set(resultPos.x, resultPos.y, resultPos.z);
                    // var carBody = createRigidBody(resultPos, q, modelWHDObj.width, modelWHDObj.height, modelWHDObj.depth, 0, "car");
                    // var carBody = createRigidBody(resultPos, q, modelWHDObj.width, modelWHDObj.height, modelWHDObj.depth, 500, "car"); // 展示mesh
                    var carBody = createRigidBody(resultPos, q, modelWHDObj.width, modelWHDObj.height, modelWHDObj.depth, 500); // 不展示mesh

                    // var carBody = createConvexPolyhedronRigidBody(model, resultPos, q, 1);
                    // var carBody = createRigidBody2(model, resultPos, q, 501);


                    // 车辆以及对应的刚体
                    rigidBodyMap.set(model.name, carBody);
                    carEnterPoQiMap.set(model.name, false);

                    // 将刚体显示出来
                    if (debug) {
                        // var bodyMesh = addVisual(carBody, null);

                        // bodyMesh.position.copy(resultPos);
                        // bodyMesh.rotation.copy(model.rotation);
                    }


                    // const pos = geometry.attributes.position;
                    // for (let i = 0; i < pos.count; i++) {
                    //     const x = pos.getX(i);
                    //     const y = pos.getY(i);
                    //     const z = pos.getZ(i);
                    //     vertices.push(new CANNON.Vec3(x, y, z));
                    // }
                    // for (let i = 0; i < pos.count; i = +3) {
                    //     faces.push([i, i + 1, i + 2]);
                    // }


                    // 将加载的模型添加到已加载模型的缓存中
                    loadedModels.set(model.name, model);


                    // 返回模型数组和重复项判断结果
                    resolve(model);

                    // console.log("model.position" , model.position);
                    // console.log("mesh_car.position" , mesh_car.position);
                    // console.log("carBody.position" , carBody.position);

                }, (event) => {
                    // 控制台打印加载进度
                    console.log((event.loaded / event.total * 100) + '% loaded2');
                }, (error) => {
                    // 控制台打印加载失败
                    console.error(error);
                });


                // 加载车辆刚体模型
                // loader.load(carRigidBodyModelUrl.replace("EXAMAREACODE", examAreaCode).replace("CARTYPE", carExamInfoVo.carType.toUpperCase()), (model2) => {

                //     // 车辆沿Y轴旋转90度 面向前方
                //     // const q = new THREE.Quaternion(0, 0, 0, 1);
                //     // q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / rotationMulti);
                //     console.log("车辆刚体加载...");
                //     // 车辆朝向
                //     var euler = new THREE.Euler(0, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 0, 'YXZ'); // 使用字符串表示旋转顺序
                //     const q = new THREE.Quaternion(0, 0, 0, 1);
                //     // q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
                //     q.setFromEuler(euler);


                //     //设置模型缩放100倍 因为导入模型的单位和three.js的单位不一样
                //     model2.scale.set(0.01, 0.01, 0.01);

                //     // console.log("车辆模型", model);


                //     /**
                //      * 优化一下，之前时都默认加了掉落的高度，此处检测模型是否在坡起范围，如果在坡起范围增加否则不增加
                //     */
                //     // var posy = carTransFormVo.posy + 15;
                //     var posy = carTransFormVo.posy;
                //     model2.position.set(1 * carTransFormVo.posx, carTransFormVo.posy, -1 * (carTransFormVo.posz));
                //     // model.position.set(1 * carTransFormVo.posx, carTransFormVo.posy, -1 * (tempZ));
                //     var inPoQi = boundaryBoxContainObject(poQiBoundaryBoxs, model2);
                //     if (inPoQi) {
                //         posy = 3.5;
                //     }

                //     model2.position.set(1 * carTransFormVo.posx, posy, -1 * (carTransFormVo.posz + c1CarCheckZ));
                //     // model.position.set(1 * carTransFormVo.posx, posy, -1 * (tempZ));
                //     model2.rotation.set(1 * carTransFormVo.eurx, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 1 * carTransFormVo.eurz);

                //     // 模型的名字为 车辆的ID
                //     model2.name = carTransFormVo.carId;

                //     model2.rotation.order = 'YZX';// 旋转方向

                //     model2.userData = carExamInfoVo;

                //     // var bod = createConvexPolyhedronRigidBody(model2, model2.position, q, 1);

                //     // scene.add(model2);

                //     // console.log("model2", model2);

                // }, (event) => {
                //     // 控制台打印加载进度
                //     console.log((event.loaded / event.total * 100) + '% loaded2');
                // }, (error) => {
                //     // 控制台打印加载失败
                //     console.error(error);
                // });
            })

            // 添加标志到加载中模型缓存中
            loadedModels.set(carNo, loadingPromise);

            // 返回加载完成的Promise对象
            loadingPromise.then(resolve).catch(reject);

        }
    });
}

// 创建一个map，用于保存已加载的模型
const loadedModelsByTrack = new Map();

// 更新车辆物理刚体的位置
function updateCarPhysics() {


    // if (trackPlaybackFlag) {
    // rigidBodyMap_trackPlayback.forEach((body, carName) => {
    // const car = scene.getObjectByName(carName);

    // if (body && car) {
    // car.position.copy(body.position);// 车辆模型与物理车辆模型位置同步
    // car.quaternion.copy(body.quaternion);// 车辆模型与物理车辆模型位置同步

    // 此处检测是否进入坡起
    // var carBox = new THREE.Box3().setFromObject(car);
    // shangPoGroup.forEach(obj => {
    // var triggerBox = new THREE.Box3().setFromObject(obj);
    // if (carBox.intersectsBox(triggerBox) && !carEnterPoQiMap_trackPlayback.get(carName) && obj.name == "shangpo") {

    // 如果发生碰撞，执行相应的处理逻辑
    // if (debug) {
    // console.log("准备上坡！");
    // }


    // carEnterPoQiMap_trackPlayback.set(carName, true);
    // } else if (carBox.intersectsBox(triggerBox) && carEnterPoQiMap_trackPlayback.get(carName) && obj.name == "xiapo") {

    // if (debug) {
    // console.log("驶离坡起！");
    // }
    // carEnterPoQiMap_trackPlayback.set(carName, false);
    // }
    // })

    // }

    // });
    // } else {
    rigidBodyMap.forEach((body, carName) => {
        const car = scene.getObjectByName(carName);
        if (body && car) {

            // console.log("body.position", body.position);
            // console.log("body.quaternion", body.quaternion);
            car.position.copy(body.position);// 车辆模型与物理车辆模型位置同步
            car.quaternion.copy(body.quaternion);// 车辆模型与物理车辆模型位置同步

            // mesh_car.position.set(body.position.x, body.position.y, body.position.z + c1CarCheck);
            // mesh_car.quaternion.copy(body.quaternion);

            // 此处检测是否进入坡起
            var carBox = new THREE.Box3().setFromObject(car);
            shangPoGroup.forEach(obj => {
                var triggerBox = new THREE.Box3().setFromObject(obj);
                if (carBox.intersectsBox(triggerBox) && !carEnterPoQiMap.get(carName) && obj.name == "shangpo") {

                    // 如果发生碰撞，执行相应的处理逻辑
                    if (debug) {
                        console.log("准备上坡！");
                    }


                    carEnterPoQiMap.set(carName, true);
                } else if (carBox.intersectsBox(triggerBox) && carEnterPoQiMap.get(carName) && obj.name == "xiapo") {

                    if (debug) {
                        console.log("驶离坡起！");
                    }
                    carEnterPoQiMap.set(carName, false);
                }
            })

            // console.log("bodyPosition",body.position);
        }

    });
    // }

}

// 正常协议推送更改刚体位置
function updateRigidBodyMap(car, pos, quaternion) {
    if (car) {
        var body = rigidBodyMap.get(car.name);
        if (body) {
            tempZ -= 0.5;

            pos.y = body.position.y;

            body.position.copy(pos);
            var inPoQi = boundaryBoxContainObject(poQiBoundaryBoxs, car);
            var enterPoQi = carEnterPoQiMap.get(car.name);
            if (inPoQi || enterPoQi) {
                // console.log("坡起范围内");
                // body.quaternion.copy(quaternion);

            } else {
                body.quaternion.copy(quaternion);
                // console.log("不在坡起范围内");
            }
        }
    }
}

/**
 * 更新车辆信息
 * @param {考试车辆坐标信息} carTransFormVo 
 * @param {考试车辆基本信息} carExamInfoVo 
 */
function updateCar(carTransFormVo, carExamInfoVo) {

    //carId 就是 car名称 car.name是模型的名称 车型-序号组成名称 示例：C1-01 
    var carId = carTransFormVo.carId;

    carArray.forEach(car => {
        if (car.name == carId) {

            // 更新坐标
            if (debug) {

                // car.position.set(carTransFormVo.posx, car.position.y, -1 * (carTransFormVo.posz));
                // car.rotation.set(0, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 0);

            }

            // 初始化第一获取到的协议角度
            var euler = new THREE.Euler(0, -1 * THREE.MathUtils.degToRad(carTransFormVo.eury), 0, 'YXZ'); // 使用字符串表示旋转顺序

            // 将 y 角度限制在范围内（例如 -180 到 180）
            if (euler.y > Math.PI) {
                euler.y -= 2 * Math.PI;
            } else if (euler.y < -Math.PI) {
                euler.y += 2 * Math.PI;
            }

            var quaternion = new THREE.Quaternion();
            // quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -1 * THREE.MathUtils.degToRad(carTransFormVo.eury) );
            // quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

            quaternion.setFromEuler(euler);


            updateRigidBodyMap(
                car,
                new THREE.Vector3(carTransFormVo.posx, car.position.y, -1 * (carTransFormVo.posz)),
                // new THREE.Vector3(carTransFormVo.posx, car.position.y, -1 * (tempZ)),
                quaternion
            );


            // 更新车辆信息
            car.userData = carExamInfoVo;

            // 车辆和人绑定，换人需要更新UI 或者车辆状态变化，也同样更换UI
            if (carPersonalMap.has(carId) || carStateMap.has(carId)) {
                var oldPersonalName = carPersonalMap.get(carId);//获取人车map如果对应车辆的人的名字发生变化，更新车辆图标
                var oldState = carStateMap.get(carId);

                if ((oldPersonalName != carExamInfoVo.examineeName) || (oldState != carExamInfoVo.examState)) {

                    carPersonalMap.set(carId, carExamInfoVo.examineeName);
                    carStateMap.set(carId, carExamInfoVo.examState);

                    //更新车辆图标以及lable信息 顺序不要放到下面，因为里面会先清除，后添加
                    insertCarUI(car);
                }

            }

            // 更换车辆状态



            // 展示扣分信息
            showDeduct(car, carExamInfoVo.deduct);
        }
    })

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

// 定时任务判断当前车辆协议是否中断，中断超过指定时间，则将该车辆隐藏
function hideCarJob() {
    // 遍历Map对象中的键值对
    if (carsMap.size > 0) {
        carsMap.forEach(function (value, key) {
            if (parseInt(TimeUtils.getCurrentTime()) - parseInt(value) > carRefreshTime) {
                deleteCarById(key);
            } else {
                showCar(key);
            }
        });
    }

}

// 隐藏车辆 同时隐藏对应UI
function hideCar(id) {

    if (id) {
        carArray.forEach(car => {
            if (car.id == id) {
                var carUI = document.getElementById(id);
                if (carUI) {

                    car.visible = false;
                    cleanCarUI(car);
                }

            }
        })
    }
}

// 显示车辆
function showCar(id) {
    if (id) {
        carArray.forEach(car => {
            if (car.id == id && !car.visible) {
                car.visible = true;
                insertCarUI(car);
            }
        })
    }
}

function deleteCarById(id) {

    carArray.forEach(function (car, index) {
        if (car.id == id) {
            // 删除元素
            carArray.splice(index, 1);
            loadedModels.delete(car.name); // 删除模型map中存储的车辆
            scene.remove(car);
            cleanCarUI(car);

            var existBody = rigidBodyMap.get(car.name);
            //删除车辆刚体
            if (existBody) {
                removeRigiBody(existBody);
            }
        }

    })
}

/**
 * 删除所有车辆以及对应刚体
 */
function deleteCar() {
    carArray.forEach(car => {
        cleanCarUI(car);
        loadedModels.delete(car.name); // 删除模型map中存储的车辆
        scene.remove(car);

        var existBody = rigidBodyMap.get(car.name);
        //删除车辆刚体
        if (existBody) {
            removeRigiBody(existBody);
        }
    });
    carArray.splice(0, carArray.length);

}

// 隐藏所有车辆
function hideAllCar() {

    carsMap.clear(); // 清空 Map 对象
    carEnterPoQiMap.clear();
    carEnterPoQiMap_trackPlayback.clear();
    loadedModels.clear();
    deleteCar();
    rigidBodyMap.clear(); // 清空 Map 对象

}

// 显示所有车辆
function showAllCar() {
    carArray.forEach(car => {
        if (!car.visible) {
            car.visible = true;
            insertCarUI(car);
        }
    })
}

// 考试车辆UI初始化加载
function initAddExamCarUI() {

    clearExamCarUI();
    carArray.forEach(element => {

        insertCarUI(element);
    });

    optimizeCarState();

}

// 添加车辆UI 和添加考试人员UI共用
function insertCarUI(car) {


    cleanCarUI(car);
    // 车辆基本信息
    var carExamInfo = car.userData;

    if (carExamInfo && car.visible) {

        var carStateObj = backCarState(carExamInfo.carType, carExamInfo.examState, carExamInfo.examScore, carExamInfo.subjectType);

        if (carStateObj) {

            switch (curCategory) {// 当前所处分类

                case EXAMCAR:

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


                    break;
                case EXAMPERSONAL:

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
                    } else {
                        if (carExamInfo.examState != 0) {
                            // 创建包含文字的 HTML 元素
                            var divElement = document.createElement('div');
                            divElement.className = "personalDiv";
                            divElement.id = car.id;
                            divElement.style.left = "0px";
                            divElement.style.top = "-70px";
                            var imgElement = document.createElement('img');
                            imgElement.src = carStateObj.url_personal;
                            var spanElement = document.createElement('span');
                            spanElement.innerHTML = carExamInfo.examineeName + " " + carExamInfo.carType + "-" + carExamInfo.carId;
                            spanElement.className = "personalSpan";

                            // 创建 CSS2DObject 并设置样式
                            divElement.append(imgElement);
                            divElement.append(spanElement);

                            var imgObject = new CSS2DObject(divElement);

                            /**
                             * personal__Str1__Str2 解释
                             * personal代表是考试人员的模块 固定方便后面从这个名称中获取对应的类型
                             * Str1 是考试人员的身份证号码
                             * Str2 由5部分组成 考生名字 车型-车号 当前考试分数 车辆状态
                             *  */
                            var name = "personal__" +
                                carExamInfo.identityID + "__" +
                                carExamInfo.examineeName + " " + carExamInfo.carType + "-" + carExamInfo.carId + " " + carExamInfo.examScore + "分 - " + (carStateObj.examStateName == "已分配" ? "已上车" : carStateObj.examStateName);

                            imgObject.name = name;

                            // 添加入组，方便操作
                            carStateUiGroup.push(imgObject);

                            car.add(imgObject);

                            divElement.addEventListener('click', function (event) {
                                // 处理点击事件的代码
                                commonClick(this, name);
                            });

                            // 鼠标移入事件监听
                            divElement.addEventListener('mouseover', function () {
                                commonMouseover(this, name.split("__")[2], examPersonalWidth, examPersonalRight);
                            });

                            // 鼠标移出事件监听
                            divElement.addEventListener('mouseout', function () {
                                removeEleByClassName(this, "lable");
                            });

                        }
                    }

                    break;
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


    const arr = document.getElementsByClassName(car.name);
    const l = arr.length;
    for (let i = l - 1; i >= 0; i--) {
        if (arr[i] != null) {
            arr[i].parentNode.removeChild(arr[i]);
        }
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
 * @param {科目类型} subjectType 
 * @returns 
 */
function backCarState(carType, state, score, subjectType) {

    var obj = {};
    /**
     * 状态为结束时，计算分数小于90并且是大型车或其他车辆小于80 考试状态标记为不合格 
     */
    if (state == 3 && ((score < 90 && (carType == "A1" || carType == "A2" || carType == "A3" || carType == "B1" || carType == "B2" || subjectType == "3")) || score < 80)) {// 不及格
        // 设置属性
        obj.examStateName = carState.unqualified.name;
        obj.url = carState.unqualified.url;
        obj.url_shan = carState.unqualified.url_shan;
        obj.url_personal = carState.unqualified.url_personal;

    } else if (state == 3 && ((score >= 90 && (carType == "A1" || carType == "A2" || carType == "A3" || carType == "B1" || carType == "B2" || subjectType == "3")) || score >= 80)) {// 及格
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


/** 考试人员 begin */
// 考试人员UI初始化加载
function initAddExamPersonalUI() {

    clearExamPersonalUI();

    carArray.forEach(element => {

        insertCarUI(element);
    });

    optimizeCarState();

}

// 切换类目清除考试人员UI
function clearExamPersonalUI() {

    var carStateGroup = new THREE.Group();
    // 从父元素中移除HTML标签
    carArray.forEach(ele => {
        ele.children.forEach(e => {
            if (e.name.indexOf("personal") > -1) {

                carStateGroup.add(e);
                var element = e.element;
                element.remove();

                // 将CSS2DObject对象置为null，以便释放内存
                e = null;
            }
        })
    })
    scene.remove(carStateGroup);
}

/** 考试人员 end */



/** 监控设备 begin */

var preParam;
/**
 * 监控设备UI初始化加载
 * @param {初始化监控设备需要传入设备的状态} param 
 */
function initAddMonitorUI(param) {

    clearMonitorUI();

    // const cameraFolder = gui.addFolder('');
    // cameraFolder.close();

    // if (monitorUiGroup.children.length > 0) {
    //     scene.add(monitorUiGroup);
    // } else {
    // 因为监控设备可能存在故障情况，故每次都拿最新的数据，不做本地存储
    if (param || preParam) {

        /**
         * 临时保存，如果没有通过UI那边传递过来，获取上一次的记录，并赋值给param
         */
        preParam = param;
        if (!param && preParam) {
            param = preParam;
        }

        // param = [
        //     {
        //         "number": "FK000072Y002013",
        //         "name": "直角转弯1",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002014",
        //         "name": "直角转弯2",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002015",
        //         "name": "直角转弯3",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002019",
        //         "name": "倒车入库1",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002020",
        //         "name": "倒车入库2",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002021",
        //         "name": "倒车入库3",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002022",
        //         "name": "倒车入库4",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002023",
        //         "name": "倒车入库5",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002024",
        //         "name": "倒车入库6",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002025",
        //         "name": "倒车入库7",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002026",
        //         "name": "倒车入库8",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002027",
        //         "name": "倒车入库9",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002028",
        //         "name": "倒车入库10",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002016",
        //         "name": "曲线行驶1",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002017",
        //         "name": "曲线行驶2",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002018",
        //         "name": "曲线行驶3",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002001",
        //         "name": "侧方停车1",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002002",
        //         "name": "侧方停车2",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002003",
        //         "name": "侧方停车3",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002004",
        //         "name": "侧方停车4",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002005",
        //         "name": "侧方停车5",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002006",
        //         "name": "侧方停车6",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002007",
        //         "name": "侧方停车7",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002008",
        //         "name": "侧方停车8",
        //         "state": "0"
        //     },
        //     {
        //         "number": "FK000072Y002009",
        //         "name": "坡道行驶1",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002010",
        //         "name": "坡道行驶2",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002011",
        //         "name": "坡道行驶3",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002012",
        //         "name": "坡道行驶4",
        //         "state": "1"
        //     },
        //     {
        //         "number": "FK000072Y002029",
        //         "name": "全景",
        //         "state": "1"
        //     }
        // ];


        // 清除原始监控设备UI数组
        monitorUiGroup.clear();

        // 展示所有的监控设备
        param.forEach(p => {
            var monitorNumber = p.number;   // 设备序号
            var monitorName = "monitor__" + monitorNumber + "__" + p.name;   // 设备名称
            var monitorState = p.state; // 设备状态

            // 设备UI位置
            var positionObj;
            positionObj = getValueByNestedKey(uiMonitor, monitorNumber);

            if (positionObj) {

                // 创建包含文字的 HTML 元素
                var divContainerElement = document.createElement('div');
                divContainerElement.className = "imgContainerDiv";
                divContainerElement.id = positionObj.class_id;
                var divElement = document.createElement('div');
                divElement.className = "imgDiv";
                var imgElement = document.createElement('img');
                if (monitorState == "1") { // 设备正常
                    imgElement.src = uiMonitor.image.url_normal;
                } else {// 设备故障
                    imgElement.src = uiMonitor.image.url_fault;
                }

                // 创建 CSS2DObject 并设置样式
                divContainerElement.append(divElement);
                divElement.append(imgElement);

                var imgObject = new CSS2DObject(divContainerElement);
                imgObject.position.set(
                    positionObj.pos.position_x,
                    positionObj.pos.position_y,
                    positionObj.pos.position_z
                );
                if (debug) {


                    const cameraFolder = gui.addFolder('监控设备');
                    cameraFolder.add(imgObject.position, 'x', -1500, 1500).name(monitorName.split("__")[2] + "角度X轴").step(0.1);
                    cameraFolder.add(imgObject.position, 'y', -1500, 1500).name(monitorName.split("__")[2] + "角度Y轴").step(0.1);
                    cameraFolder.add(imgObject.position, 'z', -1500, 1500).name(monitorName.split("__")[2] + "角度Z轴").step(0.1);
                }
                imgObject.name = monitorName;


                var quanJingState = false;
                if (positionObj.class_id.indexOf("quanjing") > -1) {
                    quanJingState = true;
                }

                // 鼠标点击事件
                divContainerElement.addEventListener('click', function (event) {

                    commonClick(this, monitorName, sceneCenterMesh, quanJingState);
                });

                // 鼠标移入事件监听
                divContainerElement.addEventListener('mouseover', function () {
                    commonMouseover(this, monitorName.split("__")[2], examAreaLableWidth, examAreaLableRight);
                });

                // 鼠标移出事件监听
                divContainerElement.addEventListener('mouseout', function () {
                    removeEleByClassName(this, "lable");
                });

                monitorUiGroup.add(imgObject);
            }


        })

        scene.add(monitorUiGroup);
    } else {

        alert("未检测到监控设备");
    }

    // }

}

// 切换类目清除监控设备UI
function clearMonitorUI() {

    // 从父元素中移除HTML标签
    monitorUiGroup.children.forEach(ele => {
        var element = ele.element;
        element.remove();
        // element.parentNode.removeChild(element);

        // 将CSS2DObject对象置为null，以便释放内存
        ele = null;
    })
    scene.remove(monitorUiGroup);
}

/** 监控设备 end */



/** 通用以及一些工具类 begin */
// 标签通用跳转，根据传入参数判断
function commonClick(_this, name, obj, isQuanJing) {

    var bakParam = backExamType(name);
    var arr = name.split("__");
    if (bakParam == "examProject") {   // 跳转考试区域

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
    } else {

        cameraPositionSet(name, null, obj, isQuanJing);
    }

}

/**
 * 相机位置初始化设置
 * @param {配置文件中的key} type 
 * @param {配置文件中可能存在的二级key} number 
 * @param {3D模型对象} obj 
 * @param {全景类型} isQuanJing 
 * @param {动画事件} time
 * 在areaPosition.json文件中具体查看，coordinate来自areaPosition
 * 示例及字段释义：
 * type = daoku/poqi/cefang/quxian/zhijiao/init（初始化重置位置）等为必填 也有可能是监控设备的视频序号
 * number = 具体倒库/坡起/侧方/曲线/直角的编号
 * obj = 目标对象 里面有一些对应的坐标以及角度 可能用不到
 * isQuanJing = 是否全景
 */
function cameraPositionSet(type, number, obj, isQuanJing, time) {

    // controls.reset();
    var tm = 2000;
    if (time) {
        tm = time;
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
            if (kaotaiObj) {
                targetPos = getValueByNestedKey(kaotaiObj, type);
            }

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


    } else {

        console.log("未配置此项坐标：" + type + "." + number);
        if (debug) {
            alert("未配置此项坐标：" + type + "." + number);
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


// 切换类目清除 除传入type外其余UI
function clearUI(type) {

    switch (type) {
        case "main":

            clearExamProjectUI();
            clearExamCarUI();
            clearExamPersonalUI();
            clearMonitorUI();
            removeComposer();
            buildReset();
            createAllLable();
            break;
        case "examProject":
            clearExamCarUI();
            clearExamPersonalUI();
            clearMonitorUI();
            removeComposer();
            buildReset();
            createAllLable();
            break;
        case "examCar":
            clearExamProjectUI();
            clearExamPersonalUI();
            clearMonitorUI();
            removeComposer();
            buildReset();
            createAllLable();
            break;
        case "examPersonal":
            clearExamProjectUI();
            clearExamCarUI();
            clearMonitorUI();
            removeComposer();
            buildReset();
            createAllLable();
            break;
        case "examMonitor":
            clearExamProjectUI();
            clearExamCarUI();
            clearExamPersonalUI();
            removeComposer();
            buildReset();
            createAllLable();
            break;
        default:
            removeComposer();
            buildReset();
            createAllLable();
    }

}

// 判断返回是哪个类目类型字符串 例：考试区域 考试车辆 考生人员 监控设备
function backExamType(param) {

    var examProjectType = "zhijiao,daoku,quxian,cefang,poqi,quanjing";
    var examCarType = "carState";
    var examPersonalType = "personal";
    var examMonitorType = "monitor";
    if (param) {

        var paramArray = param.split("__");
        if (examProjectType.indexOf(paramArray[0]) > -1 || curCategory == "examProject") {
            return "examProject";
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
 * 加载标签 暂时不用留着，如果有别的不是鼠标放上也需要显示标签的地方用
 * @param {当前DOM} _this 
 * @param {标签中的内容} word 
 * @param {标签宽度} width
 */
function loadCommonLable(_this, word, width) {

    // 先删除之前的元素
    removeEleByClassName(_this, "lable");

    // 创建一个容器元素
    tooltipContainer = document.createElement('div');

    // 设置容器的样式
    tooltipContainer.className = "lable";
    tooltipContainer.style.width = width;

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


// 监听UI点击事件
function listenMsg() {
    top.webglMessagePort.onmessage = function (msg) {
        console.log("back msg : " + msg.data);

        if (msg.data) {
            switchParam(JSON.parse(msg.data));
        }
    }
}

var trackPlaybackFlag = false;// 轨迹回放状态 true 处于轨迹回放 false 反之
var uuid = generateUUID();// 用于生成给后台传输的唯一ID

// 监听传递的参数跳转对应的场景
function switchParam(obj) {
    if (obj) {


        switch (obj.type) {
            case MAINS:         // 类目间切换

                if (obj.category != RESETCAMERA) {
                    curCategory = obj.category;// 当前类目
                }
                cameraPositionSet("init", "", sceneCenterMesh);// 初始化90度视角
                if (obj.category == MAININTERFACE) {
                    // 主界面什么也不加载
                    clearUI("main");
                } else if (obj.category == EXAMAREA) {
                    // 初始化场景内信息 加载一些UI图片标签之类

                    clearUI("main");    //清理其他区域的UI

                    // 调试参数
                    // obj.buildName = "ZhuTi01";
                    // obj.type = "examArea";
                    // obj.floor = "2";
                    // obj.roomName = "JianKongZhongXin";

                    // switchParam(obj);
                } else if (obj.category == EXAMPROJECT) {
                    // 初始化场景内信息 加载一些UI图片标签之类

                    clearUI("examProject");    //清理其他区域的UI
                    initAddExamProjectUI();
                } else if (obj.category == EXAMCAR) {
                    // 初始化场景内信息 加载一些UI图片标签之类

                    clearUI("examCar");     //清理其他区域的UI
                    initAddExamCarUI();
                } else if (obj.category == EXAMPERSONAL) {
                    // 初始化场景内信息 加载一些UI图片标签之类

                    clearUI("examPersonal");    //清理其他区域的UI
                    initAddExamPersonalUI();
                } else if (obj.category == MONITORINGEQUIPMENT) {
                    // 初始化场景内信息 加载一些UI图片标签之类

                    clearUI("examMonitor");    //清理其他区域的UI
                    // console.log("obj.data", obj.data);
                    initAddMonitorUI(obj.data);
                } else if (obj.category == RESETCAMERA) {
                    // 重置相机为初始90°
                    cameraPositionSet("init", "", sceneCenterMesh);
                    clearUI();
                }

                break;
            case MAININTERFACE: // 主界面
                console.log("进入主界面");
                // clearExamProjectUI();//清除考试区域的图片
                clearUI("main");
                break;
            case EXAMAREA:      // 考试区域

                remove3DObject();

                console.log("进入考试区域");

                var buildName = obj.buildName;
                var floor = obj.floor;
                var roomName = obj.roomName;

                if (buildName == "0") {
                    buildName = obj.roomName;
                    floor = "";
                    roomName = "";
                }

                // 每次动作必须等上次动作完成后进行
                if (separateBuildState) {

                    separateBuildState = false;
                    setTimeout(() => {
                        separateBuildState = true;
                    }, 2000);// 不管有没有后续操作，2s后状态重置

                    var pos = getValueByNestedKey(coordinate, buildName);
                    var time = 2000;
                    if (camera.position.y == pos.position_y) {
                        time = 100;
                    }
                    var posY = cameraPositionSet(buildName, null, null, null, time);

                    if (floor) {


                        if (buildStateMap.get(buildName + "_" + floor) == "off") {
                            // 如果点击的是建筑，将其他未关闭的楼层关闭
                            buildStateMap.forEach((value, key) => {
                                if (value == "on") {
                                    var build = key.split("_");
                                    separateBuild(build[0], build[1], "off");
                                }
                            })
                        }

                        // 判断当前点击的楼层是否和上次一样，如果一样并且只是切换房间，只做视角的切换不重新分离大楼
                        // 如何判断楼层是否一样，判断buildStateMap中对应的楼层是否是on，如果是one则说明点击的是同一层楼
                        if (buildStateMap.get(buildName + "_" + floor) == "on" && roomName) {

                            cameraPositionSet(roomName);
                        } else {
                            // 点击楼层跳转动画
                            if (camera.position.y == posY) {
                                var buildState = buildStateMap.get(buildName + "_" + floor) == "off" ? "on" : "off";
                                separateBuild(buildName, floor, buildState, roomName);
                            } else {
                                setTimeout(() => {

                                    var buildState = buildStateMap.get(buildName + "_" + floor) == "off" ? "on" : "off";
                                    separateBuild(buildName, floor, buildState, roomName);
                                }, 2000);
                            }

                        }


                    } else {

                        // 如果点击的是建筑，将其他未关闭的楼层关闭
                        buildStateMap.forEach((value, key) => {
                            if (value == "on") {
                                var build = key.split("_");
                                separateBuild(build[0], build[1], "off");
                            }
                        })

                    }

                    // 选中的建筑高亮显示
                    if (buildName.indexOf("ZhuTi") > -1) {
                        var modelNamePrefix = getValueByNestedKey(modelNamePreFix, examAreaCode);
                        var mesh = scene.getObjectByName(modelNamePrefix + buildName);

                        var selectedObjects = [];
                        mesh.traverse(function (object) {
                            if (object instanceof THREE.Mesh) {

                                selectedObjects.push(object);
                            }
                        });

                        // outlinePass.selectedObjects = selectedObjects; // 指定要高亮的模型
                        outlinePass.selectedObjects = selectedObjects; // 指定要高亮的模型

                        // outlinePass.selectedObjects = [cube]; // 指定要高亮的模型
                        outlinePass.edgeStrength = 6 // 边框的亮度
                        outlinePass.edgeGlow = 1 // 光晕[0,1]
                        outlinePass.usePatternTexture = false // 是否使用父级的材质
                        outlinePass.edgeThickness = 4 // 边框宽度
                        outlinePass.downSampleRatio = 3 // 边框弯曲度
                        outlinePass.pulsePeriod = 1 // 呼吸闪烁的速度
                        outlinePass.visibleEdgeColor.set('#ffffff'); // 可见轮廓线颜色
                        // outlinePass.hiddenEdgeColor.set('#000000'); // 隐藏轮廓线颜色
                        // outlinePass.clear = true
                        composer.addPass(outlinePass);
                    } else {

                        removeComposer();

                    }

                }

                break;
            case EXAMPROJECT:
                console.log("进入考试项目");

                // 如果线路号和对应科目都有，则直接跳转到对应科目，因为科目是统一的，所以要跳转具体科目必须传对应的线路号
                if (obj.examType && obj.number) {
                    initSubjectThreeLine(obj.examType, obj.number);
                } else if (obj.examType) {// 如果只传线路号，则查看对应线路上的所有科目
                    initSubjectThreeLine(obj.examType);
                } else {
                    cameraPositionSet(obj.examType, obj.number, null);
                }
                break;
            case EXAMCAR:       // 考试车辆
                console.log("进入考试车辆");
                // 第一视角跟随车辆
                perspectiveFollowing(obj.number);
                break;
            case EXAMPERSONAL:  // 考试人员
                console.log("进入考试人员");

                break;
            case EXAMMONITOR:   // 监控设备
                console.log("进入监控设备");
                // 跳转对应监控区域视角

                // 设备UI位置
                var positionObj;
                positionObj = getValueByNestedKey(uiMonitor, obj.number);

                if (positionObj) {

                    var quanJingState = false;
                    if (positionObj.class_id.indexOf("quanjing") > -1) {
                        console.log("进入全景");
                        quanJingState = true;
                    }

                    cameraPositionSet(obj.number, null, null, quanJingState);
                }

                break;
            case INIT:          // 初始化考试地点唯一编号，如果中转站中有多个考场的协议，要用此字段进行筛选

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
                            "./" + examAreaCode + "/Config/line.js",
                            "./" + examAreaCode + "/Config/kaotai.js",
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
                                        // gltfLoader.load(sceneUrl.replace("EXAMAREACODE", examAreaCode), (model) => {


                                        // model = model.scene;

                                        // 偏移量
                                        // const offsetX = 100.1;
                                        // const offsetY = 10.2;

                                        // model.traverse(function (obj) {
                                        // if (obj.isMesh) {//判断是否是网格模型
                                        // console.log("obj.material.map.magFilter before " + obj.material.map.magFilter);
                                        // obj.material.map.magFilter = THREE.LinearFilter;
                                        // obj.material.map.minFilter = THREE.LinearMipMapLinearFilter;
                                        // console.log("obj.material.map.magFilter after " + obj.material.map.magFilter);

                                        // console.log('模型节点', obj);
                                        // console.log('模型节点名字', obj.name);

                                        // const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

                                        // 对每个材质进行偏移
                                        // materials.forEach(function (material) {
                                        // 为材质创建新的偏移向量
                                        // const offset = new THREE.Vector2(offsetX, offsetY);
                                        // material.offset = offset;
                                        // });

                                        // }
                                        // });

                                        // 获取模型的长宽高
                                        // var modelWHDObj = modelWHDCalculate(model, 1);
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

                                            const geometry2 = new THREE.BoxGeometry(1, 1, 1);
                                            const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                                            const cube2 = new THREE.Mesh(geometry2, material2);
                                            cube2.position.set(0, 10, 50);
                                            scene.add(cube2);

                                            const posFolder = gui.addFolder('位置调试模型');
                                            // sceneFolder.close();
                                            posFolder.add(cube2.position, 'x', -200, 150).name("模型X轴").step(0.1);
                                            posFolder.add(cube2.position, 'y', -200, 150).name("模型Y轴").step(0.1);
                                            posFolder.add(cube2.position, 'z', -200, 150).name("模型Z轴").step(0.1);
                                            scene.add(scene_box);
                                        }



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


                                        createAllLable();

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
                                        // console.error(error);


                                    });


                                    // 坡起碰撞模型
                                    // loader.load(sceneUrl_poqi.replace("EXAMAREACODE", examAreaCode), (model2) => {


                                    //     // 获取模型的长宽高
                                    //     // var modelWHDObj = modelWHDCalculate(model, 1);

                                    //     // model.scale.set(1, 1, 1);
                                    //     model2.scale.set(0.01, 0.01, 0.01);
                                    //     // model.position.set(0, 0, 0);

                                    //     model2.rotation.set(0, 0, 0);
                                    //     model2.name = "sceneMain_poqi";
                                    //     // console.log("model", model);
                                    //     const q = new THREE.Quaternion(0, 0, 0, 1);
                                    //     // floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

                                    //     model2.traverse((child) => {

                                    //         if (child.name.indexOf("PoQi") > -1) {
                                    //             child.position.divideScalar(100);
                                    //             // createConvexPolyhedronRigidBody(child, child.position, q, 0);
                                    //             // var poDaoBody = createRigidBody2(child, child.position, q, 0);
                                    //         }
                                    //     })


                                    //     // scene.add(model2);


                                    //     // model.visible = false;

                                    // }, (event) => {



                                    // }, (error) => {

                                    //     // 控制台打印加载失败
                                    //     // console.error(error);


                                    // });

                                })
                            }

                            //  模型加载完之后，可以获取模型对象
                            loadModel().then(function (model) {
                                console.log("scene", scene);
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


                                initPoQiRigidbody();// 初始化坡起

                                initControls();

                                // 待场景加载完执行
                                initShangPoTrigger();   // 初始化检测是否上坡触发器
                                openVehicleProtoUrl();  // 打开车载链接
                                setInterval(() => {     // 监听协议是否正常
                                    listenVehicleProto();
                                }, 5000);

                                // render();

                                // 升级版渲染，浏览器即时切换也会运行
                                const fn = updateCanvas(() => { render() }, 1);
                                fn(fn);

                                setInterval(hideCarJob, 3000);// 隐藏掉线车辆 3s执行一次

                                setInterval(async function () {
                                    if (top.findWaringRealTime) {
                                        warnInfoObj = await top.findWaringRealTime();
                                        // console.log("warnInfoObj", warnInfoObj);
                                        if (warnInfoObj.records && warnInfoObj.records.length > 0) {
                                            getWarnInfo(warnInfoObj.records);
                                        }

                                    }
                                }, 1000);
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
            case TRACKPLAYBACK: // 进入轨迹回放
                closeVehicleSocket();// 关闭车载协议

                hideAllCar();

                trackPlaybackFlag = true;   // 是否开启轨迹回放标志位
                isGenSui = true;    // 开启轨迹回放默认第一视角跟随
                /**
                 * 给后端传递参数，返回对应轨迹回放的协议
                 */

                var msgObj = {};
                if (obj.isDrag) {
                    closeSocket_track(); // 关闭轨迹回放的WS链接 ，后面会 重新打开，释放资源
                    uuid = generateUUID();// 用于生成给后台传输的唯一ID
                    if (followCar) {
                        loadedModelsByTrack.delete(followCar.name); // 删除模型map中存储的车辆
                        cleanCarUI(followCar);// 删除UI
                        scene.remove(followCar);
                    }
                    trackPlaybackCar = null;// 删除之前的车辆，重新加载
                }
                msgObj.id = uuid;
                msgObj.ksxh = obj.examNo;
                msgObj.kssj = obj.startTime;
                msgObj.jssj = obj.endTime;


                // 判断轨迹回放的播放状态 如果暂停将后台的WS协议关闭
                if (obj.playState) {
                    createTrackWebSocket(msgObj);
                } else {
                    closeSocket_track(); // 关闭轨迹回放的WS链接
                }

                break;
            case EXITTRACKPLAYBACK: // 退出轨迹回放


                // cleanCarUI(followCar);// 删除UI
                // hideAllCar();

                // trackPlaybackFlag = false;   // 是否开启轨迹回放标志位
                // isGenSui = false;    // 关闭轨迹回放默认第一视角跟随
                // if (followCar) {
                // loadedModelsByTrack.delete(followCar.name); // 删除模型map中存储的车辆
                /**
                 * 删除历史刚体
                 */
                // var existBody = rigidBodyMap_trackPlayback.get(followCar.name);
                // if (existBody) {
                // removeRigiBody(existBody);
                // }
                // }
                // trackPlaybackCar = null;    // 将回放的车辆置空
                // scene.remove(followCar);
                // closeSocket_track(); // 关闭轨迹回放的WS链接
                // openVehicleProtoUrl(); // 打开车载协议WS
                // cameraPositionSet("init", "", sceneCenterMesh);// 初始化90度视角

                // 重置ID
                // uuid = generateUUID();
                break;
            case WARN:          // 预警

                break;

            default:
                console.log("请传入参数类型！");
        }

        // 从其他界面跳转回主界面，重载车载协议
        if (obj.refreshCarProto) {
            refreshCarProto();
        }
    } else {
        console.log("请传入操作的类目！");
    }
}

function createAllLable() {
    if ("FK001-2".indexOf(examAreaCode) > -1) {
        remove3DObject();
        createK2HKQ();  // 创建科二候考室
        createJKZX();   // 创建监控中心
        createC5();     // 创建C5考试区
        createLlhks();  // 创建理论候考室
        createLlzzksq();// 创建理论自助考试区
        createLl2();    // 创建理论考试区（二楼）
        createLl3();    // 创建理论考试区（三楼）
    }
}

function lableClick(ele, obj) {


    // 鼠标点击事件
    ele.addEventListener('click', function (event) {
        remove3DObject();
        switchParam(obj);
    });
}

function createK2HKQ() {
    // 科目二候考室
    var divContainerElement = document.createElement('div');

    var buttonDivContainerElement = document.createElement('div');
    buttonDivContainerElement.className = "buttonDiv_hks";
    var imgElement = document.createElement('img');
    imgElement.className = "inButton";
    imgElement.src = "./image/inButton.png";
    buttonDivContainerElement.append(imgElement);


    var spanElement = document.createElement('span');
    spanElement.className = "inButtonSpan";
    spanElement.innerHTML = "科目二候考室";
    buttonDivContainerElement.append(spanElement);


    var imgElement_Line = document.createElement('img');
    imgElement_Line.className = "middleLine_index";
    imgElement_Line.src = "./image/longLine.png";
    divContainerElement.append(imgElement_Line);
    divContainerElement.append(buttonDivContainerElement);

    const divCSS3D = new CSS3DObject(divContainerElement);
    divCSS3D.scale.set(0.17, 0.17, 0.17);
    divCSS3D.position.set(16, 10, -5);

    scene.add(divCSS3D);

    var obj = {
        "type": "examArea",
        "buildName": "ZhuTi01",
        "floor": "1",
        "roomName": "test1"
    };

    lableClick(buttonDivContainerElement, obj);
}

function createJKZX() {
    // 监控中心
    var divContainerElement = document.createElement('div');

    var buttonDivContainerElement = document.createElement('div');
    buttonDivContainerElement.className = "buttonDiv_jkzx";
    var imgElement = document.createElement('img');
    imgElement.className = "inButton";
    imgElement.src = "./image/inButton.png";
    buttonDivContainerElement.append(imgElement);


    var spanElement = document.createElement('span');
    spanElement.innerHTML = "监控中心";
    spanElement.className = "inButtonSpan_jkzx";
    buttonDivContainerElement.append(spanElement);


    var imgElement_Line = document.createElement('img');
    imgElement_Line.className = "middleLine_index_jkzx";
    imgElement_Line.src = "./image/middleLine.png";
    divContainerElement.append(imgElement_Line);
    divContainerElement.append(buttonDivContainerElement);

    const divCSS3D = new CSS3DObject(divContainerElement);
    divCSS3D.scale.set(0.17, 0.17, 0.17);
    divCSS3D.position.set(-24, 12, -5);

    scene.add(divCSS3D);

    var obj = {
        "type": "examArea",
        "buildName": "ZhuTi01",
        "floor": "2",
        "roomName": "jkzx"
    };

    lableClick(buttonDivContainerElement, obj);
}

function createC5() {
    // C5考试区
    var divContainerElement = document.createElement('div');

    var buttonDivContainerElement = document.createElement('div');
    buttonDivContainerElement.className = "buttonDiv_c5";
    var imgElement = document.createElement('img');
    imgElement.className = "inButton";
    imgElement.src = "./image/inButton.png";
    buttonDivContainerElement.append(imgElement);


    var spanElement = document.createElement('span');
    spanElement.innerHTML = "C5考试区";
    spanElement.className = "inButtonSpan_c5";
    buttonDivContainerElement.append(spanElement);


    var imgElement_Line = document.createElement('img');
    imgElement_Line.className = "shortLine_index_c5";
    imgElement_Line.src = "./image/shortLine.png";
    divContainerElement.append(imgElement_Line);
    divContainerElement.append(buttonDivContainerElement);

    const divCSS3D = new CSS3DObject(divContainerElement);
    divCSS3D.scale.set(0.17, 0.17, 0.17);
    divCSS3D.position.set(76, 6, -5);

    scene.add(divCSS3D);

    var obj = {
        "type": "examArea",
        "buildName": "ZhuTi02",
        "floor": "1",
        "roomName": "c5ksq"
    };

    lableClick(buttonDivContainerElement, obj);
}

function createLlhks() {
    // 理论候考区
    var divContainerElement = document.createElement('div');

    var buttonDivContainerElement = document.createElement('div');
    buttonDivContainerElement.className = "buttonDiv_llhks";
    var imgElement = document.createElement('img');
    imgElement.className = "inButton";
    imgElement.src = "./image/inButton.png";
    buttonDivContainerElement.append(imgElement);


    var spanElement = document.createElement('span');
    spanElement.innerHTML = "理论候考室";
    spanElement.className = "inButtonSpan_llhks";
    buttonDivContainerElement.append(spanElement);


    var imgElement_Line = document.createElement('img');
    imgElement_Line.className = "middleLine_index_llhks";
    imgElement_Line.src = "./image/longLine.png";
    divContainerElement.append(imgElement_Line);
    divContainerElement.append(buttonDivContainerElement);

    const divCSS3D = new CSS3DObject(divContainerElement);
    divCSS3D.scale.set(0.17, 0.17, 0.17);
    divCSS3D.position.set(128, 8, -5);

    scene.add(divCSS3D);

    var obj = {
        "type": "examArea",
        "buildName": "ZhuTi02",
        "floor": "1",
        "roomName": "llhks"
    };

    lableClick(divContainerElement, obj);
}

function createLlzzksq() {
    // 理论自助考试区
    var divContainerElement = document.createElement('div');

    var buttonDivContainerElement = document.createElement('div');
    buttonDivContainerElement.className = "buttonDiv_llzzksq";
    var imgElement = document.createElement('img');
    imgElement.className = "inButton";
    imgElement.src = "./image/inButton.png";
    buttonDivContainerElement.append(imgElement);


    var spanElement = document.createElement('span');
    spanElement.innerHTML = "理论自助考试区";
    spanElement.className = "inButtonSpan_llzzksq";
    buttonDivContainerElement.append(spanElement);


    var imgElement_Line = document.createElement('img');
    imgElement_Line.className = "middleLine_index";
    imgElement_Line.src = "./image/shortLine.png";
    divContainerElement.append(imgElement_Line);
    divContainerElement.append(buttonDivContainerElement);

    const divCSS3D = new CSS3DObject(divContainerElement);
    divCSS3D.scale.set(0.17, 0.17, 0.17);
    divCSS3D.position.set(145, 3, -5);

    scene.add(divCSS3D);

    var obj = {
        "type": "examArea",
        "buildName": "ZhuTi02",
        "floor": "1",
        "roomName": "llzzksq"
    };

    lableClick(divContainerElement, obj);
}

function createLl2() {
    // 理论考试区二楼
    var divContainerElement = document.createElement('div');

    var buttonDivContainerElement = document.createElement('div');
    buttonDivContainerElement.className = "buttonDiv_ll2";
    var imgElement = document.createElement('img');
    imgElement.className = "inButton";
    imgElement.src = "./image/inButton.png";
    buttonDivContainerElement.append(imgElement);


    var spanElement = document.createElement('span');
    spanElement.innerHTML = "理论考试区（二楼）";
    spanElement.className = "inButtonSpan_ll2";
    buttonDivContainerElement.append(spanElement);


    var imgElement_Line = document.createElement('img');
    imgElement_Line.className = "longLine_index_ll2";
    imgElement_Line.src = "./image/longLine.png";
    divContainerElement.append(imgElement_Line);
    divContainerElement.append(buttonDivContainerElement);

    const divCSS3D = new CSS3DObject(divContainerElement);
    divCSS3D.scale.set(0.17, 0.17, 0.17);
    divCSS3D.position.set(88, 14, -5);

    scene.add(divCSS3D);

    var obj = {
        "type": "examArea",
        "buildName": "ZhuTi02",
        "floor": "2",
        "roomName": "ll2"
    };

    lableClick(divContainerElement, obj);
}

function createLl3() {
    // 理论考试区三楼
    var divContainerElement = document.createElement('div');

    var buttonDivContainerElement = document.createElement('div');
    buttonDivContainerElement.className = "buttonDiv_ll3";
    var imgElement = document.createElement('img');
    imgElement.className = "inButton";
    imgElement.src = "./image/inButton.png";
    buttonDivContainerElement.append(imgElement);


    var spanElement = document.createElement('span');
    spanElement.innerHTML = "理论考试区（三楼）";
    spanElement.className = "inButtonSpan_ll3";
    buttonDivContainerElement.append(spanElement);


    var imgElement_Line = document.createElement('img');
    imgElement_Line.className = "middleLine_index";
    imgElement_Line.src = "./image/longLine.png";
    divContainerElement.append(imgElement_Line);
    divContainerElement.append(buttonDivContainerElement);

    const divCSS3D = new CSS3DObject(divContainerElement);
    divCSS3D.scale.set(0.17, 0.17, 0.17);
    divCSS3D.position.set(128, 18, -5);

    scene.add(divCSS3D);

    var obj = {
        "type": "examArea",
        "buildName": "ZhuTi02",
        "floor": "3",
        "roomName": "ll3"
    };

    lableClick(divContainerElement, obj);
}

function remove3DObject() {
    // 遍历所有的CSS3DObject，并移除
    for (var i = scene.children.length - 1; i >= 0; i--) {
        if (scene.children[i].type == "Object3D") {
            scene.remove(scene.children[i]);
        }
    }
}


/** 和前端交互的 通信方式 end*/

/**
 * 拉取预警信息
 */
function getWarnInfo(warnInfoArray) {

    var warnInfoMap = new Map();

    if (warnInfoArray && scene) {

        warnInfoArray.forEach(ele => {

            var key;
            if (ele.kchp) { // 车辆
                key = ele.syzjcx + "-" + ele.kcbh;// 车型-车号
            } else if (ele.sbbh && !ele.kth) { // 摄像头，但是不是考台
                key = ele.sbbh; // 视频序号
            } else if (ele.kth) { // 考台
                key = ele.kth; // 考台号
            }
            if (key && !warnInfoMap.has(key)) {
                warnInfoMap.set(key, ele);
            }

        })

    }

    warnInfoMap.forEach((ele, key) => {

        if (!scene.getObjectByName(ele.id)) {

            var inRoom = false; // 是否在室内
            var inRoomParam;  // 室内需要跳转的参数，例：考台号或者视频序号

            // 预警CSS2DObject
            const divElement = document.createElement('div');
            const imgElement = document.createElement('img');
            const textElement = document.createElement('p');
            const spanElement = document.createElement('p');
            imgElement.src = "./image/warn_arrow.png";
            imgElement.className = 'warnImg_jump';
            divElement.className = 'lableWarnImg';
            textElement.innerHTML = ele.yjxx;
            textElement.className = 'yjxxClass';
            spanElement.innerHTML = '时间： ' + ele.yjsj;
            spanElement.className = 'yjsjClass';
            divElement.append(imgElement);
            divElement.append(textElement);
            // textElement.append(spanElement);
            const label = new CSS2DObject(divElement);
            label.name = ele.id;
            var mesh;
            var meshName;
            // var obj = JSON.parse(msg.data);
            if (ele.kchp) { // 车辆预警 如果是车直接在场景中找到对应车辆，将告警图标放到上面

                divElement.style.marginTop = '-3em';
                divElement.className = 'lableWarnImg ' + ele.syzjcx + "-" + ele.kcbh;
                meshName = ele.syzjcx + "-" + ele.kcbh;// 车型-车号
                mesh = scene.getObjectByName(meshName);
                if (mesh) {
                    mesh.add(label);
                }

            } else if (ele.sbbh && !ele.kth) {
                meshName = ele.sbbh;// 视频序号

                var positionObj;
                positionObj = getValueByNestedKey(uiMonitor, meshName);
                if (positionObj) {
                    label.position.set(
                        positionObj.pos.position_x,
                        positionObj.pos.position_y,
                        positionObj.pos.position_z
                    );

                    scene.add(label);

                    inRoom = positionObj.inRoom;
                    inRoomParam = ele.sbbh;
                }
            } else if (ele.kth) {
                meshName = ele.kth;

                var positionObj;
                positionObj = getValueByNestedKey(kaotaiObj, meshName);

                if (positionObj) {
                    label.position.set(
                        positionObj.pos.position_x,
                        positionObj.pos.position_y,
                        positionObj.pos.position_z
                    );

                    scene.add(label);

                    inRoom = positionObj.inRoom;
                    inRoomParam = ele.kth;
                }

            }


            // 鼠标点击事件
            divElement.addEventListener('click', function (event) {

                if (inRoom) {
                    remove3DObject();
                    var time = 2500;
                    var pos = getValueByNestedKey(coordinate, inRoomParam);
                    if (camera.position.y == pos.position_y) {
                        time = 100;
                    }

                    cameraPositionSet(inRoomParam, null, null, null, 2000);

                    setTimeout(function () {
                        var obj = {
                            "type": "warn",
                            "data": ele
                        }
                        top.webglMessagePort.postMessage(obj);
                    }, time);

                } else {
                    var obj = {
                        "type": "warn",
                        "data": ele
                    }
                    top.webglMessagePort.postMessage(obj);

                }


            });

            // 定时清除预警图标
            // setTimeout(function () {
            //     // 从父对象中移除CSS2D标签
            //     if (mesh) {
            //         mesh.remove(label);
            //     }
            //     // 从场景中移除CSS2DObject
            //     scene.remove(label);

            // }, 5000);
        }

    })

}

/** 车载协议相关  begin*/
// 处理车载协议
function CarProtoHandler(msg) {

    return new Promise(async function (resolve, reject) {
        // msg = "$header,C1,2,司空半兰,100,20231110172837100070,2,1,46.9925016692,-43.2076740270,19.622200,257.250000,-2.190000,0.000000,0,0,-5759604.1676039500,1738465.0167516796,0.000000,0.000000,0.000000,0.000000+440881199511100007,2190311100007,02002002222222222222,0,^^,0+2500,1.08,1100000010001004000000001,0.000000,2,1+FK001,2,z*$header,C1,2,司空半兰,100,20231110172837100070,2,1,47.0472158772,-43.2032332063,19.621900,256.520000,-2.250000,0.000000,0,0,-5759604.1676039500,1738465.0167516796,0.000000,0.000000,0.000000,0.000000+440881199511100007,2190311100007,02002002222222222222,0,^^,0+2500,0.99,1100000010001004000000001,0.000000,2,1+FK001,2,z*","
        if (msg) {

            // console.log("msg", msg);
            msg = msg.replace("+", " ");
            // console.log("decodeURIComponent(msg)", decodeURIComponent(msg));
            // 解析中转服务器的协议
            var dataArr = decodeURIComponent(msg).split("+");
            // console.log("dataArr", dataArr);
            if (dataArr && dataArr.length == 4) {// 正常的协议长度

                var examAreaArr = dataArr[3].split(",");// 考试区域信息
                if (((examAreaArr[0] + "-" + examAreaArr[1]) == examAreaCode) || ("51000203" == examAreaCode)) {// 筛选协议，只获取当前考场的socket协议

                    var subjectType = examAreaArr[1];   // 科目类型 科二或者科三
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
                        var deductCode;
                        var deductCodes = examInfoArr[4];
                        var codeArr = deductCodes.split("^");
                        if (codeArr.length > 0) {
                            deductCode = codeArr[2];// 只拿最新的扣分代码
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
                            "",             // 扣分时间
                            subjectType     // 科目类型 科二或者科三
                        );


                        // 添加车辆
                        asyncInsertCar(carTransForm, carExamInfo).then(function (car) {

                            if (car) {
                                var carExist = containsMeshWithName(carArray, car.name);

                                // 等车辆模型加载完成时才执行 第一次加载完车辆 添加对应的图标以及将车辆添加入数组，检测到有扣分显示扣分信息
                                if (!carExist) {

                                    carArray.push(car);

                                    carPersonalMap.set(car.name, carExamInfo.examineeName);
                                    carStateMap.set(car.name, carExamInfo.examState);
                                    showDeduct(car, carExamInfo.deduct);
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
     * @param {科目类型} subjectType 
     */
    constructor(carType, carId, examineeName, examScore, examState, examSubjectId, examSubjectName, waterId, identityID, deduct, deductTime, subjectType) {

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
        this.subjectType = subjectType;
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

// 根据ID获取Mesh对象
function getCarById(id) {
    for (var i = 0; i < carArray.length; i++) {
        if (carArray[i].id === id) {
            return carArray[i];
        }
    }
    return null;
}

/** 车载协议相关  end*/


// 创建 WebSocket 连接
// const socket = new WebSocket('ws://10.0.9.251:16009');
var socket_vehicle;

function openVehicleProtoUrl() {

    // 将车载协议状态置null


    if (!vehicleProtoState || vehicleProtoState == "close") {
        socket_vehicle = new WebSocket(vehicleProtoUrl);

        // // 监听连接打开事件
        socket_vehicle.addEventListener('open', (event) => {
            vehicleProtoState = "open";
            console.log('Socket连接已打开');
        });


        // // 监听接收消息事件
        socket_vehicle.addEventListener('message', (event) => {
            const receivedData = event.data;

            CarProtoHandler(receivedData);
            // console.log('收到消息:', receivedData);
        });

        // // 监听连接关闭事件
        socket_vehicle.addEventListener('close', (event) => {
            console.log('Socket连接已关闭');
        });

        // // 监听连接错误事件
        socket_vehicle.addEventListener('error', (event) => {
            console.error('Socket连接发生错误:', event);
        });

        vehicleProtoState = "open";
    }


}


// 关闭车载连接
function closeVehicleSocket() {
    vehicleProtoState = "close";
    if (socket_vehicle && socket_vehicle.readyState === WebSocket.OPEN) {

        socket_vehicle.close();
    }
}

/**
 * 监听车载协议状态，如果信号不好造成的关闭定时去查看是否能连接上，如果可以直接连接
 */
function listenVehicleProto() {
    if (!trackPlaybackFlag) {// 不处理回放状态下的车载协议

        // console.log("监听协议状态", socket_vehicle.readyState);
        if (socket_vehicle && socket_vehicle.readyState === WebSocket.CLOSED) {
            vehicleProtoState = "close";
            openVehicleProtoUrl();
        }
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
 * 重载一下车载协议
 */
function refreshCarProto() {
    closeVehicleSocket();
    openVehicleProtoUrl();
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

            // 创建一个空的BufferGeometry
            var geometry = new THREE.BufferGeometry();
            var vertices = shape.vertices;
            var indices = shape.faces;
            // 创建vertices的Float32Array，将vertices数组中的数据填充到其中
            var verticesArray = new Float32Array(vertices.length * 3);
            for (var i = 0; i < vertices.length; i++) {
                verticesArray[i * 3] = vertices[i].x; // x坐标
                verticesArray[i * 3 + 1] = vertices[i].y; // y坐标
                verticesArray[i * 3 + 2] = vertices[i].z; // z坐标
            }

            // 创建indices的Uint16Array，将indices数组中的数据填充到其中
            var indicesArray = new Uint16Array(indices.length * 3);
            for (var i = 0; i < indices.length; i++) {
                indicesArray[i * 3] = indices[i][0]; // 第一个顶点索引
                indicesArray[i * 3 + 1] = indices[i][1]; // 第二个顶点索引
                indicesArray[i * 3 + 2] = indices[i][2]; // 第三个顶点索引
            }

            // 创建BufferAttribute，并将verticesArray作为数据传递给它
            var verticesAttribute = new THREE.BufferAttribute(verticesArray, 3);

            // 创建BufferAttribute，并将indicesArray作为数据传递给它
            var indicesAttribute = new THREE.BufferAttribute(indicesArray, 1);


            // 将verticesAttribute设置为BufferGeometry的属性之一
            geometry.setAttribute('position', verticesAttribute);

            // 将indicesAttribute设置为BufferGeometry的属性之一
            geometry.setIndex(indicesAttribute);

            mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
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


/** 考试区域相关 begin*/

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
function separateBuild(buildName, showFloor, offOn, roomName) {

    var appointBuildFloorArray = [];
    allBuildListArray.forEach(ele => {

        if (ele.name.indexOf(buildName) > -1) {
            appointBuildFloorArray.push(ele);

        }

    })

    if (showFloor >= appointBuildFloorArray.length) {
        alert("超出总楼层...");
    } else {
        appointBuildFloorArray.forEach(ele => {
            var floor = parseInt(ele.name.split("_")[4]);

            if (floor > showFloor) {
                if (offOn == "on") {
                    var positionY = ele.position.y;
                    var pos = new THREE.Vector3(ele.position.x, positionY + 1800, ele.position.z);
                    buildStateMap.set(buildName + "_" + showFloor, "on");
                    separateBuildTween(ele, pos, cameraPositionSet, roomName);
                    // separateBuildTween(ele, pos);
                } else {

                    buildStateMap.set(buildName + "_" + showFloor, "off");
                    var eleName = interceptStr(ele.name, "_", 3);
                    var buildOrginalPosY = buildMap.get(eleName);
                    // var pos = new THREE.Vector3(ele.position.x, ele.position.y - 2800, ele.position.z);
                    var pos = new THREE.Vector3(ele.position.x, buildOrginalPosY, ele.position.z);
                    separateBuildTween(ele, pos);
                }
            }

        })
    }

}

function separateBuildTween(mesh, pos, callback, roomName) {


    // camera.lookAt(0, 0, 0);

    // 创建Tween对象
    var tween = new TWEEN.Tween(mesh.position);

    // 设置建筑物分离动画的目标属性
    tween.to(pos, 2000);
    // 启动Tween动画
    tween.start();

    setTimeout(() => {
        // 在动画完成的过程中执行特定操作
        if (callback && roomName) {
            callback(roomName);
        }
    }, 1000);

    // 处理Tween动画的完成事件
    tween.onComplete(function () {
        console.log("建筑物分离动画完成！");
        separateBuildState = true;
    });

}

/**
 * 清除建筑物选中特效
 */
function removeComposer() {
    composer.batchRemovePass(composer.passes);
}

/**
 * 重置建筑物状态
 */
function buildReset() {
    if (buildStateMap) {
        // 如果点击的是建筑，将其他未关闭的楼层关闭
        buildStateMap.forEach((value, key) => {
            if (value == "on") {
                var build = key.split("_");
                separateBuild(build[0], build[1], "off");
            }
        })
    }
}
/** 考试区域相关 end*/