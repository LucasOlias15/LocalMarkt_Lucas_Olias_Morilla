//Validaciones Fomularios de registro

export const REGEX_NOMBRE_USUARIO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,80}$/;
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_CONTRASENYA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{8,}$/;
export const REGEX_TELEFONO = /^\+?[0-9\s]{9,15}$/;
export const REGEX_NOMBRE_TIENDA = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\&]{2,60}$/;
export const REGEX_DIRECCION = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\,\.\-\º\ª]{5,120}$/;
export const REGEX_DESCRIPCION_TIENDA = /^[\s\S]{10,500}$/;

// Validaciones Formulario Editar y añadir productos

export const REGEX_NOMBRE = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,()]{3,100}$/;
export const REGEX_DESCRIPCION = /^[\s\S]{10,1000}$/;
export const REGEX_PRECIO = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
export const REGEX_STOCK = /^(0|[1-9]\d*)$/;