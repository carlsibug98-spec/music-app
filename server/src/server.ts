/**
 * Entry point — create app, listen.
 */
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);

const app = createApp();
app.listen(port, () => {
  console.log(`[resona] API listening on :${port}`);
});
