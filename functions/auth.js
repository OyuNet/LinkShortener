import { readFile, writeFile } from "fs";
import { genSalt, hash } from "bcrypt";
import { randomBytes } from "crypto";

const saltRounds = 10;

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
          } catch (err) {
            reject(err);
          }
        });
        let value;
        await result.then((val) => (value = val));
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function registerUser(username, password) {
  return new Promise(async (resolve, reject) => {
    if (!(await checkUser(username))) {
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

      let hashedPassword;

      genSalt(saltRounds, (err, salt) => {
        if (err) {
          return reject(err);
        }

        hash(password, salt, (err, hash) => {
          if (err) {
            return reject(err);
          }

          hashedPassword = hash;
        });
      });

      if (!hashedPassword) {
        return reject("There is no valid hashed password.");
      }

      const newUser = {
        username: username,
        password: hashedPassword,
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

      let response = undefined;

      jsonData.map((obj) => {
        if (obj.token == token) {
          response = obj;
        }
      });

      response ? resolve(true) : resolve(false);
    });
  });
}

export async function generateAuthToken(username, password) {
  // It maybe looks like a just token function but in reality
  // I made this function to login registered users. So basically,
  return new Promise(async (resolve, reject) => {
    // it works like login function. No need any other things.
    let response;

    await checkUser(username)
      .then((result) => {
        response = result;
      })
      .catch((error) => {
        reject(error);
      });

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

    return token;
  });
}
