import express from 'express';
import querystring from 'querystring';
require('dotenv').config();
import { Buffer } from 'node:buffer';
import axios from 'axios';
const app = express();
const port = process.env.PORT || 8000;
const redirect_uri = `http://localhost:${port}/callback`;
const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET



app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/login', (req, res) => {
    let scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative app-remote-control streaming user-modify-playback-state user-read-playback-state user-read-currently-playing user-read-recently-played user-top-read';
    console.log(redirect_uri)
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri
        }));
});

app.get('/callback', async (req, res) => {
    if (req.query.error) return res.send(`Error: ${req.query.error}`);
    console.log(req.query)
    if (req.query.code) {
        const code = String(req.query.code);
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            }
        });
        console.log(response.data)
        const access_token = response.data.access_token
        const refresh_token = response.data.refresh_token

        res.redirect('http://localhost:3000/home?access_token=' + access_token + '&refresh_token=' + refresh_token);
    }
})

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});