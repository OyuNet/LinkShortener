import { readFile, writeFile } from "fs";

export async function getLinkAmount() {
    return new Promise((resolve, reject) => {
        readFile("./data/links.json", "utf8", (err, data) => {

            if (err) {

                reject(err);
                return;

            }

            try {

                const jsonData = JSON.parse(data);
                resolve(jsonData.length);

            } catch (error) {

                console.log(`Error while parsing JSON: ${error}`);
                reject(error);

            }
        });
    });
}

export async function getSlugUrl(slug) {
    return new Promise((resolve, reject) => {
        readFile("./data/links.json", "utf8", (err, data) => {

            if (err) {

                reject(err);
                return;

            }

            try {

                const jsonData = JSON.parse(data);

                let isFound = false;
                jsonData.map((x) => {

                    if (x.slug == slug) {

                        resolve(x.url);
                        isFound = true;

                    }

                })

                if (!isFound) {

                    reject("Link not exists.");

                }

            } catch (error) {

                console.log(`Error while parsing JSON: ${error}`);
                reject(error);

            }
        })
    })
}

export async function isSlugExists(slug) {
    return new Promise((resolve, reject) => {
        readFile("./data/links.json", "utf8", (err, data) => {

            if (err) {

                reject(err);
                return;

            }

            try {

                const jsonData = JSON.parse(data);
                let isFound = false;

                jsonData.map((x) => {

                    if (x.slug == slug) {

                        isFound = true;

                    }

                })

                resolve(isFound);

            } catch (error) {

                console.log(`Error while parsing JSON: ${error}`);
                reject(error);

            }
        })
    })
}

export async function createSlug(slug, url) {
    return new Promise((resolve, reject) => {
        readFile("./data/links.json", "utf8", (err, data) => {

            if (err) {

                return reject(err);

            }

            try {

                let jsonData = JSON.parse(data);
                
                jsonData.push({
                    "slug": slug,
                    "url": url
                })
                
                writeFile("./data/links.json", JSON.stringify(jsonData), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                resolve("Slug successfully created.");

            } catch (error) {

                console.log(`Error while parsing JSON: ${error}`);
                reject(error);

            }

        })
    })
}