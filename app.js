const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const md5 = require("md5");
const db = require("./database");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        const user = { username: req.body.username, password: md5(req.body.password), firstname: req.body.fName, lastname: req.body.lName };
        const sql = "INSERT INTO users SET ?";
        db.query(sql, user, (err, results) => {
            if (err) res.send(err);
            else res.render("login")
        });
    });

app.route("/signin/")
    .post((req, res) => {
        const user = { username: req.body.username, password: md5(req.body.password) };
        const sql = "SELECT * FROM users WHERE username='" + user.username + "' AND password='" + user.password + "'";
        db.query(sql, (err, results) => {
            if (err) res.send(err);
            else {
                if (results.length === 0) {
                    res.send("No match");
                }
                else {
                    const sql2 = "SELECT DISTINCT folders.* from folders INNER JOIN user_folders ON user_folders.user_id = '" + results[0].id + "' LIMIT 10";
                    db.query(sql2, (err, foundFolders) => {
                        res.render("index", { user: results[0], folders: foundFolders });
                    });
                }
            }
        })
    });
app.route("/loggedin/:id").get((req, res) => {

});
app.route("/getfolder/:id")
    .get((req, res) => {
        const sql = "SELECT * FROM files WHERE folderid='" + req.params.id + "' LIMIT 10";
        db.query(sql, (err, foundFiles) => {
            if (err) res.send(err);
            else res.render("files", { folderID: req.params.id, files: foundFiles });
        });
    });

app.route("/createFolder/:id")
    .get((req, res) => {
        res.render("createfolder", { userId: req.params.id });
    })
    .post((req, res) => {
        const sql = "INSERT INTO folders SET Name='" + req.body.folderName + "'";
        db.query(sql, (err, result) => {
            if (err) res.send(err);
            else {
                const sql2 = "INSERT INTO user_folders SET ?";
                const user_folder = { user_id: req.params.id, folder_id: result.insertId };
                db.query(sql2, user_folder, (err, result2) => {
                    if (err) res.send(err);
                    else res.render("login");
                })
            }
        });
    });

app.route("/file/:id")
    .get((req, res) => {
        res.download(__dirname + "/files/" + req.params.id);
    })
    .post((req, res) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        const newFile = req.files.file;
        const file = { Name: newFile.name, folderid: req.params.id };
        const sql = "INSERT INTO files SET ?";
        db.query(sql, file, (err, result) => {
            if (err) res.send(err);
            else {
                newFile.mv(__dirname + "/files/" + result.insertId + newFile.name, (err) => {
                    if (err) res.send("Something went wrong");
                    else res.render("login");
                });
            }
        });
    });

app.get("/deletefile/:id", (req, res) => {
    const sql = "DELETE FROM files WHERE id = '" + req.params.id + "'";
    db.query(sql, (err, result) => {
        if (err) res.send(err);
        else res.render("login");
    })
});

app.get("/deletefolder/:id", (req, res) => {
    const sql = "SELECT id FROM files WHERE folderid = '" + req.params.id + " LIMIT 1'";
    db.query(sql, (err, foundFiles) => {
        if (err) res.send(err);
        else {
            if (foundFiles.length === 0) {
                const sql2 = "Delete FROM user_folders WHERE folder_id = '" + req.params.id + "'";
                const sql3 = "Delete FROM folders WHERE id = '" + req.params.id + "'";
                db.query(sql2, (err) => {
                    if (err) res.send(err);
                    else db.query(sql3, (err) => {
                        if (err) res.send(err);
                        else res.render("login");
                    })
                });
            } else res.send("Folder is not empty!");
        }
    });
});
app.get("/", (req, res) => {
    res.render("login");
});



app.listen(3000, function () {
    console.log("Server is listening on Port 3000");
});