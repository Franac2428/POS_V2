import db from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
      const pedidos = await db.pedido.findMany
      ({
        include: {
          proveedores: true, 
        },
    });
      return NextResponse.json(pedidos);
    } catch (error) {
      return NextResponse.json({ error: 'Error al obtener los pedidos' }, { status: 500 });
    }
}

export async function POST(request) {
  const data = await request.json();
  const { proveedorId, medioPedido, productos, observaciones, estado, fechaFinalizacion } = data;

  try {
    const nuevoPedido = await db.pedido.create({
      data: {
        proveedorId,
        medioPedido,
        productos,
        observaciones,
        estado,
        fechaFinalizacion,
      },
      // Add include to get provider details immediately after creation
      include: {
        proveedores: true,
      },
    });
    return NextResponse.json(nuevoPedido, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
  }
}
