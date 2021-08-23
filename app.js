const express = require("express");
const app = express();
const path = require("path");
// const registerRoute = require("./routes/register");
var db = require("./db/db");
var ejs = require("ejs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");
const methodOverride = require("method-override");
const { FORMERR } = require("dns");

let otp;
app.engine(
  "handlebars",
  exphbs({
    extname: "handlebars",
    defaultLayout: false,
    layoutsDir: "views/layouts/",
  })
);
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// const PORT = process.env.PORT ;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// console.log(path.join(__dirname, "../public"));
app.use(express.static(path.join(__dirname, "../public")));
app.use(methodOverride("_method"));

// app.use(loginnodeRoute)

app.get("/cse", (req, res) => {
  res.render("cse.ejs");
});
app.post("/cse", (req, res) => {
  console.log(req.body.name);
  db.query("SELECT * FROM EVENT_DETAILS", function (err, data, fields) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].EVENT_NAME.toLowerCase() === req.body.name) {
        var fest = data[i].FEST_NAME;
        var event = data[i].EVENT_NAME;
        var description = data[i].DESCRIPTION;
        var date = data[i].DATE;
        var time = data[i].TIME;
        var room = data[i].ROOM_NO;
        var team = data[i].TEAM;
        var participation = data[i].PARTICIPATION_FEE;
        var winner = data[i].WINNER;
        var runner1 = data[i].RUNNER1;
        var runner2 = data[i].RUNNER2;
        var more_details = data[i].MORE_DETAILS;

        // console.log(req.body)
        userData = [
          {
            FEST_NAME: fest,
            EVENT_NAME: event,
            DESCRIPTION: description,
            DATE: date,
            TIME: time,
            ROOM_NO: room,
            TEAM: team,
            PARTICIPATION_FEE: participation,
            WINNER: winner,
            RUNNER1: runner1,
            RUNNER2: runner2,
            MORE_DETAILS: more_details,
          },
        ];
        return res.render("fest_details.ejs", { userdata });
      } else if (i < data.length) {
        continue;
      } else {
        return res.render("cse.ejs");
      }
    }
  });
});
// app.get("/cse/event", (req, res) => {
//   res.render("fest_details.ejs")
// })
app.get("/fest_details/:id", (req, res) => {
  var { id } = req.params;
  console.log(id);
  db.query(
    "SELECT * FROM EVENT_DETAILS WHERE ID=?",
    [id],
    function (err, data, fields) {
      var fest = data[0].FEST_NAME;
      var event = data[0].EVENT_NAME;
      var description = data[0].DESCRIPTION;
      var date = data[0].DATE;
      var time = data[0].TIME;
      var room = data[0].ROOM_NO;
      var team = data[0].TEAM;
      var participation = data[0].PARTICIPATION_FEE;
      var winner = data[0].WINNER;
      var runner1 = data[0].RUNNER1;
      var runner2 = data[0].RUNNER2;
      var more_details = data[0].MORE_DETAILS;

      // console.log(req.body)
      userData = [
        {
          FEST_NAME: fest,
          EVENT_NAME: event,
          DESCRIPTION: description,
          DATE: date,
          TIME: time,
          ROOM_NO: room,
          TEAM: team,
          PARTICIPATION_FEE: participation,
          WINNER: winner,
          RUNNER1: runner1,
          RUNNER2: runner2,
          MORE_DETAILS: more_details,
        },
      ];
      res.render("fest_details.ejs", { id, userData });
    }
  );
  // res.render("fest_details.ejs", { id })
});

app.post("/register", (req, res) => {
  db.query(
    `INSERT INTO REGISTER SET ?`,
    req.body,

    function (err, result) {
      console.log(result);
      console.log(err);
      res.render("payment.ejs");
    }
  );

  var sql = "INSERT INTO FULL_RECORD(EMAIL) VALUE(?) ";
  db.query(sql, req.body.EMAIL, function (err, result) {
    if (err) {
      res.render("payment.ejs");
    }
  });
});

app.get("/register/payment", (req, res) => {
  res.render("payment.ejs");
});

