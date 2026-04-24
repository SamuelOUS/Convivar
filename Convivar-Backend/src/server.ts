import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Convivar backend ejecutandose en http://localhost:${env.PORT}`);
});
