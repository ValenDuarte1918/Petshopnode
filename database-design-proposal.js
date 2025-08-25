// DISEÑO RECOMENDADO DE BASE DE DATOS PARA PETSHOP
// =====================================================

/* 
ESTRUCTURA ACTUAL: ❌ Una sola tabla
- productos (20 registros)

ESTRUCTURA RECOMENDADA: ✅ Base de datos normalizada
*/

const database_design = {
  // 1. USUARIOS Y AUTENTICACIÓN
  usuarios: {
    id: 'PRIMARY KEY',
    nombre: 'VARCHAR(100)',
    apellido: 'VARCHAR(100)', 
    email: 'VARCHAR(150) UNIQUE',
    password: 'VARCHAR(255)', // hasheada
    telefono: 'VARCHAR(20)',
    fecha_nacimiento: 'DATE',
    avatar: 'VARCHAR(255)',
    rol: 'ENUM(cliente, admin)',
    activo: 'BOOLEAN DEFAULT true',
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP'
  },

  // 2. CATEGORÍAS (normalizar)
  categorias: {
    id: 'PRIMARY KEY',
    nombre: 'VARCHAR(100)', // Perros, Gatos, Accesorios
    descripcion: 'TEXT',
    imagen: 'VARCHAR(255)',
    activa: 'BOOLEAN DEFAULT true',
    created_at: 'TIMESTAMP'
  },

  // 3. SUBCATEGORÍAS  
  subcategorias: {
    id: 'PRIMARY KEY',
    categoria_id: 'FOREIGN KEY → categorias.id',
    nombre: 'VARCHAR(100)', // Alimento, Juguetes, Camas
    descripcion: 'TEXT',
    activa: 'BOOLEAN DEFAULT true'
  },

  // 4. MARCAS (normalizar)
  marcas: {
    id: 'PRIMARY KEY',
    nombre: 'VARCHAR(100)', // Royal Canin, Pro Plan, etc.
    descripcion: 'TEXT',
    logo: 'VARCHAR(255)',
    activa: 'BOOLEAN DEFAULT true'
  },

  // 5. PRODUCTOS (mejorada)
  productos: {
    id: 'PRIMARY KEY',
    nombre: 'VARCHAR(255)',
    descripcion: 'TEXT',
    categoria_id: 'FOREIGN KEY → categorias.id',
    subcategoria_id: 'FOREIGN KEY → subcategorias.id',
    marca_id: 'FOREIGN KEY → marcas.id',
    precio: 'DECIMAL(10,2)',
    stock: 'INT',
    peso: 'VARCHAR(50)',
    color: 'VARCHAR(50)',
    edad_recomendada: 'VARCHAR(50)',
    destacado: 'BOOLEAN DEFAULT false',
    activo: 'BOOLEAN DEFAULT true',
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP NULL' // soft delete
  },

  // 6. IMÁGENES DE PRODUCTOS
  producto_imagenes: {
    id: 'PRIMARY KEY',
    producto_id: 'FOREIGN KEY → productos.id',
    imagen: 'VARCHAR(255)',
    es_principal: 'BOOLEAN DEFAULT false',
    orden: 'INT'
  },

  // 7. CARRITOS
  carritos: {
    id: 'PRIMARY KEY',
    usuario_id: 'FOREIGN KEY → usuarios.id',
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP'
  },

  // 8. ITEMS DEL CARRITO
  carrito_items: {
    id: 'PRIMARY KEY',
    carrito_id: 'FOREIGN KEY → carritos.id',
    producto_id: 'FOREIGN KEY → productos.id',
    cantidad: 'INT',
    precio_unitario: 'DECIMAL(10,2)', // precio al momento de agregar
    created_at: 'TIMESTAMP'
  },

  // 9. ÓRDENES/PEDIDOS
  ordenes: {
    id: 'PRIMARY KEY',
    usuario_id: 'FOREIGN KEY → usuarios.id',
    numero_orden: 'VARCHAR(50) UNIQUE',
    subtotal: 'DECIMAL(10,2)',
    impuestos: 'DECIMAL(10,2)',
    envio: 'DECIMAL(10,2)',
    total: 'DECIMAL(10,2)',
    estado: 'ENUM(pendiente, pagado, enviado, entregado, cancelado)',
    metodo_pago: 'VARCHAR(50)',
    direccion_envio: 'JSON', // dirección completa
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP'
  },

  // 10. DETALLES DE ÓRDENES
  orden_items: {
    id: 'PRIMARY KEY',
    orden_id: 'FOREIGN KEY → ordenes.id',
    producto_id: 'FOREIGN KEY → productos.id',
    cantidad: 'INT',
    precio_unitario: 'DECIMAL(10,2)',
    subtotal: 'DECIMAL(10,2)'
  },

  // 11. DIRECCIONES DE USUARIOS
  direcciones: {
    id: 'PRIMARY KEY',
    usuario_id: 'FOREIGN KEY → usuarios.id',
    alias: 'VARCHAR(50)', // Casa, Trabajo, etc.
    calle: 'VARCHAR(255)',
    numero: 'VARCHAR(10)',
    ciudad: 'VARCHAR(100)',
    provincia: 'VARCHAR(100)',
    codigo_postal: 'VARCHAR(10)',
    es_principal: 'BOOLEAN DEFAULT false'
  }
};

// BENEFICIOS DE ESTA ESTRUCTURA:
const beneficios = [
  '✅ Normalización: sin duplicación de datos',
  '✅ Escalabilidad: fácil agregar nuevas funcionalidades',
  '✅ Integridad: relaciones y constraints',
  '✅ Rendimiento: índices y optimizaciones',
  '✅ Mantenimiento: cambios aislados por tabla',
  '✅ Funcionalidad completa: usuarios, carritos, órdenes'
];

module.exports = { database_design, beneficios };
