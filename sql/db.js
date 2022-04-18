const { LexModelBuildingService } = require("aws-sdk");
const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

module.exports.getImages = () => {
    return db.query(`
    SELECT id, url, title, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1
    ) AS "lowestId" 
    FROM images
    ORDER BY id DESC
    LIMIT 6;

    `);
};
module.exports.getMoreImages = (last_id) => {
    return db.query(
        `
        SELECT id, url, title
        FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 3
    `,
        [last_id]
    );
};

module.exports.addImages = (url, username, title, description) => {
    return db.query(
        `
    INSERT INTO images(url, username, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING id, url, username, title, description
    `,
        [url, username, title, description]
    );
};

module.exports.getImageById = (id) => {
    return db.query(
        `
        SELECT id, url, username, title, description, created_at,
        (SELECT id FROM images WHERE id > $1 LIMIT 1) AS "prevId",
        (SELECT id FROM images WHERE id < $1 ORDER BY id DESC LIMIT 1) AS "nextId"
        FROM images
        WHERE id = $1
        `,
        [id]
    );
};

module.exports.getComments = (id) => {
    return db
        .query(
            `
     SELECT * FROM comments
     WHERE img_id = $1
     ORDER BY created_at DESC
    `,
            [id]
        )
        .then(({ rows }) => rows);
};

module.exports.postComments = (username, comment, img_id, timestamp) => {
    return db
        .query(
            `
    INSERT INTO comments (username, comment,img_id, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, comment, img_id, created_at
    `,
            [username, comment, img_id, timestamp]
        )
        .then(({ rows }) => rows);
};
