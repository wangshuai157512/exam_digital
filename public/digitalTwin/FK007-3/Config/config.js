// 车辆需要校正旋转角度的倍数，旋转圆周率/此倍数
const rotationMulti = 4; 

// 缩放最大距离
const maxDistances = 1200;
// 缩放最小距离
const minDistances = 30;

// 可能是由于工具问题，根据模型的中心点创建一些mesh会造成错误，比如模型的中心点不在中心而是在别的地方，造出来的Mesh就会有偏差，这里我们把偏差写到这里
// 车辆的0 0点在后面偏差的距离 单位为m
const c1CarCheckZ = 0;

const modelPrefix_FK007 = "SL_JingXiao_K3_";