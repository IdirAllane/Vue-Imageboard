const express = require("express");
const app = express();
const {
    getImages,
    addImages,
    getImageById,
    getComments,
    postComments,
    getMoreImages,
} = require("./sql/db.js");

const s3 = require("./s3.js");

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { disconnect } = require("process");
const { get } = require("express/lib/response");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, "/uploads"));
    },
    filename: function (req, file, callback) {
        uidSafe(24).then((uid) => {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2697152,
    },
});

app.use(express.static("./public"));

app.use(express.json()); // this middleware helps us properly access incoming requests of content type application/json

app.get("/getMoreImages/:id", (req, res) => {
    const { id } = req.params;
    getMoreImages(id)
        .then(({ rows }) => res.json(rows))
        .catch((err) => console.log("error getting more images", err));
});

app.post("/postComment", (req, res) => {
    postComments(
        req.body.username,
        req.body.comment,
        req.body.img_id,
        req.body.timestamp
    )
        .then((resp) => res.json(resp[0]))
        .catch((err) => console.log("error post comment in DB", err));
});

app.get("/get-comments/:id", (req, res) => {
    const { id } = req.params;

    getComments(id)
        .then((data) => res.json(data))
        .catch((err) => console.log("error getting comments", err));
});

app.get("/showImages/:id", (req, res) => {
    const { id } = req.params;

    getImageById(id)
        .then((data) => {
            res.json(data.rows);
        })
        .catch((err) => console.log("error getting image by id", err));
});

app.get("/images.json", (req, res) => {
    getImages().then((data) => {
        res.json(data.rows);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    addImages(
        `https://s3.amazonaws.com/imageboardboard/${req.file.filename}`,
        req.body.username,
        req.body.title,
        req.body.description
    ).then((data) => {
        res.json(data.rows[0]);
    });
});

app.get("*", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(8000, () => console.log(`I'm listening.`));
