import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export async function GET() {
  try {
    const productos = await db.productos.findMany({
      include: {
        Categoria: {
          select: { NombreCategoria: true },
        },
        Proveedor: {
          select: { Nombre: true },
        },
      },
    });

    const productosConNombres = productos.map((producto) => ({
      ProductoID: producto.ProductoID,
      Nombre: producto.Nombre,
      Descripcion: producto.Descripcion,
      PrecioCompra: producto.PrecioCompra,
      PrecioVenta: producto.PrecioVenta,
      Stock: producto.Stock,
      CategoriaID: producto.CategoriaID,
      ProveedorID: producto.ProveedorID,
      FechaIngreso: producto.FechaIngreso,
      FechaCaducidad: producto.FechaCaducidad,
      Estado: producto.Estado,
      NombreCategoria: producto.Categoria?.NombreCategoria || "N/A",
      NombreProveedor: producto.Proveedor?.Nombre || "N/A",
    }));

    return NextResponse.json(productosConNombres);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 });
  }
}


export async function POST(request) {
  const data = await request.json();
  try {
    const nuevoProducto = await db.productos.create({
      data: {
        Nombre: data.Nombre,
        Descripcion: data.Descripcion,
        PrecioCompra: data.PrecioCompra,
        PrecioVenta: data.PrecioVenta,
        Stock: data.Stock,
        CategoriaID: data.CategoriaID,  
        ProveedorID: data.ProveedorID,  
        FechaIngreso: new Date(data.FechaIngreso),
        FechaCaducidad: data.FechaCaducidad ? new Date(data.FechaCaducidad) : null,
        Estado: data.Estado,
      },
    });
    return NextResponse.json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
  }
}
