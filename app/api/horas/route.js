import db from '@/app/lib/db'; // Asegúrate de que la conexión esté configurada.

export async function GET(req) {
    try {
        // Consultar asistencias con relación a empleados
        const asistencias = await db.asistencia.findMany({
            include: {
                Empleado: {
                    select: {
                        nombre: true,
                        apellidos: true,
                    },
                },
            },
            orderBy: {
                fechaCreacion: 'desc',
            },
        });

        // Formatear datos para la respuesta
        const data = asistencias.map((asistencia) => ({
            id: asistencia.idAsistencia,
            nombre: asistencia.Empleado?.nombre || 'Desconocido',
            apellido: asistencia.Empleado?.apellidos || 'Desconocido',
            fecha: asistencia.fechaHoraEntrada
                ? asistencia.fechaHoraEntrada.toISOString().split('T')[0]
                : 'Fecha no disponible',
            horaEntrada: asistencia.fechaHoraEntrada
                ? asistencia.fechaHoraEntrada.toISOString().split('T')[1].slice(0, 8)
                : 'No registrada',
            horaSalida: asistencia.fechaHoraSalida
                ? asistencia.fechaHoraSalida.toISOString().split('T')[1].slice(0, 8)
                : 'No registrada',
            observacion: asistencia.observacion || 'Sin observaciones',
        }));

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error('Error al obtener las asistencias:', error);
        return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
            status: 500,
        });
    }
}
