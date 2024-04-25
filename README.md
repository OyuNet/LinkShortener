# Basic Link Shortening Service

- Written with Javascript and Expressjs
- Just back-end service.

## Little Notes
Hi. I just wrote a basic link shortening service with Javascript and it's using Expressjs library. And I also want to mention that this project is not produced to handle lots of traffic.
So if you are planning to use this service in big scaled apps, you have to update it's code, if am I not updated DB section until that day.
Don't forget this repo is just for back-end services. You are responsible to write your own front-end. (or maybe you can use my front-end, it depends...)

## Features

- You can choose your own slug.
- Ready to go.
- It's working like memory. Not redirects clients.

## How to install?

Open a folder and write this in your terminal:
```
git clone https://github.com/OyuNet/LinkShortener
```

Then go to project's folder. After that edit .env.example and fill blanks as your desires. Rename .env.example -> .env
```
PORT=1234
ADD_LIMIT_PERMINUTE=5
GET_LIMIT_PERMINUTE=60
ADD_LIMIT_PERSECOND=1
GET_LIMIT_PERSECOND=0
```

So, you are ready to run project.
Open your terminal again run:
```
bun run production
```
or
```
npm run production
```
but you have to change package.json as:
```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon index.js",
    "production": "node index.js"
},
```
