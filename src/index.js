require('dotenv').config()

const Express = require('express')
const app = Express()

function rawBody(req, res, next) {
    req.setEncoding('utf8');

    let data = '';

    req.on('data', function (chunk) {
        data += chunk;
    });

    req.on('end', function () {
        //@ts-ignore
        req.rawBody = data;

        next();
    });
}

app.use(rawBody)

app.post('/', async (req, res) => {
    try {
        const signature = req.header('x-cc-webhook-signature')
        const body = req.rawBody
        console.info('received request ', signature, body)
        const response =  await fetch(process.env.PROXY_TO, {
            method: 'POST',
            headers: {
                'X-CC-Webhook-Signature': signature
            },
            body: body
        })
        res.status(response.status).send(response.body)
        console.info('forwarded request to ', process.env.PROXY_TO)
    } catch (err) {
        console.error('failed to forward request ', process.env.PROXY_TO, ' with body ', req.body, err)
    }
})

app.listen(8686)
console.info('Now running at port 8686')