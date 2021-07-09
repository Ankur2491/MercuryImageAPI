// import Mercury from "@postlight/mercury-parser";
const Cors = require('cors');
const express = require("express");
const axios = require('axios')
const app = express();
const asyncRedis = require("async-redis");
let redis_host = "redis-11422.c62.us-east-1-4.ec2.cloud.redislabs.com"
let redis_port = 11422
let redis_password = "AFahzbIs3wTxs0VMPnvTqkuqyoZOWXwV"
const asyncRedisClient = asyncRedis.createClient({ host: redis_host, port: redis_port, password: redis_password })
var bodyParser = require('body-parser')
var ImageKit = require("imagekit");
var jsonParser = bodyParser.json()
app.use(Cors())
const Mercury = require('@postlight/mercury-parser');

var imagekit = new ImageKit({
    publicKey: "public_2r71yZ96zf7i1c5Qoxj5/aTP4ps=",
    privateKey: "private_tItw8T64cG0tPY+wmhNVwMiokp0=",
    urlEndpoint: "https://ik.imagekit.io/ap63okuxezn/"
});

let port = process.env.PORT || 3000;
app.post("/image", jsonParser, (req, res) => {
    const url = req.body.url
    Mercury.parse(url).then(result => res.send(result));

});

app.get('/getLatestImages/:index', async (req, res) => {
    res.send({ "status": "ok" });
    await fun(req.params.index);
})

app.post('/smartRead', jsonParser, async (req, res) => {
    console.log(req.body);
    const url = req.body.url
    let result = await Mercury.parse(url).catch(err => { console.log("mercuryError", err) });
    result.content = result.content.replace(/<[^>]*>?/gm, '');
    result.content = result.content.replace(/&apos;/g, '\'')
    result.content = result.content.replace(/&quot;/g, '"');
    result.content = result.content.replace(/&#xA0;/g, ' ')
    result.content = result.content.replace(/&amp;/g, '&')
    result.content = result.content.replace(/&#x201C;/g, '"')
    result.content = result.content.replace(/&#x201D;/g, '"')
    result.content = result.content.replace(/&#x2019;/g, "'")
    const params = new URLSearchParams()
    params.append('payload', result.content);
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    let resp = await axios.post('http://35.224.154.91:3050/smartRead', params, config);
    res.send(resp.data);
});

async function fun(index) {
    if (index == 0) {
        await imagekit.deleteFolder('images').catch(err => { console.log(err) });
    }
    console.log("getting fresh images");
    let resp = await asyncRedisClient.get('all_news');
    let data = JSON.parse(resp);
    let counter = 0;
    for (let article of data['news'][index]['articles']) {
        if (article['urlToImage'] == null || (article['urlToImage'] != null && article['urlToImage'].includes('./img'))) {
            counter++;
            try {
                let result = await Mercury.parse(article['url']).catch(err => { console.log("mercuryError", err) });
                let imageRes = await imagekit.upload({
                    file: result.lead_image_url,
                    fileName: `${article['url']}`,
                    folder: 'images',
                    useUniqueFileName: false
                }).catch(err => { console.log("imgError", err) })
                console.log(imageRes);
            }
            catch (err) {
                console.log("parsing error:", err);
            }
        }
    }
    console.log(counter);
}
app.listen(port, () => {
    console.log(`Example app is listening on port http://localhost:${port}`)
});