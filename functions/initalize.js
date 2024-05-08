import { existsSync, mkdirSync, writeFileSync } from "fs";

export function initialize() {
  const fnPath = "./data/";
  if (!existsSync("./.env")) {
    return console.log(
      "Please fill .env.example file, and rename it .env to proceed.",
    );
  }

  !existsSync(fnPath) ? mkdirSync(fnPath) : null;
  !existsSync(fnPath + "links.json")
    ? writeFileSync(fnPath + "links.json", JSON.stringify([], null, 2))
    : null;
  !existsSync(fnPath + "tokens.json")
    ? writeFileSync(fnPath + "tokens.json", JSON.stringify([], null, 2))
    : null;
  !existsSync(fnPath + "userlist.json")
    ? writeFileSync(fnPath + "userlist.json", JSON.stringify([], null, 2))
    : null;
}
