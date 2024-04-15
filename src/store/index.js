import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";

const store = createPinia();

store.use(piniaPersist);

export function setupStore(app) {
  app.use(store);
}

export { store };
