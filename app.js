
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./lib/db');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();

// Hubungkan Database
connectDB();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.get('/', (req, res) => {
    if (req.cookies.user) return res.redirect('/dashboard');
    res.render('index');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        await User.create({ username, password });
        res.send('<script>alert("Berhasil Daftar!"); window.location="/"</script>');
    } catch (err) {
        res.send('<script>alert("Username sudah ada!"); window.location="/"</script>');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase(), password });
    if (user) {
        res.cookie('user', user.username, { maxAge: 86400000, httpOnly: true });
        res.redirect('/dashboard');
    } else {
        res.send('<script>alert("Login Gagal!"); window.location="/"</script>');
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.cookies.user) return res.redirect('/');
    const msgs = await Message.find({ to: req.cookies.user }).sort({ createdAt: -1 });
    res.render('dashboard', { user: req.cookies.user, messages: msgs });
});

app.get('/u/:username', (req, res) => {
    res.render('profile', { target: req.params.username });
});

app.post('/send/:username', async (req, res) => {
    try {
        await Message.create({ to: req.params.username, text: req.body.text });
        res.send('<center style="background:black;color:white;height:100vh;padding-top:50px;font-family:sans-serif;"><h1>Terkirim! 🚀</h1><a href="/u/'+req.params.username+'" style="color:red">Kirim lagi</a></center>');
    } catch (err) {
        res.send("Gagal");
    }
});

app.post('/delete-message', async (req, res) => {
    if (!req.cookies.user) return res.status(403).send("Forbidden");
    await Message.findByIdAndDelete(req.body.msgId);
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
});

module.exports = app;
