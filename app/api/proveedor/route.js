import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const listaProveedores = await prisma.proveedores.findMany({
      select: {
        ProveedorID:true,
        Nombre:true,
        Telefono:true,
        Email:true,
        SitioWeb:true,
        Eliminado:true,
        FechaCreacion:true,
        Direccion:true,
        Contacto:true
      }
    });

    if (listaProveedores.length == 0) {
      return NextResponse.json({
        code: 204,
        status: "failed",
        message: "No se encontraron registros.",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: listaProveedores,
      message: "",
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return NextResponse.json(
      {
        code: 500,
        status: "error",
        message: "Error al obtener los datos: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const model = await request.json();

    const nuevoProveedor = await prisma.proveedores.create({
      data: {
        Nombre: model.nombre,
        Telefono: model.telefono,
        Email: model.correo,
        SitioWeb: model.web,
        IdUsuarioCreacion:model.idUsuarioCreacion,
        FechaCreacion: new Date(),
        Direccion: model.direccion,
        Contacto: model.nombreContacto,
      },
    });

    // Verificar si se creó
    if (!nuevoProveedor) {
      return NextResponse.json({
        code: 400,
        status: "error",
        message: "Error al registrar el proveedor",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Proveedor registrado satisfactoriamente",
    });
  } 
  catch (error) {
    console.error("Error al registrar el proveedor:", error);
    
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al registrar el proveedor: " + error.message,
    });
  }
}

