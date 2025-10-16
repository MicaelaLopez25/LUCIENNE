import setup from "./global.setup";
import globalTeardown from "./global.teardown.codegen";

(async () => {
  await setup();
  await globalTeardown();
})();
