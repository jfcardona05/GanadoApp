CREATE DATABASE IF NOT EXISTS ganadoapp_db;
USE ganadoapp_db;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'GANADERO') DEFAULT 'GANADERO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fincas (
    id_finca INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150),
    hectareas DECIMAL(10,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE animales (
    id_animal INT AUTO_INCREMENT PRIMARY KEY,
    id_finca INT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100),
    foto VARCHAR(255),
    raza VARCHAR(100),
    sexo ENUM('MACHO', 'HEMBRA') NOT NULL,
    fecha_nacimiento DATE,
    peso_actual DECIMAL(10,2),
    estado_salud ENUM('SANO', 'ENFERMO', 'EN_TRATAMIENTO', 'VENDIDO', 'MUERTO') DEFAULT 'SANO',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_finca) REFERENCES fincas(id_finca)
    ON DELETE CASCADE
);

CREATE TABLE vacunas (
    id_vacuna INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    frecuencia_dias INT,
    obligatoria BOOLEAN DEFAULT FALSE
);

CREATE TABLE registros_vacunacion (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_animal INT NOT NULL,
    id_vacuna INT NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    proxima_fecha DATE,
    veterinario VARCHAR(100),
    observaciones TEXT,

    FOREIGN KEY (id_animal) REFERENCES animales(id_animal)
    ON DELETE CASCADE,

    FOREIGN KEY (id_vacuna) REFERENCES vacunas(id_vacuna)
    ON DELETE CASCADE
);

CREATE TABLE registros_peso (
    id_peso INT AUTO_INCREMENT PRIMARY KEY,
    id_animal INT NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    fecha_registro DATE NOT NULL,
    observaciones TEXT,

    FOREIGN KEY (id_animal) REFERENCES animales(id_animal)
    ON DELETE CASCADE
);

CREATE TABLE gastos (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_finca INT NOT NULL,
    categoria ENUM('ALIMENTACION', 'MEDICAMENTOS', 'MANO_OBRA', 'TRANSPORTE', 'OTRO') NOT NULL,
    descripcion VARCHAR(255),
    monto DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,

    FOREIGN KEY (id_finca) REFERENCES fincas(id_finca)
    ON DELETE CASCADE
);

CREATE TABLE ingresos (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    id_finca INT NOT NULL,
    categoria ENUM('VENTA_GANADO', 'VENTA_LECHE', 'OTRO') NOT NULL,
    descripcion VARCHAR(255),
    monto DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,

    FOREIGN KEY (id_finca) REFERENCES fincas(id_finca)
    ON DELETE CASCADE
);