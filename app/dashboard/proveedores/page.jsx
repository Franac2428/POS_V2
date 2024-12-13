'use client';

import { FormatDate } from "@/app/api/utils/js-helpers";
import HtmlButton from "@/app/components/HtmlHelpers/Button";
import HtmlNewLabel from "@/app/components/HtmlHelpers/Label1";
import PageContent from "@/app/components/HtmlHelpers/PageContent";
import TablePagination from "@/app/components/HtmlHelpers/Pagination";
import HtmlTableButton from "@/app/components/HtmlHelpers/TableButton";
import AgregarProveedor from "@/app/components/proveedor/agregarProveedor";
import EditarProveedor from "@/app/components/proveedor/editarProveedor";
import EliminarProveedor from "@/app/components/proveedor/eliminarProveedor";
import { AtSign, Calendar, Contact, Earth, FileSpreadsheet, Notebook, Pencil, Phone, Tag, Text, Trash, User, UserPlus } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from 'sonner';
import * as XLSX from 'xlsx';


const itemsBreadCrumb = ["Dashboard", "Proveedores"];
export default function Proveedores() {
    const [onLoading, onSet_onLoading] = useState(true);
    const [listaProveedores, onSet_ListaProveedores] = useState([]);
    const fetchCalled = useRef(false);
    const [modalAgregar, onModal_Agregar] = useState(false);
    const [modalEditar, onModal_Editar] = useState(false);
    const [modalEliminar, onModal_Eliminar] = useState(false);
    const [idProveedor, onSet_IdProveedor] = useState(0);
    const [item, onSet_ItemProveedor] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina] = useState(5);
    const classDivsButtons = "sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4";

    const indexOfLastProveedor = paginaActual * registrosPorPagina;
    const indexOfFirstProveedor = indexOfLastProveedor - registrosPorPagina;
    const currentProveedores = listaProveedores.filter(proveedor => !proveedor.Eliminado).slice(indexOfFirstProveedor, indexOfLastProveedor);


    //Obtener las proveedores
    const onGet_ListaProveedores = useCallback(async () => {
        onSet_onLoading(true);
        try {
            const response = await fetch(`/api/proveedor`);
            const result = await response.json();
            if (result.status === "success") {
                onSet_ListaProveedores(result.data)
                toast.success('Se han obtenido los registros');
            }
            else if (result.code === 204) {
                toast.warning('No se encontraron registros');
                onSet_ListaProveedores([])
            }
            else {
                console.log(result.message);
                toast.error('Error al obtener los registros');
                onSet_ListaProveedores([])
            }
        }
        catch (error) {
            console.error('Error al obtener la lista de proveedores:', error);
            toast.error('Sucedió un error al obtener la lista de proveedores');
        }
        finally {
            onSet_onLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!fetchCalled.current) {
            fetchCalled.current = true;
            onGet_ListaProveedores()
        }
    }, [onGet_ListaProveedores]);

    const handleExport = () => {
        if (listaProveedores.length == 0) {
            toast.warning("No hay datos para exportar");
        }

        if (typeof document !== 'undefined') {
            generateExcelReport(listaProveedores);
        }
    };

    const generateExcelReport = (data) => {
        // Formatear los datos
        const formattedData = data.map(p => {
            return {
                "No. Proveedor": p.ProveedorID,
                "Nombre": p.Nombre,
                "Nombre del Contacto": p.Contacto,
                "Medios de Contacto": p.Telefono + " / " + p.Email,
                "Sitio Web": p.SitioWeb ? p.SitioWeb : "--Sin sitio web--",
                "Estado": p.Eliminado ? 'Eliminado' : 'Activo',
                "Fecha de Creación": FormatDate(p.FechaCreacion),
            };
        });

        // Crear hoja de Excel
        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Estilo para el encabezado
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };

        // Aplicar estilo a los encabezados
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = headerStyle;
        }

        // Estilo para las celdas del contenido
        const cellStyle = {
            alignment: { horizontal: "left", vertical: "center" },
            font: { color: { rgb: "333333" } }
        };

        for (let R = range.s.r + 1; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellAddress]) continue;
                worksheet[cellAddress].s = cellStyle;
            }
        }

        // Configurar anchos de columna
        const columnWidths = [
            { wch: 15 }, // No. Proveedor
            { wch: 30 }, // Nombre
            { wch: 30 }, // Nombre del Contacto
            { wch: 35 }, // Medios de Contacto
            { wch: 30 }, // Sitio Web
            { wch: 15 }, // Estado
            { wch: 20 }  // Fecha de Creación
        ];
        worksheet['!cols'] = columnWidths;

        // Crear libro de Excel y hoja
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Listado Proveedores");

        // Generar archivo Excel
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = "ListadoProveedores.xlsx";
        downloadLink.click();
    };


    const pageContent = (
        <>
            {onLoading ? (
                <ClipLoader size={30} speedMultiplier={1.5} />
            ) : (
                <>
                    <div className={`grid ${classDivsButtons} gap-4 mx-auto`}>
                        <HtmlButton colSize={1} color={"blue"} icon={UserPlus} onClick={() => onModal_Agregar(true)} legend="Nuevo Proveedor" />
                        <HtmlButton colSize={1} color={"green"} icon={FileSpreadsheet} onClick={() => handleExport()} legend="Exportar Datos" />
                    </div>
                    <br />
                    <div className="shadow-xl border-2 bg-white dark:bg-gray-700 px-1 py-1 rounded-xl">
                        <div className="relative overflow-x-auto shadow-md rounded-lg">
                            <div className="" style={{ overflow: 'auto', maxHeight: '30rem' }}>
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead>
                                        <tr className="text-sm text-white uppercase bg-gray-900 dark:bg-gray-700 dark:text-gray-400">
                                            <th className="px-6 py-3 text-center">No.</th>
                                            <th className="px-6 py-3 text-center">Nombre / Contacto</th>
                                            <th className="px-6 py-3 text-center">Medios Contacto</th>
                                            <th className="px-6 py-3 text-center">Creado</th>
                                            <th className="px-6 py-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentProveedores.map((proveedor, index) => (
                                            proveedor !== null && (
                                                <tr key={index} className="bg-white dark:bg-gray-800">
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        #{proveedor.ProveedorID}
                                                    </td>
                                                    <td className="px-6 py-4 text-left text-gray-900 dark:text-gray-300">
                                                        <div className="mb-2"><HtmlNewLabel color={"green"} icon={User} legend={proveedor.Nombre} /></div>
                                                        <div className="mb-2"><HtmlNewLabel color={"cyan"} icon={Contact} legend={proveedor.Contacto} /></div>
                                                    </td>
                                                    <td className="px-6 py-4 text-left text-gray-900 dark:text-gray-300">
                                                        <div className="mb-2">
                                                            <HtmlNewLabel color="blue" icon={AtSign} legend={proveedor.Email} />
                                                        </div>
                                                        <div className="mb-2">
                                                            <HtmlNewLabel color="indigo" icon={Phone} legend={proveedor.Telefono} />
                                                        </div>

                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        <HtmlNewLabel color={"amber"} icon={Calendar} legend={FormatDate(proveedor.FechaCreacion)} />
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        <div className="flex gap-1 justify-center items-center">
                                                            <HtmlTableButton
                                                                color={"blue"}
                                                                tooltip={"Editar Proveedor"}
                                                                icon={Pencil}
                                                                onClick={() => { onSet_IdProveedor(proveedor.ProveedorID), onModal_Editar(true) }}


                                                            />
                                                            <HtmlTableButton
                                                                color={"red"}
                                                                tooltip={"Eliminar Proveedor"}
                                                                icon={Trash}
                                                                onClick={() => { onSet_ItemProveedor(proveedor), onModal_Eliminar(true) }}


                                                            />
                                                        </div>
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
                        <TablePagination
                            listado={listaProveedores}
                            paginaActual={paginaActual}
                            onSet_PaginaActual={setPaginaActual}
                        />

                    {/* Componentes (Agregar, Editar, Eliminar) */}
                    <AgregarProveedor open={modalAgregar} onClose={() => onModal_Agregar(false)} onReload={onGet_ListaProveedores} />
                    <EditarProveedor open={modalEditar} onClose={() => onModal_Editar(false)} idProveedor={idProveedor} onReload={onGet_ListaProveedores} />
                    <EliminarProveedor open={modalEliminar} onClose={() => onModal_Eliminar(false)} onReload={onGet_ListaProveedores} item={item} />

                </>
            )}
        </>
    );



    return (
        <>
            <PageContent itemsBreadCrumb={itemsBreadCrumb} content={pageContent} tituloCard="Administración de Proveedores" />
        </>
    );
}

