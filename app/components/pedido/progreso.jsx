'use client'
import React from 'react';
import useSWR, { mutate } from 'swr';
import Finalizado from './finalizado';
import Cancelar from './cancelar';

const Progreso = ({ AccordionItem, AccordionTrigger, AccordionContent }) => {
    // Hook para obtener los datos
    const { data, error } = useSWR(`/api/pedido`, async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al cargar los datos');
        }
        const data = await response.json();
        return data;
    });

    // Manejo de errores y estados de carga
    if (error) return <div>Error al cargar los datos</div>;
    if (!data) return <div>Cargando...</div>;

    // Validar estructura de datos
    if (!Array.isArray(data)) {
        return <div>No hay datos disponibles</div>;
    }

    // Filtrar pedidos en progreso
    const pedidosEnProgreso = data.filter(pedido => pedido.estado !== 'FINALIZADO');

    // Función para eliminar pedidos (actualización optimista)
    const eliminarPedido = (pedidoId) => {
        const nuevosDatos = data.filter(pedido => pedido.id !== pedidoId);
        mutate(`/api/pedido`, nuevosDatos, false);
    };

    return (
        <>
            <AccordionItem value="item-1">
                <AccordionTrigger>En progreso</AccordionTrigger>
                <AccordionContent>
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 pb-4">Id</th>
                                <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 pb-4">Proveedor</th>
                                <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 pb-4">Tipo</th>
                                <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 pb-4">Fecha</th>
                                <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 pb-4">Cambiar estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosEnProgreso.map((pedido) => (
                                <tr className="border-b dark:border-gray-600" key={pedido.id}>
                                    <td className="text-sm font-bold text-blue-700 hover:underline py-4">{pedido.id}</td>
                                    <td className="text-sm text-gray-900 dark:text-gray-200">
                                        {pedido.proveedores?.Nombre || 'Proveedor desconocido'}
                                    </td>
                                    <td className="text-sm text-gray-900 dark:text-gray-200">{pedido.medioPedido}</td>
                                    <td className="text-sm text-gray-900 dark:text-gray-200">{new Date(pedido.createdAt).toLocaleDateString()}</td>
                                    <td className="flex gap-2 my-2">
                                        <button>
                                            <Finalizado pedidoId={pedido.id} />
                                        </button>
                                        <button>
                                            <Cancelar pedidoId={pedido.id} onEliminar={eliminarPedido} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AccordionContent>
            </AccordionItem>
        </>
    );
};

export default Progreso;

