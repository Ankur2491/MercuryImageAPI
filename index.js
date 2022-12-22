// import Mercury from "@postlight/mercury-parser";
const cors = require('cors');
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
app.use(jsonParser)
var allowlist = ['https://blazing-news.vercel.app']
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    // console.log("HEADER::",req.header('Origin'))
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

const Mercury = require('@postlight/mercury-parser');

var imagekit = new ImageKit({
    publicKey: "public_2r71yZ96zf7i1c5Qoxj5/aTP4ps=",
    privateKey: "private_tItw8T64cG0tPY+wmhNVwMiokp0=",
    urlEndpoint: "https://ik.imagekit.io/ap63okuxezn/"
});

let port = process.env.PORT || 3000;
app.post("/image", cors(corsOptionsDelegate), async (req, res) => {
    const url = req.body.url
    let resp = await Mercury.parse(url);
    res.send(resp);
    //result => res.send(result));

});

app.get('/getLatestImages/:index', async (req, res) => {
    res.send({ "status": "ok" });
    await fun(req.params.index);
})

app.get('/search/:query/:pref', cors(corsOptionsDelegate), async (req, res) => {
    let preference = req.params.pref;
    if (preference == "pop") {
        let resp = await axios.get(`http://hn.algolia.com/api/v1/search?query=${req.params.query}&tags=story&hitsPerPage=20`)
        res.send(resp.data);
    }
    else {
        let resp = await axios.get(`http://hn.algolia.com/api/v1/search_by_date?query=${req.params.query}&tags=story&hitsPerPage=20`)
        res.send(resp.data);
    }
})

app.get('/reddit/:par/:order/:just', cors(corsOptionsDelegate), async (req, res) => {
    let para = req.params.par;
    let order = req.params.order;
    let just = req.params.just;
    if (just == true) {
        let resp = await axios.get(`https://www.reddit.com/search.rss?q=${para}`).catch(err=>{console.log(err)});
        res.send(resp.data);
    }
    if (order == 'hot') {
        let resp = await axios.get(`https://www.reddit.com/r/${para}/.rss`)
        res.send(resp.data);
    }
    else {
        let resp = await axios.get(`https://www.reddit.com/r/${para}/new/.rss?sort=new`)
        res.send(resp.data);
    }
})

app.get('/reddit/comments/:sub/comments/:uid/:txt', cors(corsOptionsDelegate), async (req, res) => {
    let sub = req.params.sub;
    let uid = req.params.uid;
    let txt = req.params.txt;
    let resp = await axios.get(`https://www.reddit.com/r/${sub}/comments/${uid}/${txt}/.rss`);
    res.send(resp.data);
})

app.get('/reddit/comments/:sub/comments/:uid/:txt/:cid', cors(corsOptionsDelegate), async (req, res) => {
    let sub = req.params.sub;
    let uid = req.params.uid;
    let txt = req.params.txt;
    let cid = req.params.cid;
    let resp = await axios.get(`https://www.reddit.com/r/${sub}/comments/${uid}/${txt}/${cid}/.rss`);
    res.send(resp.data);
})

app.get('/searchByPageIndex/:query/:index/:pref', async (req, res) => {
    let preference = req.params.pref;
    if (preference == "pop") {
        let resp = await axios.get(`http://hn.algolia.com/api/v1/search?query=${req.params.query}&tags=story&hitsPerPage=20&page=${req.params.index}`)
        res.send(resp.data);
    }
    else {
        let resp = await axios.get(`http://hn.algolia.com/api/v1/search_by_date?query=${req.params.query}&tags=story&hitsPerPage=20&page=${req.params.index}`)
        res.send(resp.data);
    }
})

app.options('/smartRead', cors(corsOptionsDelegate))
app.post('/smartRead', cors(corsOptionsDelegate), async (req, res) => {
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
    result.content = result.content.replace(/&#x2013;/g, "-")
    result.content = result.content.replace(/&#x2026;/g, "...")
    result.content = result.content.replace(/&#x2C6;/g, "^");
    result.content = result.content.replace(/&#x2DC;/g, "~");
    result.content = result.content.replace(/&#x2002;/g, " ");
    result.content = result.content.replace(/&#x2003;/g, " ");
    result.content = result.content.replace(/&#x2009;/g, " ");
    result.content = result.content.replace(/&#x200C;/g, " ");
    result.content = result.content.replace(/&#x200D;/g, " ");
    result.content = result.content.replace(/&#x200E;/g, " ");
    result.content = result.content.replace(/&#x200F;/g, " ");
    result.content = result.content.replace(/&#x2014;/g, "--");
    result.content = result.content.replace(/&#x2018;/g, "'");
    result.content = result.content.replace(/&#x201A;/g, "‚");
    result.content = result.content.replace(/&#x201E;/g, ",,");
    result.content = result.content.replace(/&#x2039;/g, "<");
    result.content = result.content.replace(/&#x203A;/g, ">");
    result.content = result.content.replace(/&#x20B9;/g, "₹");
    const params = new URLSearchParams()
    params.append('payload', result.content);
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    let resp = await axios.post('http://34.171.54.43:3050/smartRead', params, config);
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