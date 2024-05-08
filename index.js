import express from "express";
import { config } from "dotenv";
import { CronJob } from "cron";
import {
  createSlug,
  getAllSlugs,
  getLinkAmount,
  getSlugUrl,
  isSlugExists,
} from "./functions/linkOperations.js";
import { rateLimit } from "express-rate-limit";
import { randomString } from "./functions/randomString.js";
import cleanTokens from "./functions/cleanTokens.js";
import { generateAuthToken, registerUser } from "./functions/auth.js";
import { initialize } from "./functions/initalize.js";

initialize();

const app = express();
config();

new CronJob(
  "0 0 * * * *",
  () => {
    cleanTokens();
  },
  null,
  true,
  "UTC+3",
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

app.get("/", async (req, res) => {
  const totalLinks = await getLinkAmount();

  res.json({
    status: "ok",
    totalLinks: totalLinks,
    author: "rrumi_",
    author_url: "https://arda.comax.tech/",
  });
});

app.get(
  "/add",
  rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.ADD_LIMIT_PERMINUTE,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "You have exceeded your get quota. Please wait.",
  }),
  async (req, res) => {
    const query = req.query;

    let slug = query.slug;
    const url = query.url;

    if (!slug) {
      slug = await randomString(process.env.SLUG_LENGTH);
    }

    if (!url) {
      return res.json({
        status: "err",
        error: "Url must be defined.",
      });
    }

    await isSlugExists(slug)
      .then(async (isFound) => {
        if (isFound) {
          return res.json({
            status: "err",
            error: "Link already exists.",
          });
        }

        await createSlug(slug, url)
          .then((slug) => {
            res.json({
              status: "ok",
              slug: slug,
              localUrl: `http://${process.env.HOSTNAME}:31/get/${slug}`,
            });
          })
          .catch((err) => {
            res.json({
              status: "err",
              error: err,
            });
          });
      })
      .catch((err) => {
        res.json({
          status: "err",
          error: err,
        });
      });
  },
);

app.get(
  "/get/:slug",
  rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.GET_LIMIT_PERMINUTE,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "You have exceeded your get quota. Please wait.",
  }),
  async (req, res) => {
    const slug = req.params.slug;

    await getSlugUrl(slug)
      .then((url) => {
        res.json({
          status: "ok",
          url: url,
        });
      })
      .catch((err) => {
        res.json({
          status: "err",
          error: err,
        });
      });
  },
);

app.get(
  "/getAll",
  rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.GETALL_LIMIT_PERMINUTE,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "You have exceeded your get quota. Please wait.",
  }),
  async (req, res) => {
    await getAllSlugs()
      .then((jsonData) => {
        res.json({
          status: "ok",
          data: jsonData,
        });
      })
      .catch((err) => {
        res.json({
          status: "err",
          error: err,
        });
      });
  },
);

app.get(
  "/register",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message:
      "You have exceeded your registration quota per minute. Please wait",
  }),
  async (req, res) => {
    const query = req.query;
    const username = query.username;
    const password = query.password;

    if (!username || !password) {
      return res.json({
        status: "err",
        error: "Username or password is not given.",
      });
    }

    await registerUser(username, password)
      .then((status) => {
        status
          ? res.json({ status: "ok", username: username })
          : res.json({ status: "err", error: status });
      })
      .catch((err) => {
        res.json({
          status: "err",
          error: err,
        });
      });
  },
);

app.get(
  "/getToken",
  rateLimit({
    windowMs: 1 * 1000,
    limit: 1,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "You have exceeded your token quota. Please wait",
  }),
  async (req, res) => {
    const query = req.query;
    const username = query.username;
    const password = query.password;

    await generateAuthToken(username, password)
      .then((token) => {
        res.json({
          status: "ok",
          token: token,
          username: username,
        });
      })
      .catch((err) => {
        res.json({
          status: "err",
          error: err,
        });
      });
  },
);

app.listen(process.env.PORT, () => {
  console.log(`Link Shortening API is listening port ${process.env.PORT}`);
});
