const mongoose = require('mongoose');

// ─── ANSI colours for console output ───────────────────────────
const c = {
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
};

/**
 * Connect to MongoDB Atlas with retry logic.
 *
 * - 3 attempts with 5-second delays between each.
 * - Registers `connected`, `error` and `disconnected` event listeners.
 * - Coloured console output for easy terminal scanning.
 *
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async () => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 5000;

  // ── Event listeners (idempotent — mongoose deduplicates) ──
  mongoose.connection.on('connected', () => {
    console.log(c.green('✔  Mongoose connected to MongoDB Atlas'));
  });

  mongoose.connection.on('error', (err) => {
    console.error(c.red(`✖  Mongoose connection error: ${err.message}`));
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(c.yellow('⚠  Mongoose disconnected from MongoDB'));
  });

  // ── Connection attempts ───────────────────────────────────
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        c.cyan(`⏳ MongoDB connection attempt ${attempt}/${MAX_RETRIES}…`)
      );

      const conn = await mongoose.connect(process.env.MONGODB_URI);

      console.log(
        c.green(`✔  MongoDB Connected: ${conn.connection.host}`)
      );
      return conn;
    } catch (error) {
      console.error(
        c.red(`✖  Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`)
      );

      if (attempt >= MAX_RETRIES) {
        console.error(
          c.red('✖  Max retries reached — could not connect to MongoDB.')
        );
        throw error; // let caller decide (don't process.exit in serverless)
      }

      console.log(c.yellow(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s…`));
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
