import { marshall } from "dynamodb/utils";
import { createProductSeed, createUserSeed } from "./seed-utils";

test("should output user seed", async () => {
  const result = createUserSeed();
  JSON.stringify(marshall(result));
});
test("should output product seed", async () => {
  const result = createProductSeed();
  JSON.stringify(marshall(result));
});
