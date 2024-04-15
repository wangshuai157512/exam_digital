import examRoom from "./exam-room.vue";
import examSchool from "./exam-school.vue";
import examCar from "./exam-car.vue";
import examProject from "./exam-project.vue";
import examiner from "./exam-examiner.vue";
import examDeduction from "./exam-deduction.vue";
import examinerDeduction from "./exam-examiner-deduction.vue";
import examArtificial from "./exam-artificial.vue";
import examResult from "./exam-result.vue";

export const getComponents = function (k) {
  return [
    examRoom,
    examSchool,
    examCar,
    examProject,
    examiner,
    examDeduction,
    examinerDeduction,
    examArtificial,
    examResult
  ][k];
};
