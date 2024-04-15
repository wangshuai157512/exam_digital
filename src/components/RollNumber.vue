<template>
  <div class="statisContent" v-loading="loading">
    <div class="chartNum">
      <div class="box-item">
        <li
          :class="{ 'number-item': !isNaN(item), 'mark-item': isNaN(item) }"
          v-for="(item, index) in orderNum"
          :key="index"
        >
          <span v-if="!isNaN(item)">
            <i ref="numberItem">0123456789</i>
          </span>
          <span class="comma" v-else>{{ item }}</span>
        </li>
      </div>
    </div>
  </div>
</template>

<script>
const reg = /\B(?=(\d{3})+(?!\d))/g;

function initOrder(n) {
  const l = new Array(n).fill("0");
  const s = l.join("").replace(reg, ",");

  return s.split(",");
}
export default {
  name: "Company",
  props: {
    count: {
      type: Number,
      default: 0
    },
    numLength: {
      type: Number,
      default: 9
    }
  },
  data() {
    const { numLength } = this;
    return {
      loading: false,
      orderNum: initOrder(numLength)
    };
  },
  watch: {
    count() {
      this.increaseNumber();
    }
  },
  methods: {
    // 设置文字滚动
    setNumberTransform() {
      const numberItems = this.$refs.numberItem;
      const numberArr = this.orderNum.filter((item) => !isNaN(item));

      for (let index = 0; index < numberItems.length; index++) {
        const elem = numberItems[index];
        elem.style.transform = `translate(-50%, -${numberArr[index] * 10}%)`;
      }
    },

    toOrderNum(num) {
      num = num.toString();

      if (num.length < this.numLength) {
        num = "0" + num; // 如未满位数，添加"0"补位
        this.toOrderNum(num); // 递归添加"0"补位
      } else if (num.length === this.numLength) {
        num = num.replace(reg, ",");
        this.orderNum = num.split("");
      } else {
        // 超过位数
      }
    },
    increaseNumber() {
      // this.timer = setInterval(() => {
      //   this.count = this.count + this.getRandomNumber(1, 100);
      //   this.toOrderNum(this.count);
      //   this.$nextTick(() => {
      //     this.setNumberTransform(this.count);
      //   });
      // }, 3000);
      this.toOrderNum(this.count);
      this.$nextTick(() => {
        this.setNumberTransform(this.count);
      });
    },
    getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  },
  mounted() {
    this.increaseNumber();
  }
};
</script>

<style lang="less">
.statisContent {
  .number-item {
    width: 30px;
    height: 45px;
    list-style: none;
    margin-right: 10px;
    background-image: url("~/image/num-bg.png");
    border-radius: 4px;
    background-size: 100% 100%;
    display: inline-block;
    font-size: 30px;
    color: white;
    font-weight: 700;
    & > span {
      position: relative;
      display: block;
      margin-right: 10px;
      width: 100%;
      height: 100%;
      writing-mode: vertical-rl;
      text-orientation: upright;
      overflow: hidden;
      font-family: digital;
      & > i {
        font-style: normal;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, 0);
        transition: transform 1s ease-in-out;
        letter-spacing: 10px;
      }
    }
  }
  .number-item:last-child {
    margin-right: 0;
  }
  .comma {
    display: inline-block;
    font-size: 30px;
    font-weight: 700;
    color: white;
  }
  .mark-item {
    display: inline-block;
  }
}
</style>