app.post("/register/payment", (req, res) => {
  var sql = "SELECT * FROM REGISTER";
  // var sql = 'SELECT * FROM REGISTER';
  db.query(sql, function (err, data, fields) {
    if (err) {
      res.redirect("/register/payment");
    } else {
      console.log(data);

      var email = data[data.length - 1].EMAIL;
      var event = data[data.length - 1].EVENT_NAME;
      var name = data[data.length - 1].NAME;
      var col = data[data.length - 1].COLLEGE_NAME;

      var tranid1 = getRandom(1000, 9999);
      var tranid2 = getRandom(10000, 99999);
      var tranid3 = "JSS";

      let transporter = nodemailer.createTransport({
        service: "gmail",
        // secure: true, // true for 465, false for other ports
        auth: {
          user: "gl.sai.mansi8@gmail.com", // generated ethereal user
          pass: "iawnihqdzdrlxzpk", // generated ethereal password
        },
      });

      // send mail with defined transport object
      tranid = ` ${tranid3 + tranid1 + tranid2}`;

      let mailOptions = {
        from: "gl.sai.mansi8@gmail.com", // sender address
        to: email, // list of receivers
        subject: "PAYMENT SUCCESSFUL", // Subject line
        text: ` Transaction Successful
        TRANSACTION ID : ${tranid} 
        for the ${event} `, // plain text
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        } else {
          console.log(info);
        }
      });
    }
    // db.query("SELECT* FROM CONFIRMATION", function (err, data) {
    // if (data[data.length - 1].PAYMENT_CONFIRMATION !== "NULL") {
    // var sql = `UPDATE REGISTER SET PAYMENT_CONFIRMATION="PAID" WHERE EMAIL=?`
    // db.query(sql, [email], function (err, data, fields) {
    //   if (err) throw err

    // })
    // }
    // })

    var sql =
      "INSERT INTO CONFIRMATION(EMAIL, EVENT_NAME, PAYMENT_CONFIRMATION) VALUES(?,?,?)";
    db.query(sql, [email, event, "PAID"], function (err, data) {
      if (err) throw err;
    });

    var sql1 =
      "INSERT INTO PAYMENT(EVENT_NAME,EMAIL,TRANSACTION_ID) VALUES(?,?,?)";
    db.query(sql1, [event, email, tranid], function (err, data, fields) {
      if (err) throw err;

      var sql2 =
        "INSERT INTO E_TICKET(EMAIL,NAME,COLLEGE_NAME,EVENT_NAME) VALUES(?,?,?,?)";
      db.query(sql2, [email, name, col, event], function (err, data, fields) {
        if (err) throw err;
      });
    });
    res.render("successful.ejs");
  });
});

// app.get("/register/verify", (req, res) => {
//   res.render("verify.ejs")

// })
// app.post("/register/verify", (req, res) => {
//   found = "false"
//   db.query("SELECT EMAIL,EVENT_NAME FROM REGISTER", function (err, data, fields) {
//     if (err) {
//       return res.redirect("/")
//     }
//     for (let i = 0; i < data.length; i++) {
//       if (data[i].EMAIL == req.body.email && data[i].EVENT_NAME.toLowerCase() == req.body.event) {
//         var sql = `UPDATE REGISTER SET PAYMENT_CONFIRMATION="PAID" WHERE EMAIL=?`
//         db.query(sql, [req.body.EMAIL], function (err, data, fields) {
//           if (err) throw err
//           return res.render("payment.ejs")
//         })
//       } else if (i < data.length) {
//         continue
//       } else {
//         return res.render("invalidgmail&event.ejs")
//       }
//     }
//   })
// })

app.get("/admin", (req, res) => {
  res.render("contact.handlebars");
});
app.post("/validate", (req, res) => {
  const enteredOTP1 = req.body.otp;
  enteredOTP = enteredOTP1.map(Number).join("");
  console.log(otp);
  console.log(enteredOTP);
  if (enteredOTP == otp) {
    console.log("SUCCESS");
    res.redirect("/admin/table");
  } else {
    res.render("invalidOtp.handlebars");
  }
});

app.post("/send", (req, res) => {
  let isExists = false;
  console.log(req.body.gmail);
  const sql = "SELECT * FROM ORGS";
  db.query(sql, function (err, data) {
    if (err) {
      res.redirect("/");
    } else {
      for (let i = 0; i < data.length; i++) {
        if (data[i].EMAILS == req.body.gmail) {
          isExists = true;
          break;
        }
      }
      console.log(isExists);
      if (isExists) {
        let transporter = nodemailer.createTransport({
          service: "gmail",

          // secure: true, // true for 465, false for other ports
          auth: {
            user: "gl.sai.mansi8@gmail.com", // generated ethereal user
            pass: "iawnihqdzdrlxzpk", // generated ethereal password
          },
        });

        // console.log(getRandom());
        otp = getRandom(1000, 9999);

        // send mail with defined transport object
        let mailOptions = {
          from: "gl.sai.mansi8@gmail.com", // sender address
          to: req.body.gmail, // list of receivers
          subject: "BRANCH FEST ADMIN LOGIN OTP", // Subject line
          text: `${otp} is your OTP`, // plain text
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          } else {
            console.log(info);
            res.render("otp.handlebars");
          }
        });
      } else {
        res.render("invalidgmail.handlebars");
      }
    }
  });
});

