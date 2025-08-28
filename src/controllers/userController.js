const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const fs = require('fs');
const path = require('path');
const { logSecurityEvent, recordFailedAttempt, clearFailedAttempts } = require('../middlewares/security');
const db = require("../database/models");
const Usuario = db.Usuario;

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
      console.log('🔑 Login process iniciado');
      console.log('🔑 Email recibido:', req.body.email);
      console.log('🔑 Password recibido:', req.body.contraseña ? 'Sí' : 'No');
      
      // Verificar errores de validación
      const errors = validationResult(req);
      console.log('🔑 Errores de validación:', errors.array());
      
      if (!errors.isEmpty()) {
        console.log('❌ Errores de validación encontrados:', errors.array());
        return res.render('login', {
          errors: errors.array(),
          oldData: req.body
        });
      }
      
      let userToLogin = await Usuario.findOne({
        where: {
          email: req.body.email
        }
      });
      
      console.log('🔑 Usuario encontrado:', userToLogin ? 'Sí' : 'No');
      
      if(userToLogin){
        // Comparar contraseña usando bcrypt
        let isOkThePassword = bcrypt.compareSync(req.body.contraseña, userToLogin.password);
        console.log('🔑 Password válido:', isOkThePassword);
        
        if(isOkThePassword){
          // Limpiar intentos fallidos
          clearFailedAttempts(req);
          
          // Guardar usuario en sesión
          req.session.userLogged = {
            id: userToLogin.id,
            firstName: userToLogin.nombre,
            lastName: userToLogin.apellido,
            email: userToLogin.email,
            category: userToLogin.rol === 'admin' ? 'Administrador' : 'Cliente',
            rol: userToLogin.rol,
            image: userToLogin.avatar
          };
          
          console.log('🔑 Usuario guardado en sesión:', req.session.userLogged);
          
          // Forzar guardado de sesión
          req.session.save((err) => {
            if (err) {
              console.log('❌ Error guardando sesión:', err);
            } else {
              console.log('✅ Sesión guardada correctamente');
            }
          });
          
          // Log de seguridad para login exitoso
          logSecurityEvent('successful_login', {
            userId: userToLogin.id,
            email: userToLogin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
          
          console.log(`✅ Login exitoso: ${userToLogin.email} (${userToLogin.rol})`);
          
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
            let userInDb = await Usuario.findOne({
              where: {
                email: req.body.correo
              }
            });
            
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
              nombre: req.body.firstName || req.body.nombre,
              apellido: req.body.lastName || req.body.apellido,
              email: req.body.correo,
              password: bcrypt.hashSync(req.body.contrasena, 10),
              avatar: req.file ? req.file.filename : 'default.jpg',
              rol: 'cliente'
            }
            
            await Usuario.create(userToCreate);
            return res.redirect('/users/login');
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
        return res.redirect('/users/login');
      }
      res.render('profile', { user: req.session.userLogged });
    }
}

module.exports = controller