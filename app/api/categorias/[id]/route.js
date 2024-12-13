import { NextResponse } from 'next/server';
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const categoria = await prisma.categoriasProducto.findUnique({
      where: {
        CategoriaProductoID: Number(params.id),
      },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    return NextResponse.json({ error: 'Error al obtener la categoría' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const model = await request.json();

    const actualizarCategoria = await prisma.categoriasProducto.update({
      data: {
        NombreCategoria:model.nombre,
        Descripcion:model.descripcion,
        IdUsuarioModificacion:model.idUsuarioModificacion,
        FechaModificacion: new Date()
      },
      where:{
        CategoriaProductoID:Number(id)
      }
    });

    // Verificar si se creó el usuario
    if (!actualizarCategoria) {
      return NextResponse.json({
        code: 400,
        status: "error",
        message: "Error al actualizar la categoría"
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Categoría actualizada satisfactoriamente"
    });
  }
  catch (error) {
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al actualizar la categoría: " + error.message
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const model = await request.json();

    const eliminarCategoria = await prisma.categoriasProducto.update({
      data: {
        Eliminado:true,
        IdUsuarioModificacion: model.idUsuarioModificacion,
        FechaModificacion: new Date(),
      },
      where: {
        CategoriaProductoID: Number(id),
      },
    });

    // Verificar si se eliminó el usuario
    if (!eliminarCategoria) {
      return NextResponse.json({
        code: 400,
        status: "error",
        message: "Error al actualizar la categoría",
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Categoría eliminada satisfactoriamente",
    });
  } catch (error) {
    console.error("Error al eliminar la categoría:", error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al eliminar la categoría: " + error.message,
    });
  }
}
