import express from "express";
import { config } from "dotenv";
import { createSlug, getLinkAmount, getSlugUrl, isSlugExists } from "./functions/linkOperations.js";
import { rateLimit } from "express-rate-limit";

const app = express();
config();

app.get("/", async (req, res) => {

    const totalLinks = await getLinkAmount();
    const ipAddress = req.ip;

    res.json({
        "status": "ok",
        "totalLinks": totalLinks,
        "author": "rrumi_",
        "author_url": "https://arda.comax.tech/"
    })

})

app.get("/add", rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.ADD_LIMIT_PERMINUTE,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "You have exceeded your get quota. Please wait."
}), async (req, res) => {

    const query = req.query;

    const slug = query.slug;
    const url = query.url;

    await isSlugExists(slug).then(async (isFound) => {

        if (isFound) {

            return res.json({
                "status": "err",
                "error": "Link already exists."
            })

        }

        await createSlug(slug, url).then(() => {

            res.json({
                "status": "ok"
            })

        }).catch((err) => {

            res.json({
                "status": "err",
                "error": err
            })

        })
    }).catch((err) => {

        res.json({
            "status": "err",
            "error": err
        })

    })
})

app.get("/get/:slug", rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.GET_LIMIT_PERMINUTE,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "You have exceeded your get quota. Please wait."
}), async (req, res) => {

    const slug = req.params.slug;

    await getSlugUrl(slug).then((url) => {

        res.json({
            "status": "ok",
            "url": url
        })

    }).catch((err) => {

        res.json({
            "status": "err",
            "error": err
        })

    });    
})


app.listen(process.env.PORT, () => {
    
    console.log(`Link Shortening API is listening port ${process.env.PORT}`);
    
})