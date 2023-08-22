const express = require("express");
const app = express(); 

app.set("view engine", "ejs")

const path = require("path"); 

app.use(express.static(path.join(__dirname, "/public")))

app.listen(3000, ()=>{
    console.log("Servidor corriendo en el puerto 3000")
})

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/home.ejs"))
})

app.get("/registro", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/registro.ejs"))
})

app.get("/login", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/login.ejs"))
})

app.get("/carrito", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/carrito.ejs"))
})

app.get("/producto", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/producto.ejs"))
})







