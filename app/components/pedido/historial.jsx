'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Eliminar from './eliminar';
import DetallePedido from '@/app/components/inventario/detallePedido';
import { Eye } from "lucide-react";

const Historial = () => {
    // Usamos SWR para obtener los datos de pedidos
    const { data, error } = useSWR('/api/pedido', async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al cargar los pedidos');
        }
        return await response.json();
    });

    const [selectedPedido, setSelectedPedido] = useState(null);

    // Manejo de errores y estados de carga
    if (error) return <div>Error al cargar los pedidos.</div>;
    if (!data) return <div>Cargando pedidos...</div>;

    // Validar estructura de datos
    if (!Array.isArray(data)) {
        return <div>No hay datos disponibles.</div>;
    }

    // Filtrar pedidos finalizados
    const pedidosFinalizados = data.filter(pedido => pedido.estado === 'FINALIZADO');

    const eliminarPedido = async (id) => {
        // 1. Actualiza la UI inmediatamente (Eliminación optimista)
        mutate('/api/pedido', data.filter(pedido => pedido.id !== id), false);

        try {
            // 2. Envía la solicitud de eliminación al servidor
            const response = await fetch(`/api/pedidos/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                // Si la eliminación falla, revertimos el cambio en la UI
                mutate('/api/pedido');
                console.error(result.error || 'Error al eliminar el pedido');
            }
        } catch (error) {
            // En caso de error de red, revertimos la UI
            mutate('/api/pedido');
            console.error('Hubo un problema al eliminar el pedido', error);
        }
    };

    // Renderizar un mensaje si no hay pedidos finalizados
    if (pedidosFinalizados.length === 0) {
        return <div>No hay pedidos finalizados.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border-b text-sm font-semibold">Id</th>
                        <th className="px-4 py-2 border-b text-sm font-semibold">Proveedor</th>
                        <th className="px-4 py-2 border-b text-sm font-semibold">Tipo</th>
                        <th className="px-4 py-2 border-b text-sm font-semibold">Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidosFinalizados.map(pedido => (
                        <tr key={pedido.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <td className="px-4 py-2 text-sm">{pedido.id}</td>
                            <td className="px-4 py-2 text-sm">{pedido.proveedores?.Nombre || 'Sin proveedor'}</td>
                            <td className="px-4 py-2 text-sm">{pedido.medioPedido}</td>
                            <td className="px-4 py-2 text-sm">{new Date(pedido.createdAt).toLocaleDateString()}</td>
                            <td className="flex gap-2 my-2">
                                    <button className="p-1.5 text-gray-900 dark:text-gray-200 bg-green-600 bg-opacity-50 rounded-md" onClick={() => setSelectedPedido(pedido)}>
                                        <Eye size={15} strokeWidth={2.2} />
                                    </button>
                                    <Eliminar pedidoId={pedido.id} onEliminar={eliminarPedido} />
                                </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <DetallePedido pedido={selectedPedido} onClose={() => setSelectedPedido(null)} />
        </div>
    );
};

export default Historial;
