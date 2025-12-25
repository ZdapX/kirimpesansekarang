
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();

// Konfigurasi View Engine untuk Vercel
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/**
 * ROUTES UTAMA
 */

// 1. Halaman Depan (Login/Register)
app.get('/', (req, res) => {
    // Jika sudah ada cookie user, langsung lempar ke dashboard
    if (req.cookies.user) return res.redirect('/dashboard');
    res.render('index');
});

// 2. Proses Registrasi
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const success = await User.create(username, password);
        if (success) {
            res.send('<script>alert("Registrasi Berhasil! Silahkan Login."); window.location="/"</script>');
        } else {
            res.send('<script>alert("Username sudah ada atau tidak valid!"); window.location="/"</script>');
        }
    } catch (err) {
        res.status(500).send("Terjadi kesalahan pada server: " + err.message);
    }
});

// 3. Proses Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const isValid = await User.login(username, password);

        if (isValid) {
            // Simpan cookie selama 1 hari (86400000 ms)
            res.cookie('user', username.trim().toLowerCase(), { 
                maxAge: 86400000, 
                httpOnly: true,
                path: '/' 
            });
            res.redirect('/dashboard');
        } else {
            res.send('<script>alert("Login Gagal! Username atau Password salah."); window.location="/"</script>');
        }
    } catch (err) {
        res.status(500).send("Terjadi kesalahan login.");
    }
});

// 4. Dashboard (List Pesan) - Private
app.get('/dashboard', async (req, res) => {
    const currentUser = req.cookies.user;
    if (!currentUser) return res.redirect('/');

    try {
        const msgs = await Message.get(currentUser);
        res.render('dashboard', { 
            user: currentUser, 
            messages: msgs 
        });
    } catch (err) {
        res.status(500).send("Gagal mengambil data pesan.");
    }
});

// 5. Halaman Profil Publik (Kirim Pesan) - Public
app.get('/u/:username', (req, res) => {
    const targetUser = req.params.username;
    res.render('profile', { target: targetUser });
});

// 6. Proses Kirim Pesan Anonim
app.post('/send/:username', async (req, res) => {
    const targetUser = req.params.username;
    const pesan = req.body.text;
    
    if (!pesan || pesan.trim() === "") {
        return res.send('<script>alert("Pesan tidak boleh kosong!"); window.history.back();</script>');
    }

    try {
        await Message.send(targetUser, pesan);
        // Tampilan sukses sederhana
        res.send(`
            <div style="background:black; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px;">
                <h1 style="font-size:50px;">🚀</h1>
                <h2 style="text-transform:uppercase; letter-spacing:2px;">Pesan Terkirim!</h2>
                <p style="color:#666; font-size:12px;">Penerima tidak akan pernah tahu siapa kamu.</p>
                <br>
                <a href="/u/${targetUser}" style="color:white; border:1px solid #333; padding:10px 20px; border-radius:50px; text-decoration:none; font-size:10px; font-weight:bold;">KIRIM LAGI</a>
            </div>
        `);
    } catch (err) {
        res.send("Gagal mengirim pesan anonim.");
    }
});

// 7. Fitur Baru: Hapus Pesan
app.post('/delete-message', async (req, res) => {
    const currentUser = req.cookies.user;
    if (!currentUser) return res.status(403).send("Akses ditolak.");

    const { msgRaw } = req.body;
    try {
        await Message.delete(currentUser, msgRaw);
        res.redirect('/dashboard');
    } catch (err) {
        res.send("Gagal menghapus pesan.");
    }
});

// 8. Logout
app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
});

// Ekspor aplikasi untuk Vercel
module.exports = app;

// Jika ingin dijalankan di lokal (opsional)
// const PORT = 3000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
