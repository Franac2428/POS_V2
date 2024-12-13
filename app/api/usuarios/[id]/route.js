const { PrismaClient } = require('@prisma/client');
import { NextResponse } from 'next/server';
const bcrypt = require("bcrypt");
import crypto from "crypto";

const prisma = new PrismaClient();

//Listado de usuarios
export async function GET(request, { params }) {
    const { id } = params;
  
    try {
      const usuario = await prisma.usuarios.findUnique({
        where: { idUsuario: Number(id) },
        select: {
          idUsuario:true,  
          nombre:true,
          apellidos:true,
          correo:true,
          telefono:true,
          idRol:true,
          usuario:true,
          esEmpleado:true,
          direccion:true
        },
      });
  
      if (!usuario) {
        return NextResponse.json({
          code: 204,
          status: "failed",
          message: "No se encontraron registros.",
        }, { status: 204 });
      }
  
      
      return NextResponse.json({
        code: 200,
        status: "success",
        data:usuario,
        message: "Se ha obtenido el usuario satisfactoriamente",
      }, { status: 200 });
  
    } 
    catch (error) {
      console.error('Error al obtener el usuario:', error);
      return NextResponse.json({
        code: 500,
        status: "error",
        message: "Error al obtener el usuario: " + error.message,
      }, { status: 500 });
    }
}

export async function PUT(request) {
  try {
    const model = await request.json();

    // Actualizar clave
    const actualizaUsuario = await prisma.usuarios.update({
      where: {
        idUsuario: model.idUsuario,
      },
      data: {
        clave: await bcrypt.hash(model.clave, 10),
        idUsuarioModificacion:model.idUsuario,
        fechaModificacion: new Date()
      },
    });

    // Verificar si se creó el usuario
    if (!actualizaUsuario) {
      return NextResponse.json({
        code: 400,
        status: "error",
        message: "Error al actualizar la contraseña del usuario",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Se ha actualizado la contraseña correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar la contraseña del usuario:", error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message:
        "Error al actualizar la contraseña del usuario: " + error.message,
    });
  }
}
