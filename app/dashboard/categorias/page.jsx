"use client";
import { CirclePlus, FileUp, Pencil, SlidersHorizontal, Trash, Eye, Tag, User, UserPlus, BookPlus, File, Notebook, Calendar, Sheet, FileSpreadsheet } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import HtmlNewLabel from "@/app/components/HtmlHelpers/Label1";
import HtmlButton from "@/app/components/HtmlHelpers/Button";
import HtmlTableButton from "@/app/components/HtmlHelpers/TableButton";
import * as XLSX from 'xlsx';
import { ClipLoader } from "react-spinners";
import PageContent from "@/app/components/HtmlHelpers/PageContent";
import TablePagination from "@/app/components/HtmlHelpers/Pagination";
import { toast } from 'sonner';
import AgregarCategoria from "@/app/components/categorias/agregarCategoria";
import { FormatDate } from "@/app/api/utils/js-helpers";
import EditarCategoria from "@/app/components/categorias/editarCategoria";
import EliminarCategoria from "@/app/components/categorias/eliminarCategoria";

const itemsBreadCrumb = ["Dashboard", "Categorías"];

export default function Categorias() {
    const [onLoading, onSet_onLoading] = useState(true);
    const [listaCategorias, onSet_ListaCategorias] = useState([]);
    const fetchCalled = useRef(false);
    const [modalAgregar,onModal_Agregar] = useState(false);
    const [modalEditar, onModal_Editar] = useState(false);
    const [modalEliminar, onModal_Eliminar] = useState(false);
    const [categoriaEditar,onSetCategoriaEditar] = useState(null);

    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina] = useState(5); // Cantidad de registros por página

    const classDivsButtons = "sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4";
    const indexOfLastCategoria = paginaActual * registrosPorPagina;
    const indexOfFirstCategoria = indexOfLastCategoria - registrosPorPagina;
    const currentCategorias = listaCategorias.filter(categoria => !categoria.Eliminado).slice(indexOfFirstCategoria, indexOfLastCategoria);


    //Obtener las categorías
    const onGet_ListaCategorias = useCallback(async () => {
        onSet_onLoading(true);
        try {
            const response = await fetch(`/api/categorias`);
            const result = await response.json();
            if (result.status === "success") {
                onSet_ListaCategorias(result.data)
                toast.success('Se han obtenido los registros');
            }
            else if (result.code === 204) {
                toast.warning('No se encontraron registros');
                onSet_ListaCategorias([])
            }
            else {
                console.log(result.message);
                toast.error('Error al obtener los registros');
                onSet_ListaCategorias([])
            }
        }
        catch (error) {
            console.error('Error al obtener la lista de categorías:', error);
            toast.error('Sucedió un error al obtener la lista de categorías');
        }
        finally {
            onSet_onLoading(false);
        }
    }, []);


    //Exportar Categorías
    const handleExport = () => {
        if(listaCategorias.length == 0){
            toast.warning("No hay datos para exportar");
        }

        if (typeof document !== 'undefined') {
            generateExcelReport(listaCategorias);
        }
    };

    const generateExcelReport = (data) => {
        // Formatear los datos
        const formattedData = data.map(c => {
            return {
                "No. Categoría": c.CategoriaProductoID,
                "Nombre": c.NombreCategoria,
                "Descripción":c.Descripcion,
                "Estado": c.Eliminado ? 'Eliminada' : 'Activa',
                "Fecha de Creación": FormatDate(c.FechaCreacion),
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
            { wch: 10 }, // No. Cliente
            { wch: 10 }, // Nombre Completo
            { wch: 20 }, // Descripción
            { wch: 15 }, // Estado
            { wch: 15 }  // Fecha de Creación
        ];
        worksheet['!cols'] = columnWidths;

        // Crear libro de Excel y hoja
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Listado Categorías");

        // Generar archivo Excel
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = "ListadoCategorías.xlsx";
        downloadLink.click();
    };

    useEffect(() => {
        if (!fetchCalled.current) {
            fetchCalled.current = true;
            onGet_ListaCategorias()
        }
    }, [onGet_ListaCategorias]);


    const pageContent = (
        <>
            {onLoading ? (
                <ClipLoader size={30} speedMultiplier={1.5} />
            ) : (
                <>
                    <div className={`grid ${classDivsButtons} gap-4 mx-auto`}>
                        <HtmlButton colSize={1} color={"blue"} icon={BookPlus} onClick={() => onModal_Agregar(true)} legend="Nueva Categoría" />
                        <HtmlButton colSize={1} color={"green"} icon={FileSpreadsheet} onClick={() => handleExport()} legend="Exportar Datos" />
                    </div>
                    <br />
                    <div className="shadow-xl border-2 bg-white dark:bg-gray-700 px-1 py-1 rounded-xl">
                        <div className="relative overflow-x-auto shadow-md rounded-lg">
                            <div className="" style={{ overflow: 'auto', maxHeight: '30rem' }}>
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead>
                                        <tr className="text-xs text-white uppercase bg-gray-900 dark:bg-gray-700 dark:text-gray-400">
                                            <th className="px-6 py-3 text-center">No.</th>
                                            <th className="px-6 py-3 text-center">Nombre</th>
                                            <th className="px-6 py-3 text-center">Descripción</th>
                                                <th className="px-6 py-3 text-center">Creado</th>
                                            <th className="px-6 py-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentCategorias.map((categoria, index) => (
                                            categoria !== null && (
                                                <tr key={index} className="bg-white dark:bg-gray-800">
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        #{categoria.CategoriaProductoID}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        <HtmlNewLabel color={"green"} icon={Tag} legend={categoria.NombreCategoria} />
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        <HtmlNewLabel color={"blue"} icon={Notebook} legend={categoria.Descripcion} />
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        <HtmlNewLabel color={"indigo"} icon={Calendar} legend={FormatDate(categoria.FechaCreacion)} />
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-300">
                                                        <div className="flex gap-1 justify-center items-center">
                                                            <HtmlTableButton
                                                                color={"blue"}
                                                                tooltip={"Editar Categoría"}
                                                                icon={Pencil}
                                                                onClick={() => {onSetCategoriaEditar(categoria),onModal_Editar(true)}}
                                                            />
                                                            <HtmlTableButton
                                                                color={"red"}
                                                                tooltip={"Eliminar Categoría"}
                                                                icon={Trash}
                                                                onClick={() => { onSetCategoriaEditar(categoria), onModal_Eliminar(true) }}

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

                        {/* Paginación */}
                        
                    </div>
                        <TablePagination
                            listado={listaCategorias}
                            paginaActual={paginaActual}
                            onSet_PaginaActual={setPaginaActual}
                        />

                    {/* Componentes (Agregar, Editar, Eliminar) */}
                    <AgregarCategoria open={modalAgregar} onClose={() => onModal_Agregar(false)} onReload={onGet_ListaCategorias} />
                    <EditarCategoria open={modalEditar} item={categoriaEditar} onClose={() => onModal_Editar(false)} onReload={onGet_ListaCategorias} />
                    <EliminarCategoria open={modalEliminar} item={categoriaEditar} onClose={() => onModal_Eliminar(false)} onReload={onGet_ListaCategorias} />

                
                </>
            )}
        </>
    );

    return (
        <>
            <PageContent itemsBreadCrumb={itemsBreadCrumb} content={pageContent} tituloCard="Administración de Categorías" />
        </>
    );
}
