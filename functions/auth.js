import { genSalt, hash, compare } from "bcrypt";
import { randomBytes } from "crypto";
import { readFile, writeFile } from "fs";

const saltRounds = 12;

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
            });
            resolve(false);
          } catch (err) {
            reject(err);
          }
        });
        await result
          .then((val) => {
            resolve(val);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function registerUser(username, password) {
  return new Promise(async (resolve, reject) => {
    if (await checkUser(username)) {
      reject("This username already exists.");
      return;
    }

    readFile("./data/userlist.json", "utf8", async (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      if (!username || !password) {
        reject("Username and password is not determined.");
        return;
      }

      const hashedPassword = new Promise(async (resolve, reject) => {
        genSalt(saltRounds, async (err, salt) => {
          if (err) {
            reject(err);
            return;
          }

          hash(password, salt, async (err, hash) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(hash);
          });
        });
      });

      await hashedPassword
        .then((passwordHash) => {
          if (!passwordHash) {
            reject("There is no valid hashed password.");
            return;
          }

          const newUser = {
            username: username,
            password: passwordHash,
          };

          const jsonData = JSON.parse(data);

          jsonData.push(newUser);

          try {
            writeFile(
              "./data/userlist.json",
              JSON.stringify(jsonData, null, 2),
              (err) => {
                reject(err);
                return;
              },
            );

            resolve(true);
          } catch (err) {
            reject(err);
            return;
          }
        })
        .catch((err) => {
          reject(err);
          return;
        });
    });
  });
}

export async function isTokenExists(token) {
  return new Promise(async (resolve, reject) => {
    readFile("./data/tokens.json", "utf8", async (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const jsonData = JSON.parse(data);

      let response;

      jsonData.map((obj) => {
        if (obj.token == token) {
          response = obj;
        }
      });

      response ? resolve(true) : resolve(false);
    });
  });
}

export async function loginUser(username, password) {
  return new Promise(async (resolve, reject) => {
    readFile("./data/userlist.json", "utf8", async (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      await checkUser(username)
        .then((response) => {
          if (!response) {
            reject("User is not exists.");
            return;
          }
        })
        .catch((err) => {
          reject(err);
          return;
        });

      const jsonData = JSON.parse(data);

      jsonData.map((obj) => {
        if (obj.username == username) {
          compare(password, obj.password, (err, result) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(result);
          });
        }
      });
    });
  });
}

export async function generateAuthToken(username, password) {
  return new Promise(async (resolve, reject) => {
    let response;

    await loginUser(username, password)
      .then((result) => {
        response = result;
      })
      .catch((err) => {
        reject(err);
        return;
      });

    if (!response) {
      reject("User exists but its's password is not true.");
      return;
    }

    let token = randomBytes(32).toString("hex");

    while (await isTokenExists(token)) {
      token = randomBytes(32).toString("hex");
    }

    readFile("./data/tokens.json", "utf8", async (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const jsonData = JSON.parse(data);
      const obj = {
        token: token,
        username: username,
      };

      jsonData.push(obj);

      writeFile(
        "./data/tokens.json",
        JSON.stringify(jsonData, null, 2),
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        },
      );
    });

    resolve(token);
  });
}
