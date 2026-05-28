export const SUPERADMIN_EMAIL = 'admin@gmail.com'
 
export const esSuperAdmin = (usuario) =>
    usuario?.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
 
export const esSuperAdminPorEmail = (email) =>
    email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
 
export const filtrarSuperAdmin = (usuarios) =>
    usuarios.filter((u) => !esSuperAdminPorEmail(u.email))