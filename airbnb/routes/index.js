const express = require("express");
const router = express.Router();

const myDB = require("../db/myDB.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/hosts");
});

router.get("/hosts", async (req, res) => {
  const page = req.query.page || 1;
  console.log("/hosts", page);

  try {
    const hosts = await myDB.getHosts(page);
    // console.log("got hosts", hosts);
    res.render("hosts", {
      hosts: hosts,
      err: req.session.err,
      msg: req.session.msg,
    });
  } catch (err) {
    console.log("got error", err);
    res.render("hosts", { err: err.message, hosts: [] });
  }
});

router.post("/hosts/create", async (req, res) => {
  const host = req.body;

  try {
    console.log("Create host", host);
    await myDB.createHost(host, res);
    // await myDB.createListing(host, res);
    // await myDB.createReview(host, res);
    req.session.msg = "Host created";
    res.redirect("/hosts");
  } catch (err) {
    req.session.err = err.message;
    res.redirect("/hosts");
  }
});

router.post("/hosts/delete", async (req, res) => {
  try {
    const host = req.body;
    //console.log(host);
    const { lastID, changes } = await myDB.deleteHost(host);
    // console.log(lastID, changes);
    if (changes === 0) {
      req.session.err = `Couldn't delete the object ${host.name}`;
      res.redirect("/hosts");
      return;
    }

    req.session.msg = "Host deleted";
    res.redirect("/hosts");
  } catch (err) {
    console.log("got error update");
    req.session.err = err.message;
    res.redirect("/hosts");
    return;
  }
});

router.post("/hosts/update", async (req, res) => {
  try {
    const host = req.body;
    const db = await myDB.updateHost(host);

    console.log("update", db);

    req.session.msg = "Host Updated";
    res.redirect("/hosts");
  } catch (err) {
    console.log("got error update");
    req.session.err = err.message;
    res.redirect("/hosts");
  }
});

router.post("/hosts/count", async (req, res) => {
  try {
    const host = req.body;
    const db = await myDB.updateHost(host);

    console.log("update", db);

    req.session.msg = "Host Updated";
    res.redirect("/hosts");
  } catch (err) {
    console.log("got error update");
    req.session.err = err.message;
    res.redirect("/hosts");
  }
});


module.exports = router;