app.get("/admin/table", function (req, res, next) {
  // console.log(req.query.search)

  var sql =
    "SELECT REGISTER.NAME , REGISTER.EVENT_NAME , REGISTER.EMAIL, REGISTER.COLLEGE_NAME, REGISTER.BRANCH, PAYMENT.TRANSACTION_ID,CONFIRMATION.PAYMENT_CONFIRMATION FROM REGISTER JOIN PAYMENT ON REGISTER.EMAIL = PAYMENT.EMAIL AND REGISTER.EVENT_NAME = PAYMENT.EVENT_NAME JOIN CONFIRMATION ON REGISTER.REG_ID=CONFIRMATION.ID";

  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("tabledata.ejs", { userData: data });
    // res.render('tabledata');
  });
});

// app.get("/admin/table/add", (req, res) => {
//   res.render("add.ejs")
// })

// app.post("/admin/table/add", (req, res) => {
//   // var id = req.body.id
//   var payid = req.body.PAYMENT_ID
//   var dept = req.body.DEPT;
//   var event = req.body.EVENT_NAME;
//   var name = req.body.NAME;
//   var email = req.body.EMAIL;
//   var col = req.body.COLLEGE_NAME;

//   // console.log(req.body)
//   userData = [{
//     PAYMENT_ID: payid,
//     DEPT: dept,
//     EVENT_NAME: event,
//     NAME: name,
//     EMAIL: email,
//     COLLEGE_NAME: col
//   }]
//   console.log(userData)
//   var query = db.query("INSERT INTO PAYMENT SET?", userData, function (err, result) {
//     if (err) {
//       console.log(err);
//       return
//     } else {
//       console.log(userData[0].PAYMENT_ID)
//       db.query("INSERT INTO E_TICKET VALUES (?,?,?,?,?)", [payid, email, name, col, event], function (err, result) {
//         if (err) throw err
//         else {
//           console.log("inserted into E_ticket")
//         }
//       })
//       res.redirect("/admin/table")
//     }
//   })
//   // console.log(payid)
// })
// app.get("/admin/table/edit/:id", (req, res) => {
//   const { id } = req.params
//   var sql = 'SELECT * FROM PAYMENT WHERE PAYMENT_ID =?';
//   db.query(sql, [id], function (err, data, fields) {

//     var dept = data.DEPT;
//     var event = data.EVENT_NAME;
//     var name = data.NAME;
//     var email = data.EMAIL;

//     var col = req.body.COLLEGE_NAME;

//     userData = [{

//       DEPT: dept,
//       EVENT_NAME: event,
//       NAME: name,
//       EMAIL: email,
//       COLLEGE_NAME: col
//     }]
//     if (err) throw err;
//     res.render("edit.ejs", { id, userData: data })
//   })
// })
// app.get("/admin/table/del/:id", (req, res) => {
//   const { id } = req.params
//   // console.log(id)
//   var sql = 'SELECT * FROM PAYMENT WHERE PAYMENT_ID =?';
//   db.query(sql, [id], function (err, data, fields) {

//     var dept = data.DEPT;
//     var event = data.EVENT_NAME;
//     var name = data.NAME;
//     var email = data.EMAIL;
//     var col = req.body.COLLEGE_NAME;

//     userData = [{
//       DEPT: dept,
//       EVENT_NAME: event,
//       NAME: name,
//       EMAIL: email,
//       COLLEGE_NAME: col
//     }]

//     if (err) throw err;

//     res.render("delete.ejs", { id, userData: data })
//   })

// })
// app.post("/admin/table/del/:id", (req, res) => {
//   const { id } = req.params
//   // console.log(id)
//   var sql = 'DELETE FROM PAYMENT WHERE PAYMENT_ID =?';
//   db.query(sql, [id], function (err, data, fields) {

//     if (err) throw err;
//     db.query("DELETE FROM E_TICKET WHERE PAYMENT_ID=?", [id], function (err, result) {
//       if (err) throw err
//       else {
//         console.log("deleted a row in E_ticket")
//       }
//     })
//     res.redirect("/admin/table")
//   })
// })
// app.patch("/admin/table/edit/:id", (req, res) => {

//   const { id } = req.params
//   console.log(req.body)
//   console.log(id)

//   var sql = 'UPDATE PAYMENT SET  DEPT=?, NAME=?, EMAIL=?, EVENT_NAME=?, COLLEGE_NAME=? WHERE PAYMENT_ID=?';
//   db.query(sql, [req.body.DEPT, req.body.NAME, req.body.EMAIL, req.body.EVENT_NAME, req.body.COLLEGE_NAME, id], function (err, data, fields) {
//     if (err) {
//       console.log(err);
//       return
//     } else {
//       console.log(data)
//       res.redirect("/admin/table")
//     }
//   })
//   db.query("UPDATE E_TICKET SET EMAIL=?, NAME=?, COLLEGE_NAME=?, EVENT_NAME=? WHERE PAYMENT_ID=?", [req.body.EMAIL, req.body.NAME, req.body.COLLEGE_NAME, req.body.EVENT_NAME, id], function (err, result) {
//     if (err) throw err
//     else {
//       console.log(result)
//       console.log("updated E_ticket")
//     }
//   })
// })

