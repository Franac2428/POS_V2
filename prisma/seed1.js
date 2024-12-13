//Archivo seed de inserts
//Inserta lo que se ocupa para que el sistema inicie correctamente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function main() {
    try {
        await Promise.all([
            // Insertar tipos de movimiento
            prisma.TipoMovimiento.createMany({
                data: [
                    { nombre: "Entrada" },
                    { nombre: "Salida" }
                ]
            }),

            // Insertar categoría de productos de venta
            prisma.CategoriaProdVenta.createMany({
                data: [
                    { nombre: 'Pollo Frito', estado: true },
                    { nombre: 'Comida Rápida', estado: true },
                    { nombre: 'Bebidas', estado: true },
                    { nombre: 'Postres', estado: true },
                    { nombre: 'Otros', estado: true },
                ]
            }),

            // Status auditoría login
            prisma.StatusAuditoriaLogin.createMany({
                data: [
                    { Status: 'Pendiente' },
                    { Status: 'Fallido' },
                    { Status: 'Satisfactorio' },
                    { Status: 'No Existe' },
                ]
            }),

            // Medios de pago
            prisma.MedioPago.createMany({
                data: [
                    { nombre: 'Efectivo' },
                    { nombre: 'Tarjeta' },
                    { nombre: 'Transferencia / Sinpe' },
                ]
            }),

            // Insertar estados de movimiento
            prisma.estadoMovimiento.createMany({
                data: [
                    { nombre: 'Pendiente' },
                    { nombre: 'Pagado' },
                    { nombre: 'Anulado' },
                ]
            }),

            // Insertar info empresa
            prisma.infoEmpresa.create({
                data: {
                    nombre: 'Empresa Ejemplo',
                    nombreComercial: 'Comercial Ejemplo',
                    identificacion: '123456789',
                    correo: 'correo@ejemplo.com',
                    telefono: '12345678',
                    celular: '87654321',
                    direccion: '123 Calle Ejemplo',
                    logo: null,
                    tipoImagen: null
                }
            }),

            //Roles
            prisma.roles.createMany({
                data: [
                    {
                        nombre: 'Desarrollador',
                        descripcion: 'Rol para el dev',
                        eliminado: false,
                        oculto: true,
                        idUsuarioCreacion: 1
                    },
                    {
                        nombre: 'Empleado',
                        descripcion: 'Rol para el empleado',
                        eliminado: false,
                        oculto: false,
                        idUsuarioCreacion: 1
                    },

                ]
            }),
           

            //Permisos
            prisma.permisos.createMany({
                data: [
                    { idPermisoPadre: 0, nombre: 'Dashboard', icono: 'Gauge', url: '/dashboard', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Info. Caja', icono: 'Computer', url: '/dashboard/caja', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Facturar', icono: 'CircleDollarSign', url: '/dashboard/facturar', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Facturas', icono: 'ScrollText', url: '/dashboard/facturas', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Adm. Inventario', icono: 'Warehouse', url: '/dashboard/inventario', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Reportes', icono: 'FileLineChart', url: '/dashboard/reporteria', jerarquia: 1, ocultar: true, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Empleados', icono: 'BriefcaseBusiness', url: '/dashboard/empleado', jerarquia: 1, ocultar: true, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Adm. Clientes', icono: 'BookUser', url: '/dashboard/clientes', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Seguridad', icono: 'LockKeyHole', url: '/dashboard/seguridad', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Pedidos', icono: 'Truck', url: '/dashboard/pedido', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Horarios', icono: 'AlarmClock', url: '/dashboard/horas', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 0, nombre: 'Metas', icono: 'BriefcaseBusiness', url: '/dashboard/metas', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: true },
                    { idPermisoPadre: 0, nombre: 'Entrada / Salida', icono: 'Flag', url: '/dashboard/marcar', jerarquia: 1, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: true },
                    { idPermisoPadre: 5, nombre: 'Categorías', icono: null, url: '/dashboard/categorias', jerarquia: 2, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 5, nombre: 'Proveedores', icono: null, url: '/dashboard/proveedores', jerarquia: 2, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 5, nombre: 'Inventario', icono: null, url: '/dashboard/inventario', jerarquia: 2, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 7, nombre: 'Administrar Metas', icono: null, url: '/dashboard/metas', jerarquia: 2, ocultar: true, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 9, nombre: 'Usuarios', icono: null, url: '/dashboard/usuarios', jerarquia: 2, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 9, nombre: 'Roles', icono: null, url: '/dashboard/roles', jerarquia: 2, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 9, nombre: 'Info. Empresa', icono: null, url: '/dashboard/empresa', jerarquia: 2, ocultar: false, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false },
                    { idPermisoPadre: 9, nombre: 'Auditoría Inicio Sesión', icono: null, url: '/dashboard/auditoria', jerarquia: 2, ocultar: true, eliminado: false, idUsuarioCreacion: 1, fechaCreacion: new Date(), opcEmpleado: false }

                ]
            }),






        ]);

        console.log('Primer SEED ejecutado, continúa con el seed2.js');


    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
