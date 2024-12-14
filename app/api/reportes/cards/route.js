import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Obtener el conteo de productos no eliminados
        const productosInventario = await prisma.productoVenta.count({
            where: { eliminado: false }
        });

        // Obtener el conteo de clientes no eliminados
        const totalClientes = await prisma.clientes.count({
            where: { eliminado: false }
        });

        // Obtener el total de ventas filtrando por estado de factura
        const ventasTotales = await prisma.facturas.aggregate({
            _sum: {
                total: true,
            },
            where: {
                estadoFac: {
                    in: ['ACTIVA', 'PAGADA']
                }
            }
        });

        // Obtener el total de ventas mensuales filtrando por estado de factura
        const ventasMensuales = await prisma.facturas.aggregate({
            _sum: {
                total: true,
            },
            where: {
                fechaEmision: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
                estadoFac: {
                    in: ['ACTIVA', 'PAGADA']
                }
            }
        });

        // Construir la respuesta
        const topCardsData = {
            productosInventario,
            totalClientes,
            ventasTotales: ventasTotales._sum.total || 0,
            ventasMensuales: ventasMensuales._sum.total || 0,
        };

        return NextResponse.json({ topCardsData }, {
            headers: {
              'Cache-Control': 'no-store, max-age=0'
            }
          });
      
        } catch (error) {
          return NextResponse.json({ error: error.message }, { 
            status: 500,
            headers: {
              'Cache-Control': 'no-store, max-age=0'
            }
          });
      }
    }
