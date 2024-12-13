import { NextResponse } from 'next/server';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const cliente = await prisma.proveedores.findUnique({
      select: {
        Nombre:true,
        Contacto:true,
        Telefono:true,
        Email:true,
        SitioWeb:true,
        Direccion:true
      },
      where:{
        ProveedorID:Number(id)
      }

    });

    if (!cliente) {
      return NextResponse.json({
        code: 204,
        status: "failed",
        message: "No se encontraron registros.",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data:cliente,
      message: "Se ha obtenido el proveedor satisfactoriamente",
    });
    
  }
  catch (error) {
    console.error('Error al obtener el proveedor:', error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al obtener el proveedor: " + error.message,
    });
  }

}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const model = await request.json();

    const actualizarProveedor = await prisma.proveedores.update({
      data: {
        Nombre: model.nombre,
        Telefono: model.telefono,
        Email: model.correo,
        SitioWeb: model.web,
        IdUsuarioModificacion: model.idUsuarioModificacion,
        FechaModificacion: new Date(),
        Direccion: model.direccion,
        Contacto: model.nombreContacto,
      },
      where: {
        ProveedorID: Number(id),
      },
    });

    // Verificar si se creó el proveedor
    if (!actualizarProveedor) {
      return NextResponse.json({
        code: 400,
        status: "error",
        message: "Error al actualizar el proveedor"
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Proveedor actualizado satisfactoriamente"
    });
  }
  catch (error) {
    console.error("Error al actualizar el proveedor:", error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al actualizar el proveedor: " + error.message,
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const model = await request.json();

    const eliminarProveedor = await prisma.proveedores.update({
      data: {
        Eliminado:true,
        IdUsuarioModificacion: model.idUsuarioModificacion,
        FechaModificacion: new Date(),
      },
      where: {
        ProveedorID: Number(id),
      },
    });

    // Verificar si se eliminó el proveedor
    if (!eliminarProveedor) {
      return NextResponse.json({
        code: 400,
        status: "error",
        message: "Error al eliminar el proveedor",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Proveedor eliminado satisfactoriamente",
    });
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al eliminar el proveedor: " + error.message,
    });
  }
}
