-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: petshop_innovador_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `petshop_innovador_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `petshop_innovador_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `petshop_innovador_db`;

--
-- Table structure for table `carrito_items`
--

DROP TABLE IF EXISTS `carrito_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carrito_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `carrito_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_in_cart` (`carrito_id`,`producto_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `carrito_items_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carrito_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito_items`
--

LOCK TABLES `carrito_items` WRITE;
/*!40000 ALTER TABLE `carrito_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `carrito_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `one_cart_per_user` (`usuario_id`),
  CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `carritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Perros','Productos para perros de todas las edades','dog-category.jpg',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(2,'Gatos','Productos para gatos y felinos','cat-category.jpg',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(3,'Accesorios','Accesorios generales para mascotas','toys-category.jpg',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(4,'Alimentos','Alimentos balanceados y snacks','food-category.jpg',1,'2025-08-25 20:26:19','2025-08-25 20:26:19');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `direcciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `alias` varchar(50) DEFAULT 'Principal',
  `calle` varchar(255) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `provincia` varchar(100) NOT NULL,
  `codigo_postal` varchar(10) NOT NULL,
  `es_principal` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marcas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (1,'Royal Canin','Nutrici├│n cient├¡fica para mascotas','royal-canin-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(2,'Pro Plan','Nutrici├│n avanzada Purina Pro Plan','pro-plan-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(3,'Excellent','Alimento premium nacional','excellent-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(4,'Hills','Hills Science Diet','hills-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(5,'Whiskas','Alimento para gatos','whiskas-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(6,'Kong','Juguetes resistentes','kong-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(7,'Flexi','Correas retr├íctiles','flexi-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(8,'Petshop Innovador','Marca propia de accesorios','petshop-logo.png',1,'2025-08-25 20:26:19','2025-08-25 20:26:19');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden_items`
--

DROP TABLE IF EXISTS `orden_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orden_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orden_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orden_id` (`orden_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `orden_items_ibfk_3` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orden_items_ibfk_4` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_items`
--

LOCK TABLES `orden_items` WRITE;
/*!40000 ALTER TABLE `orden_items` DISABLE KEYS */;
INSERT INTO `orden_items` VALUES (1,1,1,'2025-08-28 02:37:21',1,18500.00,18500.00,'Royal Canin Adult 15kg','imagen1.jpg','2025-08-28 02:37:21'),(2,1,2,'2025-08-28 02:37:21',1,12800.00,12800.00,'Pro Plan Kitten 7.5kg','imagen2.jpg','2025-08-28 02:37:21'),(3,5,1,'2025-08-28 02:42:11',1,18500.00,18500.00,'Royal Canin Adult 15kg','imagen1.jpg','2025-08-28 02:42:11'),(4,6,1,'2025-08-28 17:26:24',1,18500.00,18500.00,'Royal Canin Adult 15kg','imagen1.jpg','2025-08-28 17:26:24'),(5,7,25,'2025-08-28 17:43:55',1,20000.00,20000.00,'Alimento para Donna','logo_petshop.jpeg','2025-08-28 17:43:55'),(6,8,8,'2025-08-29 18:38:19',5,12500.00,62500.00,'Rascador Torre Sisal 120cm','imagen8.jpg','2025-08-29 18:38:19');
/*!40000 ALTER TABLE `orden_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes`
--

DROP TABLE IF EXISTS `ordenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ordenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_number` varchar(20) NOT NULL,
  `status` enum('pendiente','procesando','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `payment_method` varchar(50) NOT NULL,
  `payment_status` enum('pendiente','pagado','fallido','reembolsado') DEFAULT 'pendiente',
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_state` varchar(100) NOT NULL,
  `shipping_postal_code` varchar(20) NOT NULL,
  `shipping_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `estimated_delivery` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `ordenes_user_id_foreign_idx` (`user_id`),
  CONSTRAINT `ordenes_user_id_foreign_idx` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes`
--

LOCK TABLES `ordenes` WRITE;
/*!40000 ALTER TABLE `ordenes` DISABLE KEYS */;
INSERT INTO `ordenes` VALUES (1,31300.00,39373.00,'2025-08-28 02:37:21','2025-08-28 02:37:21',1,'TEST-1756348641725','pendiente','tarjeta_credito','pagado','Av. Test 123','Buenos Aires','CABA','1234',1500.00,6573.00,'Orden de prueba',NULL,NULL,NULL),(2,18500.00,27385.00,'2025-08-28 02:38:13','2025-08-28 02:38:13',4,'ORD-1756348693591','pendiente','debit_card','pagado','Salta 171, bella vista','Bella Viata','Buenos Aires','1661',5000.00,3885.00,'Pago procesado - ID: TXN-1756348693591-1e1k5jc2u',NULL,'0000-00-00 00:00:00',NULL),(3,18500.00,27385.00,'2025-08-28 02:39:14','2025-08-28 02:39:14',4,'ORD-1756348754420','pendiente','debit_card','pagado','Salta 171, bella vista','Bella Viata','Buenos Aires','1661',5000.00,3885.00,'Pago procesado - ID: TXN-1756348754420-ow4cuvzio',NULL,'0000-00-00 00:00:00',NULL),(4,18500.00,27385.00,'2025-08-28 02:41:06','2025-08-28 02:41:06',4,'ORD-1756348866098','pendiente','debit_card','pagado','Salta 171, bella vista','Bella Viata','Buenos Aires','1661',5000.00,3885.00,'Pago procesado - ID: TXN-1756348866098-wvbltman4',NULL,'0000-00-00 00:00:00',NULL),(5,18500.00,27385.00,'2025-08-28 02:42:11','2025-08-28 03:20:32',4,'ORD-1756348931302','procesando','debit_card','pagado','Salta 171, bella vista','Bella Viata','Buenos Aires','1661',5000.00,3885.00,'Pago procesado - ID: TXN-1756348931302-q3hjbsg7n',NULL,'0000-00-00 00:00:00',NULL),(6,18500.00,27385.00,'2025-08-28 17:26:24','2025-08-28 17:31:35',1,'ORD-1756401984035','enviado','debit_card','pagado','Salta 171, bella vista','Bella Viata','Buenos Aires','1661',5000.00,3885.00,'Enviado por Adreani ','NS-44381029','0000-00-00 00:00:00',NULL),(7,20000.00,29200.00,'2025-08-28 17:43:55','2025-08-28 17:43:55',1,'ORD-1756403035489','pendiente','debit_card','pagado','Salta 171, bella vista','Bella Viata','Buenos Aires','1661',5000.00,4200.00,'Pago procesado - ID: TXN-1756403035489-ya90udt8v',NULL,'0000-00-00 00:00:00',NULL),(8,62500.00,75625.00,'2025-08-29 18:38:19','2025-08-29 18:38:19',1,'ORD-1756492699144','pendiente','mercadopago','pagado','Salta 171, bella vista','Bella Viata','Buenos Aires','1661',0.00,13125.00,'Pago procesado - ID: TXN-1756492699144-p9x5vogee',NULL,'0000-00-00 00:00:00',NULL);
/*!40000 ALTER TABLE `ordenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_imagenes`
--

DROP TABLE IF EXISTS `producto_imagenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `producto_imagenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `es_principal` tinyint(1) DEFAULT 0,
  `orden` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `producto_imagenes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_imagenes`
--

LOCK TABLES `producto_imagenes` WRITE;
/*!40000 ALTER TABLE `producto_imagenes` DISABLE KEYS */;
INSERT INTO `producto_imagenes` VALUES (1,1,'imagen1.jpg',1,0,'2025-08-25 20:27:21'),(2,2,'imagen2.jpg',1,0,'2025-08-25 20:27:21'),(3,3,'imagen3.jpg',1,0,'2025-08-25 20:27:21'),(4,4,'imagen4.jpg',1,0,'2025-08-25 20:27:21'),(5,5,'imagen5.jpg',1,0,'2025-08-25 20:27:21'),(6,6,'imagen6.jpg',1,0,'2025-08-25 20:27:21'),(7,7,'imagen7.jpg',1,0,'2025-08-25 20:27:21'),(8,8,'imagen8.jpg',1,0,'2025-08-25 20:27:21'),(9,9,'imagen9.jpg',1,0,'2025-08-25 20:27:21'),(10,10,'imagen10.jpg',1,0,'2025-08-25 20:27:21'),(11,11,'imagen11.jpg',1,0,'2025-08-25 20:27:21'),(12,12,'pasteldepapa.webp',1,0,'2025-08-25 20:27:21'),(13,13,'20802.jpg',1,0,'2025-08-25 20:27:21'),(14,14,'retrato-adorable-perro-pitbull.jpg',1,0,'2025-08-25 20:27:21'),(15,15,'mochila-para-gatos.jpg',1,0,'2025-08-25 20:27:21'),(16,16,'producto-1695573004708.jpg',1,0,'2025-08-25 20:27:21'),(17,17,'logo_petshop.jpeg',1,0,'2025-08-25 20:27:21'),(18,18,'logo.png',1,0,'2025-08-25 20:27:21'),(19,19,'1701302379645.jpg',1,0,'2025-08-25 20:27:21'),(20,20,'hueso-perro.jpg',1,0,'2025-08-25 20:27:21');
/*!40000 ALTER TABLE `producto_imagenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `borrado` tinyint(1) NOT NULL DEFAULT 0,
  `destacado` tinyint(1) NOT NULL DEFAULT 0,
  `peso` varchar(50) DEFAULT NULL,
  `edad` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `subcategoria_id` int(11) DEFAULT NULL,
  `marca_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_subcategory` (`subcategory`),
  KEY `idx_borrado` (`borrado`),
  KEY `idx_destacado` (`destacado`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Royal Canin Adult 15kg','Alimento premium para perros adultos de todas las razas. F├│rmula balanceada con prote├¡nas de alta calidad.','imagen1.jpg','Perros','Alimentos','Royal Canin','Natural',18500.00,41,0,1,'15kg','Adulto','2025-08-25 20:17:25','2025-08-28 17:26:24',NULL,1,5,1),(2,'Pro Plan Kitten 7.5kg','Alimento para gatitos hasta 12 meses. Rico en DHA para el desarrollo cerebral y visual.','imagen2.jpg','Gatos','Alimentos','Pro Plan','Natural',12800.00,32,0,1,'7.5kg','Cachorro','2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,2,5,2),(3,'Collar Premium Antipulgas','Collar resistente con protecci├│n antipulgas de larga duraci├│n. Ajustable y c├│modo.','imagen3.jpg','Perros','Accesorios','Flexi','Negro',3200.00,25,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,4,7),(4,'Cama Ortop├®dica Premium','Cama ortop├®dica con memory foam para perros grandes. Ideal para mascotas de edad avanzada.','imagen4.jpg','Perros','Comodidad','PetBed','Gris',8900.00,12,0,1,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,3,8),(5,'Kong Classic Rojo M','Juguete interactivo de caucho natural ultra resistente. Perfecto para rellenar con premios.','imagen5.jpg','Perros','Juguetes','Kong','Rojo',2850.00,38,0,1,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,8,6),(6,'Arena Sanitaria M├║ltiple Gato','Arena aglutinante con control de olores. F├│rmula especial para m├║ltiples gatos.','imagen6.jpg','Gatos','Higiene y salud','Cat\'s Best','Natural',4200.00,55,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,2,6,8),(7,'Correa Retr├íctil Flexi 5m','Correa retr├íctil profesional para perros hasta 50kg. Sistema de frenado suave.','imagen7.jpg','Perros','Accesorios','Flexi','Negro',5400.00,28,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,4,7),(8,'Rascador Torre Sisal 120cm','Torre rascadora con plataformas m├║ltiples y juguetes colgantes. Base estable.','imagen8.jpg','Gatos','Juguetes','Cat Tree','Beige',12500.00,3,0,1,NULL,NULL,'2025-08-25 20:17:25','2025-08-29 18:38:19',NULL,2,7,8),(9,'Shampoo Hipoalerg├®nico','Shampoo especial para pieles sensibles. Sin parabenos ni sulfatos.','imagen9.jpg','Perros','Higiene y salud','Virbac','Transparente',1850.00,42,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,NULL,8),(10,'Transportadora Deluxe','Transportadora r├¡gida homologada para viajes en avi├│n. Ventilaci├│n superior.','imagen10.jpg','Perros','Accesorios','Petmate','Azul',15800.00,6,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,NULL,8),(11,'Hills Science Diet Senior','Alimento terap├®utico para perros senior. F├│rmula especial para articulaciones.','imagen11.jpg','Perros','Alimentos','Hills','Natural',16200.00,22,0,1,'12kg','Senior','2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,NULL,4),(12,'Fuente de Agua Autom├ítica','Fuente de agua con filtro y circulaci├│n continua. Capacidad 2.5L.','pasteldepapa.webp','Gatos','Accesorios','PetSafe','Blanco',8500.00,15,0,1,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,2,NULL,8),(13,'Excellent Cachorro 20kg','Alimento s├║per premium para cachorros de razas grandes. Con DHA y calcio.','20802.jpg','Perros','Alimentos','Excellent','Natural',14500.00,35,0,0,'20kg','Cachorro','2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,5,3),(14,'Pelota Tennis Premium','Set de 3 pelotas de tenis reforzadas. Resistentes a mordidas intensas.','retrato-adorable-perro-pitbull.jpg','Perros','Juguetes','ChuckIt','Amarillo',1200.00,68,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,8,8),(15,'Whiskas Adult Pescado 7kg','Alimento completo para gatos adultos sabor pescado. Rico en omega 3.','mochila-para-gatos.jpg','Gatos','Alimentos','Whiskas','Natural',8900.00,48,0,0,'7kg','Adulto','2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,2,5,5),(16,'Arn├®s Ajustable Acolchado','Arn├®s ergon├│mico con acolchado en pecho. Distribuci├│n uniforme de presi├│n.','producto-1695573004708.jpg','Perros','Accesorios','Julius K9','Negro',4200.00,30,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,NULL,8),(17,'Vitaminas Multi-Pet','Complejo vitam├¡nico para mascotas. Fortalece sistema inmunol├│gico.','logo_petshop.jpeg','General','Higiene y salud','VetLife','Natural',2400.00,52,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,3,9,8),(18,'Cepillo Desenredante','Cepillo profesional para pelo largo. Cerdas de acero inoxidable.','logo.png','General','Higiene y salud','FURminator','Azul',3600.00,25,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,3,NULL,8),(19,'Comedero Autom├ítico','Dispensador de alimento programable. 6 comidas al d├¡a con control de porciones.','1701302379645.jpg','General','Accesorios','SureFlap','Blanco',18500.00,5,0,1,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,3,11,8),(20,'Antipulgas Advantage','Pipeta antipulgas de acci├│n r├ípida. Protecci├│n por 4 semanas.','hueso-perro.jpg','Perros','Higiene y salud','Bayer','Transparente',980.00,78,0,0,NULL,NULL,'2025-08-25 20:17:25','2025-08-25 20:27:21',NULL,1,NULL,8),(21,'Producto de Prueba TEST','Este es un producto de prueba creado desde script','test-image.jpg','Perros','Juguetes','Test Brand','Rojo',99.99,10,1,0,'1kg','Adulto','2025-08-25 20:38:12','2025-08-25 20:51:35',NULL,NULL,NULL,NULL),(22,'Carlos Sebastian','prueba de DB','logo_petshop.jpeg','Perros','Alimentos','Royal enfield','azul',50.00,50,1,0,'15','Cachorro','2025-08-25 20:52:20','2025-08-25 20:52:55',NULL,NULL,NULL,NULL),(23,'Carlos Duarte','Prueba DB','logo_petshop.jpeg','Perros','Alimentos','honda','azul',100.00,50,1,1,'15','Cachorro','2025-08-25 20:53:52','2025-08-25 21:12:01',NULL,NULL,NULL,NULL),(24,'Carlos duarte','hol hola','logo_petshop.jpeg','Perros','Alimentos','Royal enfield','azul',100.00,50,1,0,'15','Adulto','2025-08-25 21:12:56','2025-08-28 00:54:14',NULL,NULL,NULL,NULL),(25,'Alimento para Donna','donna la redonda donna','logo_petshop.jpeg','Perros','Alimentos','Royal enfield','',20000.00,0,0,0,'25','Adulto','2025-08-28 17:34:33','2025-08-28 17:43:55',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategorias`
--

DROP TABLE IF EXISTS `subcategorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subcategorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_subcat_per_cat` (`categoria_id`,`nombre`),
  CONSTRAINT `subcategorias_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategorias`
--

LOCK TABLES `subcategorias` WRITE;
/*!40000 ALTER TABLE `subcategorias` DISABLE KEYS */;
INSERT INTO `subcategorias` VALUES (1,1,'Alimento Seco','Croquetas y alimento balanceado',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(2,1,'Juguetes','Juguetes para entretenimiento',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(3,1,'Camas y Descanso','Camas, mantas y lugares de descanso',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(4,1,'Collares y Correas','Accesorios para pasear',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(5,2,'Alimento Seco','Croquetas para gatos',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(6,2,'Arena Sanitaria','Arena para cajas sanitarias',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(7,2,'Rascadores','Rascadores y torres',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(8,2,'Juguetes','Juguetes espec├¡ficos para gatos',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(9,3,'Higiene','Productos de higiene y cuidado',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(10,3,'Transporte','Transportadoras y carriers',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(11,3,'Comederos','Platos y comederos',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(12,4,'Premium','Alimentos premium y super premium',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(13,4,'Snacks','Premios y snacks',1,'2025-08-25 20:26:19','2025-08-25 20:26:19'),(14,4,'Medicados','Alimentos terap├®uticos',1,'2025-08-25 20:26:19','2025-08-25 20:26:19');
/*!40000 ALTER TABLE `subcategorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `rol` enum('cliente','admin') DEFAULT 'cliente',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Admin','PetShop','admin@petshop.com','$2a$10$E/MWSPiCjn4oWEf87w2p0eScPOajXKyz0IxDaHfviMa1nhjj6ZX7K',NULL,NULL,NULL,'admin',1,'2025-08-25 20:26:39','2025-08-28 02:46:52'),(2,'Juan','P├®rez','juan@email.com','$2b$10$ClXFCx3Q0LluWTyscL0MD.ia0Mq3raoKweJ2pwUTv7.InapWaWUDe','+54 11 1234-5678',NULL,NULL,'cliente',1,'2025-08-25 20:26:39','2025-08-25 20:26:39'),(3,'Mar├¡a','Gonz├ílez','maria@email.com','$2b$10$CJU76sDQSFuU/S7Jg9RaWeNx5XlH1fJYBNgAuTmIRHK/FbieJzmMS','+54 11 8765-4321',NULL,NULL,'cliente',1,'2025-08-25 20:26:39','2025-08-25 20:26:39'),(4,'marcos valentin','duarte','valentinduarte1@hotmail.com','$2a$10$PLbkVU9ZLobtsKSTCq6RZOt.PBTSs9Bn27/c/Xw31mYga3DDBUcfa',NULL,NULL,'user-1756339581876.jpg','admin',1,'2025-08-28 00:06:21','2025-08-28 00:54:33');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-24 20:10:19
