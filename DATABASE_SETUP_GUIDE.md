# ==============================================
# INSTRUCCIONES PARA CONFIGURAR BASE DE DATOS
# ==============================================

## Opción 1: XAMPP Local (Recomendado para desarrollo)
# 1. Descargar: https://www.apachefriends.org/download.html
# 2. Instalar XAMPP
# 3. Abrir XAMPP Control Panel
# 4. Iniciar Apache y MySQL
# 5. Usar esta configuración en .env:

DB_HOST=localhost
DB_PORT=3306
DB_NAME=petshop_innovador_db
DB_USER=root
DB_PASSWORD=

## Opción 2: PlanetScale (Gratis, fácil)
# 1. Ir a: https://planetscale.com/
# 2. Crear cuenta gratis
# 3. Crear nueva base de datos
# 4. Obtener connection string
# 5. Usar esta configuración en .env:

# DB_HOST=tu-host.psdb.cloud
# DB_PORT=3306
# DB_NAME=tu-database-name
# DB_USER=tu-username
# DB_PASSWORD=tu-password

## Opción 3: Railway (Gratis con GitHub)
# 1. Ir a: https://railway.app/
# 2. Conectar con GitHub
# 3. Crear nuevo proyecto → Add MySQL
# 4. Copiar credenciales
# 5. Usar esta configuración en .env:

# DB_HOST=containers-us-west-xxx.railway.app
# DB_PORT=6543
# DB_NAME=railway
# DB_USER=root
# DB_PASSWORD=tu-password-generado

## Opción 4: Aiven (Gratis por 1 mes)
# 1. Ir a: https://aiven.io/
# 2. Crear cuenta gratis
# 3. Crear servicio MySQL
# 4. Descargar certificados SSL
# 5. Usar configuración con SSL

## Opción 5: FreeSQLDatabase (Gratis, simple)
# 1. Ir a: https://www.freesqldatabase.com/
# 2. Crear cuenta gratis
# 3. Crear base de datos MySQL
# 4. Usar credenciales proporcionadas

# ==============================================
# PASOS DESPUÉS DE CONFIGURAR:
# ==============================================
# 1. Actualizar .env con las credenciales correctas
# 2. Ejecutar: node setup-database.js
# 3. Ejecutar: node migrate-to-db.js
# 4. Reiniciar servidor: npm test
