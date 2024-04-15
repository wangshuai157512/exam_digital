// 考试原因
export const examReasons = {
  option: [
    { value: "A", label: "初次申领" },
    { value: "B", label: "增驾申请" },
    { value: "C", label: "补证换证" },
    { value: "F", label: "满分学习" },
    { value: "G", label: "注销登记" },
    { value: "H", label: "档案更正" },
    { value: "I", label: "扣证还证" },
    { value: "K", label: "年度体检" },
    { value: "L", label: "信息变更" },
    { value: "M", label: "驾证转出" },
    { value: "N", label: "注销恢复" },
    { value: "O", label: "档案补建" },
    { value: "P", label: "限制申请" },
    { value: "Q", label: "锁定解锁" },
    { value: "R", label: "临时入境" },
    { value: "S", label: "延期换证" },
    { value: "T", label: "延期体检" },
    { value: "U", label: "驾证恢复" }
  ],
  getLabel: function (value) {
    const target = this.option.find((item) => item.value === value);
    if (target) return target.label;
    return "";
  }
};