app.get("/admin/table/ticket", (req, res) => {
  res.render("ticket.ejs");
});
app.post("/admin/table/ticket", (req, res) => {
  const sql = "SELECT * FROM E_TICKET";
  db.query(sql, function (err, data) {
    if (err) {
      res.redirect("/admin/table/ticket");
    } else {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        var email = data[i].EMAIL;
        var name = data[i].NAME;
        var col = data[i].COLLEGE_NAME;
        var event = data[i].EVENT_NAME;

        let transporter = nodemailer.createTransport({
          service: "gmail",
          // secure: true, // true for 465, false for other ports
          auth: {
            user: "gl.sai.mansi8@gmail.com", // generated ethereal user
            pass: "iawnihqdzdrlxzpk", // generated ethereal password
          },
        });
        var col = "jss";
        otp = getRandom(10000, 99999);
        otp1 = getRandom(100, 999);
        id = `${col + otp + otp1}`;
        // send mail with defined transport object

        ejs.renderFile(
          path.join(__dirname, "views/e_ticket.ejs"),
          { id: id, name: name, event: event, col: col },
          function (err, data) {
            if (err) {
              console.log(err);
            } else {
              let mailOptions = {
                from: "gl.sai.mansi8@gmail.com", // sender address
                to: email, // list of receivers
                subject: "E-TICKET", // Subject line
                // text: ` is your E_TICKET ID`, // plain text
                html: data,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                  return res.redirect("/admin/table");
                } else {
                  console.log(info);
                  // res.redirect("/admin/table");
                }
              });
            }
          }
        );

        // else {
        //   res.render("invalidgmail.handlebars")
        // }
      }
    }
    db.query("DELETE FROM E_TICKET");
    res.redirect("/admin/table");
  });
});

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/admin/table/notifications", (req, res) => {
  res.render("notifications.ejs");
});

app.post("/admin/table/notifications", (req, res) => {
  const sql = "SELECT EMAIL FROM FULL_RECORD GROUP BY(EMAIL)";
  db.query(sql, function (err, data) {
    if (err) {
      res.redirect("/admin/table/notifications");
    } else {
      for (let i = 0; i < data.length; i++) {
        var email = data[i].EMAIL;

        let transporter = nodemailer.createTransport({
          service: "gmail",
          // secure: true, // true for 465, false for other ports
          auth: {
            user: "gl.sai.mansi8@gmail.com", // generated ethereal user
            pass: "iawnihqdzdrlxzpk", // generated ethereal password
          },
        });
        let mailOptions = {
          from: "gl.sai.mansi8@gmail.com", // sender address

          to: email, // list of receivers
          subject: "NOTIFICATION", // Subject line
          text: req.body.msg, // plain text
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          } else {
            console.log(info);
            res.redirect("/admin/table");
          }
        });
      }
    }
  });
  // res.redirect("/admin/table")
});

app.get("/admin/table/event_details", (req, res) => {
  var sql = "SELECT * FROM EVENT_DETAILS";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("event_details.ejs", { userData: data });
  });
});

// app.get("/admin/table/notification/:id", (req, res) => {
//   var { id } = req.params
//   res.render("singleNotification.ejs", { id })
// })
// app.post("/admin/table/notification/:id", (req, res) => {
//   const { id } = req.params
//   const sql = 'SELECT EMAIL FROM PAYMENT WHERE PAYMENT_ID=?';
//   db.query(sql, [id], function (err, data) {
//     if (err) {
//       res.redirect('/admin/table/notification');
//     } else {

//       var email = data[0].EMAIL;

//       let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         // secure: true, // true for 465, false for other ports
//         auth: {
//           user: 'gl.sai.mansi8@gmail.com', // generated ethereal user
//           pass: 'ysawzwccbnkkeown', // generated ethereal password
//         },
//       });
//       let mailOptions = {
//         from: 'gl.sai.mansi8@gmail.com', // sender address

//         to: email, // list of receivers
//         subject: "NOTIFICATION", // Subject line
//         text: req.body.msg, // plain text

//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           return console.log(error);
//         } else {
//           console.log(info);
//           res.redirect("/admin/table");

//         }
//       });

//     }
//   })
// })

app.listen(5000, (err) => {
  if (err) throw err;

  console.log(`Server is up and running at 5000`);
});
