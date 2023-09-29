const path=require('path')
const fs = require('fs')
let productsList = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/productData.json'),'utf-8'))
const {validationResult} = require('express-validator')

const controller ={
    list:(req,res)=>{
        res.render(path.join(__dirname,"../views/listaProductos.ejs"),{listP:listaProductos})
    },
    detail:(req,res)=>{
        res.render(path.join(__dirname,"../views/producto.ejs"))
    },
    crear: (req,res) =>{
        res.render(path.join(__dirname,"../views/crearProducto.ejs"))
    },
    crearProcess:(req,res) =>{  
        let errors = validationResult(req)
        if(errors.errors.length > 0){}
        let newProduct = {
            "id": productsList.length +1,
            "nombre": req.body.name.toLowerCase(),
            "descripcion": req.body.description.toLowerCase(),
            "precio": req.body.price,
            "img":req.file ? req.file.filename : 'logo.png' ,                     
            }
            productsList.push(newProduct)
            
            fs.writeFileSync(path.join(__dirname,'../data/productData.json'),JSON.stringify(productsList,null,2),'utf-8')
            res.redirect('/')
            
        },
        edit:(req,res)=>{
            res.render(path.join(__dirname,"../views/productEdit.ejs"))
        },
        editProcess:(req,res)=>{

            fs.writeFileSync(path.join(__dirname,'../data/productData.json'),JSON.stringify(productsList,null,2),'utf-8')
            res.redirect('/')

        }
    }





module.exports = controller