'use client'
import Image from "next/image"
import { FormatDate } from "@/app/api/utils/js-helpers";
import HtmlBreadCrumb from "@/app/components/HtmlHelpers/BreadCrumb";
import HtmlTableButton from "@/app/components/HtmlHelpers/TableButton";
import HtmlLabel from "@/app/components/HtmlHelpers/Label";
import { Calendar, Cog, Pencil, Plus } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Toaster, toast } from 'sonner';
import HtmlButton from "@/app/components/HtmlHelpers/Button";
import AgregarRol from "@/app/components/roles/agregarRol";
import EditarRol from "@/app/components/roles/editarRol";
import { ClipLoader } from "react-spinners";
import HtmlNewLabel from "@/app/components/HtmlHelpers/Label1";

const itemsBreadCrumb = ["Home", "Roles"];

export default function Roles() {
    const [listaRoles, onSet_ListaRoles] = useState([]);
    const [listaPermisos, onSet_ListaPermisos] = useState([]);
    const [onLoading, onSet_onLoading] = useState(false);
    const [paginaActual, onSet_PaginaActual] = useState(1);
    const [idRolSelected, onSet_IdRol] = useState(0);
    const [rolesPorPagina] = useState(5); // Cantidad de roles por página
    const fetchCalled = useRef(false);

    //Modales
    const [modalAgregarRol, onModal_AgregarRol] = useState(false);
    const [modalEditarRol, onModal_EditarRol] = useState(false);


    //Obtener lista de Roles
    const onGet_ListaRoles = useCallback(async () => {
        onSet_onLoading(true);
        try {
            const response = await fetch(`/api/roles`);
            const result = await response.json();
            if (result.status === "success") {
                onSet_ListaRoles(result.data.listaRoles);
                onSet_ListaPermisos(result.data.listaPermisos)
                toast.success(result.message);
            }
            else if (result.code === 204) {
                toast.warning(result.message);
                onSet_ListaRoles([]);
                onSet_ListaPermisos([]);
            }
            else {
                console.log(result.message);
                toast.error(result.message);
                onSet_ListaRoles([]);
                onSet_ListaPermisos([]);
            }
        }
        catch (error) {
            console.error('Error al obtener la lista de roles:', error);
            toast.error('Sucedió un error al obtener la lista de roles');
            onSet_ListaRoles([]);
            onSet_ListaPermisos([]);
        }
        finally {
            onSet_onLoading(false);
        }
    }, []);



    useEffect(() => {
        if (!fetchCalled.current) {
            fetchCalled.current = true;
            onGet_ListaRoles();
        }
    }, [onGet_ListaRoles]);

    //Paginación
    const indexOfLastRole = paginaActual * rolesPorPagina;
    const indexOfFirstRole = indexOfLastRole - rolesPorPagina;
    const currentRoles = listaRoles.slice(indexOfFirstRole, indexOfLastRole);
    const paginate = (pageNumber) => onSet_PaginaActual(pageNumber);

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
                        Administración de Roles
                    </h5>

                    {onLoading
                        ? (
                            <ClipLoader size={30} speedMultiplier={1.5} />
                        )
                        :
                        (
                            <div className="pt-4">
                                <HtmlButton color={"blue"} icon={Plus} legend="Nuevo Rol" onClick={() => { onModal_AgregarRol(true) }} />
                            </div>
                        )
                    }

                    {onLoading ? (
                        <div className="flex items-center justify-center mt-20">
                            <ClipLoader size={30} speedMultiplier={1.5} />
                        </div>
                    ) : (

                        <div className="pt-4">

                            <div className="shadow-xl border-2 bg-white dark:bg-gray-700 px-1 py-1 rounded-xl">
                                <div className="relative overflow-x-auto shadow-md rounded-lg">
                                <div className="" style={{ overflow: 'auto', maxHeight: '30rem' }}>
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-white uppercase bg-gray-900 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-6 py-3" style={{ width: '5%' }}>Id</th>
                                                <th scope="col" className="px-6 py-3" style={{ width: '8%' }}>Nombre</th>
                                                <th scope="col" className="px-6 py-3" style={{ width: '10%' }}>Descripción</th>
                                                <th scope="col" className="px-6 py-3" style={{ width: '10%' }}>Fecha de Creación</th>
                                                <th scope="col" className="px-6 py-3" style={{ width: '6%' }}>Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {currentRoles.map((item, index) => (
                                                item !== null && (
                                                    <tr key={index} className="bg-white dark:bg-gray-800">
                                                        <td className="px-6 py-4 text-gray-900" style={{ width: '5%' }}># {index+1}</td>
                                                        <td className="px-6 py-4 text-gray-900" style={{ width: '8%' }}><HtmlNewLabel color={"gray"} icon={Cog} legend={item.nombre} /></td>
                                                        <td className="px-6 py-4 text-gray-900" style={{ width: '10%' }}>{item.descripcion}</td>
                                                        <td className="px-6 py-4" style={{ width: '10%' }}>
                                                            <HtmlNewLabel color={"blue"} icon={Calendar} legend={FormatDate(item.fechaCreacion)} />
                                                        </td>
                                                        <td className="px-6 py-4" style={{ width: '6%' }}>
                                                            <HtmlTableButton color={"blue"} onClick={() => {
                                                                onModal_EditarRol(true);
                                                                onSet_IdRol(item.idRol);
                                                            }} icon={Pencil} tooltip={"Editar Rol"} />
                                                        </td>
                                                    </tr>
                                                )
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                </div>
                            </div>

                            {/* Paginación */}
                            <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
                                <ul className="inline-flex -space-x-px text-sm h-8">
                                    {/* Botón Anterior */}
                                    <li>
                                        <button
                                            onClick={() => paginate(paginaActual - 1)}
                                            disabled={paginaActual === 1}
                                            className={`flex items-center justify-center px-3 h-8 ${paginaActual === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                        >
                                            Anterior
                                        </button>
                                    </li>

                                    {/* Números de página */}
                                    {[...Array(Math.ceil(listaRoles.length / rolesPorPagina)).keys()].map(number => (
                                        <li key={number + 1}>
                                            <button
                                                onClick={() => paginate(number + 1)}
                                                className={`flex items-center justify-center px-3 h-8 ${paginaActual === number + 1 ? "bg-gray-300 dark:bg-gray-600" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                            >
                                                {number + 1}
                                            </button>
                                        </li>
                                    ))}

                                    {/* Botón Siguiente */}
                                    <li>
                                        <button
                                            onClick={() => paginate(paginaActual + 1)}
                                            disabled={paginaActual === Math.ceil(listaRoles.length / rolesPorPagina)}
                                            className={`flex items-center justify-center px-3 h-8 ${paginaActual === Math.ceil(listaRoles.length / rolesPorPagina) ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                        >
                                            Siguiente
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}



                </div>
            </div>
            <AgregarRol listaPermisos={listaPermisos} open={modalAgregarRol} onClose={() => onModal_AgregarRol(false)} onGet_ListaRoles={() => onGet_ListaRoles()} />
            <EditarRol listaPermisos={listaPermisos} open={modalEditarRol} onClose={() => onModal_EditarRol(false)} idRol={idRolSelected} onGet_ListaRoles={() => onGet_ListaRoles()} />
        </>
    );
}
