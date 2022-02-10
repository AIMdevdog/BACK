const mysql = require('mysql');
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// db session store options
const options = {
    host: "db-aim.cv48si1lach8.us-east-2.rds.amazonaws.com",
    port: 3306,
    user: "admin",
    password: "aimjungle!2345",
    database: "aim_production",
};
// mysql 연결
let db = mysql.createConnection(options);
db.connect();

function HTML (title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB2 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    <a href="/author">author</a>
    ${list}
    ${control}
    ${body}
    </body>
    </html>
    `;
}

app.get('/', function (request, response) {
    db.query('SELECT * FROM map_images WHERE id=?', [1], function (error, results) {
        if (error) {
            console.log(error);
        }

        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var html = HTML(title, ``,
            `<h2>${title}</h2><p>${description}</p>
            <img src="${results[0].map_s3_addr}" width="800px">
            `,
            ``
        );
        response.send(html);
    });
    
    db.end();
    
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
