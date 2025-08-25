// Script para corregir la estructura de categorías en productos.json
const fs = require('fs');
const path = require('path');

// Leer el archivo de productos
const productosPath = path.join(__dirname, 'src/data/productos.json');
const productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));

console.log('🔄 Iniciando corrección de categorías...');
console.log(`📦 Total de productos: ${productos.length}`);

// Mapeo para normalizar las categorías según la nueva estructura
const categoryMapping = {
  // Mascotas (categorías principales)
  'Perros': 'Perros',
  'Gatos': 'Gatos', 
  'General': 'General', // Para productos que aplican a todas las mascotas
  'Aves': 'Aves',       // Por si hay productos para aves
  'Peces': 'Peces'      // Por si hay productos para peces
};

const subcategoryMapping = {
  // Tipos de producto (subcategorías)
  'Alimentos': 'Alimentos',
  'Accesorios': 'Accesorios',
  'Higiene': 'Higiene y salud',
  'Salud': 'Higiene y salud',
  'Juguetes': 'Juguetes',
  'Comodidad': 'Comodidad',
  'Comederos': 'Accesorios',  // Los comederos son accesorios
  'Transporte': 'Accesorios'  // El transporte son accesorios
};

// Procesar cada producto
productos.forEach((producto, index) => {
  const oldCategory = producto.category;
  const oldSubcategory = producto.subcategory;
  
  // INTERCAMBIAR: category y subcategory
  // Lo que antes era subcategory (Perros, Gatos) ahora es category
  // Lo que antes era category (Alimentos, Accesorios) ahora es subcategory
  
  const newCategory = categoryMapping[oldSubcategory] || oldSubcategory;
  const newSubcategory = subcategoryMapping[oldCategory] || oldCategory;
  
  producto.category = newCategory;
  producto.subcategory = newSubcategory;
  
  console.log(`✅ Producto ${index + 1}: ${producto.name}`);
  console.log(`   Antes: ${oldSubcategory} > ${oldCategory}`);
  console.log(`   Después: ${newCategory} > ${newSubcategory}`);
  console.log('');
});

// Guardar el archivo corregido
fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2), 'utf8');

console.log('✅ ¡Corrección completada!');
console.log('📄 Archivo productos.json actualizado');

// Mostrar resumen de categorías
const categorias = [...new Set(productos.map(p => p.category))];
const subcategorias = [...new Set(productos.map(p => p.subcategory))];

console.log('\n📊 RESUMEN:');
console.log('🏷️ Categorías principales (mascotas):');
categorias.forEach(cat => console.log(`   - ${cat}`));

console.log('\n🏷️ Subcategorías (tipos de producto):');
subcategorias.forEach(sub => console.log(`   - ${sub}`));
