const crypto = require("crypto");

const express = require("express");
const mysql = require("mysql2");
const { reset } = require("nodemon");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

const db_info = {
    host: "localhost",
    port: "3306",
    user: "root",
    database: "test",
};
const conn = mysql.createConnection(db_info);
const coon = new MySQLStore(db_info);
app.use(
    session({
        secret: "session",
        resave: false,
        saveUninitialized: true,
        store: coon,
    })
);

app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    if (req.session.userId) {
        res.render("index", { is_session: true, nsername: req.session.info });
    } else {
        res.render("index", {
            is_session: false,
            is_wrong_id: req.query.is_wrong_id,
        });
    }
});
app.get("/login", (req, res) => {
    if (!req.session.Id) {
        passward = crypto
            .createHash("sha512")
            .update(req.query.passward)
            .digest("base64");
        conn.query(
            "select * from test where user_name ='" +
                req.query.name +
                "' and passward = '" +
                passward +
                "'",
            (err, row) => {
                if (err) throw err;
                if (row[0]) {
                    req.session.userId = req.query.name;
                    req.session.passward = passward;
                    req.session.info = row[0].info;
                    req.session.save(() => {
                        res.redirect("/");
                    });
                } else {
                    res.redirect("/?is_wrong_id=true");
                }
            }
        );
        console.log(req.session);
    }
});

app.get("/a", (req, res) => {
    conn.query(
        "select * from test where user_name = '" + req.query.id + "'",
        (err, row) => {
            if (err) throw err;
            if (row[0]) {
                res.redirect("/move_test?masege=이미 있는 id입니다.");
            } else {
                console.log(req.query);
                passward = crypto
                    .createHash("sha512")
                    .update(req.query.password)
                    .digest("base64");
                conn.query(
                    "insert into test values('" +
                        req.query.id +
                        "','" +
                        passward +
                        "','')",
                    () => {
                        res.redirect("/");
                    }
                );
            }
        }
    );
});

app.get("/move_test", (req, res) => {
    if (req.query.masege) {
        res.render("test", { id_erro: true, masege: req.query.masege });
    } else {
        res.render("test", { id_erro: false, masege: "noterro" });
    }
});
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});
app.listen(4080, () => {
    console.log("server start");
});
