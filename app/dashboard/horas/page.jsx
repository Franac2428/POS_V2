'use client';
import React from 'react';
import useSWR from 'swr';

const fetcher = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error al cargar los datos');
    }
    return response.json();
};

const Monitorizacion = () => {
    const { data, error, isLoading } = useSWR(`/api/horas`, fetcher);

    if (error) return <div>Error al cargar los datos</div>;
    if (isLoading) return <div>Cargando...</div>;
    if (!Array.isArray(data) || data.length === 0) return <div>No hay asistencias registradas</div>;

    return (
        <div className="max-w-7xl mx-auto py-4">
            <h1 className="text-3xl text-gray-900 dark:text-gray-100 font-semibold mb-2">
                Monitorización de Horarios
            </h1>
            <div className="shadow-lg bg-white dark:bg-gray-700 px-5 py-4 rounded-lg">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left text-sm font-semibold">Nombre</th>
                            <th className="border-b p-2 text-left text-sm font-semibold">Apellido</th>
                            <th className="border-b p-2 text-left text-sm font-semibold">Fecha</th>
                            <th className="border-b p-2 text-left text-sm font-semibold">Hora de Entrada</th>
                            <th className="border-b p-2 text-left text-sm font-semibold">Hora de Salida</th>
                            <th className="border-b p-2 text-left text-sm font-semibold">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((asistencia) => (
                            <tr key={asistencia.id}>
                                <td className="border-b p-2 text-sm">{asistencia.nombre}</td>
                                <td className="border-b p-2 text-sm">{asistencia.apellido}</td>
                                <td className="border-b p-2 text-sm">{asistencia.fecha}</td>
                                <td className="border-b p-2 text-sm">{asistencia.horaEntrada}</td>
                                <td className="border-b p-2 text-sm">{asistencia.horaSalida}</td>
                                <td className="border-b p-2 text-sm">{asistencia.observacion}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Monitorizacion;
