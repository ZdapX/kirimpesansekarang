const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return;
        
        // URI MongoDB kamu langsung di sini sesuai permintaan
        const uri = "mongodb+srv://dafanation999_db_user:MST55GUyySxCQZn7@cluster0.u2xryl1.mongodb.net/ngl_db?retryWrites=true&w=majority&appName=Cluster0";
        
        await mongoose.connect(uri);
        console.log("MongoDB Terhubung ✅");
    } catch (err) {
        console.error("Gagal koneksi MongoDB:", err);
    }
};

module.exports = connectDB;
