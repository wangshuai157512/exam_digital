import examRoom from "./exam-room.vue";
import examCityRoom from "./exam-city-room.vue";
import qualified from "./qualified.vue";
import unqualified from "./unqualified.vue";

export const getComponents = function (k) {
  if (k > 1 && k < 5) {
    k = 2;
  }
  if (k > 4 && k < 8) {
    k = 3;
  }
  if (k > 7 && k < 17) {
    k = 0;
  }
  if (k > 16 && k < 26) {
    k = 1;
  }

  return [examRoom, examCityRoom, qualified, unqualified][k];
};
