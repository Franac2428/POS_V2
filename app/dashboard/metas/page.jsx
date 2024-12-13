'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'; // Importa useCallback
import { getSession, useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, Clock, X } from "lucide-react";
import { Toaster, toast } from 'sonner';
import HtmlNewLabel from '@/app/components/HtmlHelpers/Label1';
import HtmlBreadCrumb from '@/app/components/HtmlHelpers/BreadCrumb';
import { ClipLoader } from 'react-spinners';
import Tooltip from '@mui/material/Tooltip';



const itemsBreadCrumb = ["Dashboard", "Evaluaciones"];

const EvaluacionesDesempeno = () => {
    const { data: session } = useSession();
    const idUsuarioEmpleado = Number(session?.user.id);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [onLoading, setLoading] = useState(true);
    const fetchCalled = useRef(false);


    const onGet_Evaluaciones = useCallback(async () => {
        const session = await getSession();
        const idUsuario = session.user.id;

        if (!idUsuario) {
            toast.error("Error al obtener el usuario. Contacte al administrador");
            return;
        }

        try {
            const response = await fetch(`/api/usuarios/metas/${idUsuario}`);
            const result = await response.json();
            if (result.status == "success") {
                setEvaluaciones(result.data)
                toast.success('Se han obtenido las evaluaciones');
            }
            else if (result.code === 204) {
                toast.warning('No se encontraron evaluaciones registradas');
                setEvaluaciones([])
            }
            else {
                console.log(result.message);
                toast.error('Error al obtener las evaluaciones');
                setEvaluaciones([])
            }
        }
        catch (error) {
            console.error('Error al obtener las evaluaciones:', error);
            toast.error('Error al obtener las evaluaciones');
            setEvaluaciones([])
        }
        finally {
            setLoading(false);
        }
    }, [idUsuarioEmpleado]);

    useEffect(() => {
        if (!fetchCalled.current) {
            fetchCalled.current = true;
            onGet_Evaluaciones();
        }
    }, [onGet_Evaluaciones]);

    const handleMarcar = async (metaId) => {
        setLoading(true);

        try {
            const response = await fetch(`/api/usuarios/metas/${metaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            if (data.status == "success") {
                onGet_Evaluaciones();
                toast.success("Evaluación ha sido marcada correctamente");
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            console.error('Error al marcar la evaluación:', error);
            toast.error("Error al marcar la evaluación: " + error);
        }
        finally {
            setLoading(false);
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    return (
        <>
            <div className="w-full p-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="pl-2 inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                        <HtmlBreadCrumb items={itemsBreadCrumb} />
                    </ol>
                </nav>
            </div>

            <div className="w-full pl-4 pr-4">
                <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Evaluaciones de usuario
                    </h5>

                    {onLoading ? (
                        <div className="flex items-center justify-center mt-20">
                            <ClipLoader size={30} speedMultiplier={1.5} />
                        </div>
                    ) : (

                        <div className="container mx-auto text-gray-900 dark:text-gray-100">
                            {evaluaciones.length == 0 ? (
                                <div class="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
                                    <span class="font-medium">Warning alert!</span> Change a few things up and try submitting again.
                                </div>
                            ) : (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {evaluaciones && evaluaciones.map((item) => (
                                        <div
                                            key={item.idMeta}
                                            className="relative shadow-xs border border-gray-300 bg-white dark:bg-gray-800 p-6 rounded-lg transition hover:shadow-2xl"
                                        >
                                            <Tooltip title={"Marcar como leída"} placement='top' arrow>
                                                <button
                                                    onClick={() => handleMarcar(item.idMeta)}
                                                    className="absolute top-2 right-2 p-1 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                                                    aria-label="Marcar como leída"
                                                >
                                                    <Check size={25} strokeWidth={2} />
                                                </button>
                                            </Tooltip>

                                            <div className="pb-4">
                                                <p className="text-xl font-semibold text-green-600 dark:text-green-300">
                                                    Asunto: {item.asunto}
                                                </p>
                                                <p className="text-md text-gray-700 dark:text-gray-300 mt-2">
                                                    Asignado a: <strong>{item.Empleado.nombre} {item.Empleado.apellidos}</strong>
                                                </p>
                                                <p className="text-md text-gray-700 dark:text-gray-300">
                                                    Fecha: {new Date(item.fechaCreacion).toLocaleDateString()}
                                                </p>

                                                <p className="text-end my-3">
                                                    <HtmlNewLabel color={"blue"} legend={capitalizeFirstLetter(
                                                        formatDistanceToNow(new Date(item.fechaCreacion), {
                                                            addSuffix: true,
                                                            locale: es,
                                                        })
                                                    )}
                                                        icon={Clock} />
                                                </p>

                                                <hr className="my-4 border-gray-300 dark:border-gray-600" />

                                                <p className="text-md text-gray-700 dark:text-gray-300 mt-4">
                                                    {item.observaciones}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            )}
                        </div>

                    )}



                </div>
            </div>
        </>
    );
};

export default EvaluacionesDesempeno;
