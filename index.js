import express from "express";
import { config } from "dotenv";
import { createSlug, getLinkAmount, getSlugUrl, isSlugExists } from "./functions/linkOperations.js";
import { rateLimit } from "express-rate-limit";
import { randomString } from "./functions/randomString.js";

const app = express();
config();

app.get("/", async (req, res) => {

    const totalLinks = await getLinkAmount();

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

    let slug = query.slug;
    const url = query.url;

    if (!slug) {

        slug = await randomString(process.env.SLUG_LENGTH);

    }

    if (!url) {
        
        return res.json({
            "status": "err",
            "error": "Url must be defined."
        })

    }

    await isSlugExists(slug).then(async (isFound) => {

        if (isFound) {

            return res.json({
                "status": "err",
                "error": "Link already exists."
            })

        }

        await createSlug(slug, url).then((slug) => {

            res.json({
                "status": "ok",
                "slug": slug,
                "localUrl": `http://${process.env.HOSTNAME}:31/get/${slug}`
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