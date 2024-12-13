import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const listaCategorias = await prisma.categoriasProducto.findMany({
      select: {
        CategoriaProductoID:true,
        NombreCategoria:true,
        Descripcion:true,
        Eliminado:true,
        FechaCreacion:true
      }
    });

    if (listaCategorias.length == 0) {
      return NextResponse.json({
        code: 204,
        status: "failed",
        message: "No se encontraron registros.",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: listaCategorias,
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

    const nuevaCategoria = await prisma.categoriasProducto.create({
      data: {
        NombreCategoria: model.nombre,
        Descripcion: model.descripcion,
        IdUsuarioCreacion: model.idUsuarioCreacion
      },
    });

    // Verificar si se creó
    if (!nuevaCategoria) {
      return NextResponse.json({
        code: 400,
        status: "error",
        message: "Error al registrar la categoría",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Categoría registrada satisfactoriamente",
    });
  } 
  catch (error) {
    console.error("Error al registrar la categoría:", error);
    
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al registrar la categoría: " + error.message,
    });
  }
}
