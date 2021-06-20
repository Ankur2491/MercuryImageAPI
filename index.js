// import Mercury from "@postlight/mercury-parser";
const Cors = require('cors');
const express = require("express");
const app = express();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
app.use(Cors())
const Mercury = require('@postlight/mercury-parser');
let port = process.env.PORT || 3000;
app.post("/image", jsonParser,(req, res) => {
    const url = req.body.url
    Mercury.parse(url).then(result => res.send(result.lead_image_url));

});
app.listen(port, () => {
    console.log(`Example app is listening on port http://localhost:${port}`)
});