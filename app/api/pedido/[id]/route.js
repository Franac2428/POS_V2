import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const pedidoActualizado = await db.pedido.update({
      where: {
        id: Number(params.id),
      },
      data: data,
    });
    return NextResponse.json(pedidoActualizado);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const pedido = await db.pedido.delete({
      where: {
        id: Number(params.id),
      },
    });
    return NextResponse.json({ message: 'Pedido eliminado correctamente', pedido });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el pedido' }, { status: 500 });
  }
}


