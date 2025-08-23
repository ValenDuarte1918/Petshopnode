const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const fs = require('fs');
const path = require('path');
const { logSecurityEvent, recordFailedAttempt, clearFailedAttempts } = require('../middlewares/security');
// Comentamos temporalmente la conexión a la base de datos
// const db = require("../database/models");
// const Usuario = require('../database/models/Usuario');

// Cargar usuarios desde JSON
const usuariosPath = path.join(__dirname, '../data/usuarios.json');
const getUsuarios = () => {
  try {
    return JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  } catch (error) {
    return [];
  }
};

const saveUsuarios = (usuarios) => {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2), 'utf-8');
};

const controller = { 
  login:(req,res)=> {
    // Si ya está logueado, redirigir a home
    if (req.session.userLogged) {
      return res.redirect('/');
    }
    
    // Capturar URL de redirección si existe
    const redirectUrl = req.query.redirect || null;
    res.render('login', {errors: null, old: req.body, redirectUrl})
  },
  loginProcess: async(req, res) => {
    try {
      console.log(req.body);
      const usuarios = getUsuarios();
      let userToLogin = usuarios.find(user => user.email === req.body.email);
      console.log(userToLogin);
      
      if(userToLogin){
        // Para desarrollo, comparar contraseñas directamente o usar bcrypt si están hasheadas
        let isOkThePassword = req.body.contraseña === userToLogin.password || 
                             bcrypt.compareSync(req.body.contraseña, userToLogin.password);
        
        if(isOkThePassword){
          // Limpiar intentos fallidos
          clearFailedAttempts(req);
          
          // Guardar usuario en sesión
          req.session.userLogged = {
            id: userToLogin.id,
            firstName: userToLogin.firstName,
            lastName: userToLogin.lastName,
            email: userToLogin.email,
            category: userToLogin.category,
            image: userToLogin.image
          };
          
          // Log de seguridad para login exitoso
          logSecurityEvent('successful_login', {
            userId: userToLogin.id,
            email: userToLogin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
          
          console.log(`✅ Login exitoso: ${userToLogin.email} (${userToLogin.category})`);
          
          // Redirigir a la URL original o al home
          const redirectUrl = req.body.redirectUrl || '/';
          return res.redirect(redirectUrl);
        } else {
          // Registrar intento fallido de contraseña incorrecta
          recordFailedAttempt(req);
          
          logSecurityEvent('failed_login', {
            email: req.body.email,
            reason: 'invalid_password',
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
        }
        
        const redirectUrl = req.body.redirectUrl || null;
        res.render('login', {
          errors: {
            usuario: {
              msg: 'Las credenciales son invalidas'
            }
          },
          old: req.body,
          redirectUrl
        })
      } else {
        // Registrar intento fallido de email no encontrado
        recordFailedAttempt(req);
        
        logSecurityEvent('failed_login', {
          email: req.body.email,
          reason: 'email_not_found',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        const redirectUrl = req.body.redirectUrl || null;
        res.render('login', {
          errors: {
            usuario: {
              msg: 'No se encuentra este email en nuestra base de datos'
            }
          },
          old: req.body,
          redirectUrl
        })
      }
    } catch (error) {
      console.error('Error en login:', error);
      res.render('login', {
        errors: {
          usuario: {
            msg: 'Error del servidor'
          }
        },
        old: req.body,
        redirectUrl: req.body.redirectUrl || null
      })
    }
  },
    registro:(req,res)=> {
        res.render('registro.ejs')
    },
    registroPost: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
          return res.render("registro", {errors: errors.mapped(), old: req.body})
        } else {
          try {
            const usuarios = getUsuarios();
            let userInDb = usuarios.find(user => user.email === req.body.correo);
            
            if(userInDb){
              return res.render('registro', {
                errors : {
                  correo: {
                    msg:'Este correo ya esta registrado'
                  }
                }, 
                old: req.body
              })
            }
            
            let userToCreate = {
              id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
              firstName: req.body.firstName || req.body.nombre,
              lastName: req.body.lastName || req.body.apellido,
              email: req.body.correo,
              password: bcrypt.hashSync(req.body.contrasena, 10),
              category: 'Cliente',
              image: req.file ? req.file.filename : 'default.jpg'
            }
            
            usuarios.push(userToCreate);
            saveUsuarios(usuarios);
            return res.redirect('/user/login');
          } catch (error) {
            console.error('Error en registro:', error);
            return res.render('registro', {
              errors: {
                general: {
                  msg: 'Error del servidor'
                }
              },
              old: req.body
            });
          }
        }
      },
          
    logout: (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/');
      });
    },

    profile: (req, res) => {
      if (!req.session.userLogged) {
        return res.redirect('/user/login');
      }
      res.render('profile', { user: req.session.userLogged });
    }
}

module.exports = controller