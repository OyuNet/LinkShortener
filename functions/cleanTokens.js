import { writeFile } from "fs";
/**
 * Cleans tokens.json file.
 * @returns {boolean}
 */
export default async function cleanTokens() {
    writeFile("./data/tokens.json", "[]", (err) => {
        return false;
    })

    return true;
}