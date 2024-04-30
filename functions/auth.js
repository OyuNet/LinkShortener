import { readFile, writeFile } from "fs";

export async function checkUser(username) {
    return new Promise((resolve, reject) => {
        readFile("./data/userlist.json", "utf8", async (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                const result = new Promise((resolve, reject) => {
                    try {
                        jsonData.map((userData) => {
                            if (userData.username == username) {
                                resolve(true);
                                return;
                            }
                            resolve(false);
                        })
                    } catch (err) {
                        reject(err);
                    }
                })
                let value; 
                await result.then((val) => value = val);
                resolve(value);
            } catch (err) {
                reject(err);
            }
        })
    })
}

export async function registerUser(username, password) {
    return new Promise(async (resolve, reject) => {
        if (!await checkUser(username)) {
            reject("This username already exists.");
            return;
        }

        readFile("./data/userlist.json", "utf8", async (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            if (username || password) {
                reject("Username and password is not determined.");
                return;
            }

            const hashedPassword = Bun.password.hash(password);

            const newUser = {
                username: username,
                password: hashedPassword
            }

            const jsonData = JSON.parse(data);

            jsonData.push(newUser);

            try {
                writeFile("./data/userlist.json", JSON.stringify(jsonData), (err) => {
                    reject(err);
                    return;
                })

                resolve(true);
            } catch (err) {
                reject(err);
                return;
            }
        })
    })
}

export async function generateAuthToken() {
    return new Promise(async (resolve, reject) => {
        
    })
}