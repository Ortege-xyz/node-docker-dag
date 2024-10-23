// main.ts
import { extractAssetsAndReserveStates } from './zest';

// Trigger the zest functionality
const main = async () => {
  console.log("Running zest.ts functionality...");
  await extractAssetsAndReserveStates();
};

main().catch((error) => {
  console.error("Error running zest.ts functionality:", error);
});
