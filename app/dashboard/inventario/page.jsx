'use client';

import { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import HtmlTableButton from "@/app/components/HtmlHelpers/TableButton";
import HtmlNewLabel from "@/app/components/HtmlHelpers/Label1";
import Agregar from "@/app/components/inventario/crearProducto";
import Eliminar from "../../components/inventario/eliminarProducto";
import Editar from "../../components/inventario/editar";
import Ver from "../../components/inventario/ver";
import FiltroMenu from "../../components/buscador/filtros";
import Buscador from "../../components/buscador/buscar";
import Estados from "../../components/inventario/estados";
import { CirclePlus, FileUp, Pencil, Trash, Eye, ClipboardList, Package, Calendar, Filter, Contact, CheckCircle, User, Tag, IdCard, Search, Download, Plus } from "lucide-react";
import useSWR from 'swr';
import HtmlBreadCrumb from '@/app/components/HtmlHelpers/BreadCrumb';
import HtmlButton from '@/app/components/HtmlHelpers/Button';

const fetcher = (url) => fetch(url).then((res) => res.json());
const itemsBreadCrumb = ["Home", "Caja"];

function getExpirationColor(fechaCaducidad) {
  if (!fechaCaducidad) return "gray"; // Si no hay fecha de caducidad, usa gris.

  const hoy = new Date();
  const fecha = new Date(fechaCaducidad);
  const diferenciaDias = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));

  if (diferenciaDias > 10) {
    return "green"; // Más de 10 días
  } else if (diferenciaDias >= 0 && diferenciaDias <= 10) {
    return "yellow"; // Menos de 10 días
  } else {
    return "red"; // Fecha pasada
  }
}

export default function Inventario() {
  const [open, setOpen] = useState(false);
  const [agregar, setAgregar] = useState(false);
  const [ver, setVer] = useState(false);
  const [editar, setEditar] = useState(false);
  const [selectedProductoId, setSelectedProductoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    filterCategoria: '',
    filterEstado: '',
    filterProveedor: ''
  });

  const filterButtonRef = useRef(null);
  const menuRef = useRef(null);

  const { data, error, mutate } = useSWR(`/api/inventario`, fetcher);

  useEffect(() => {
    if (error) {
      console.error('Error fetching data:', error);
    }
  }, [error]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFiltros(newFilters);
  };

  const handleExport = () => {
    if (typeof document !== 'undefined') {
      generateExcelReport(filteredData);
    }
  };

  const generateExcelReport = (data) => {
    const formattedData = data.map(producto => ({
      "ID Producto": producto.ProductoID,
      "Nombre": producto.Nombre,
      "Proveedor": producto.ProveedorID,
      "Categoría": producto.CategoriaID,
      "Cantidad": producto.Stock,
      "Fecha Ingreso": producto.FechaIngreso ? new Date(producto.FechaIngreso).toLocaleDateString() : "N/A",
      "Fecha Caducidad": producto.FechaCaducidad ? new Date(producto.FechaCaducidad).toLocaleDateString() : "N/A",
      "Estado": producto.Estado
    }));

    // Crear hoja de Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Estilo de los encabezados
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

    // Estilo para las celdas del contenido
    const cellStyle = {
      alignment: { horizontal: "left", vertical: "center" },
      font: { color: { rgb: "333333" } }
    };

    // Aplicar estilos a los encabezados
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    // Aplicar estilos a las celdas de contenido
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = cellStyle;
      }
    }

    // Ajustar anchos de columna
    const columnWidths = [
      { wch: 15 }, // ID Producto
      { wch: 30 }, // Nombre
      { wch: 20 }, // Proveedor
      { wch: 20 }, // Categoría
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Fecha Ingreso
      { wch: 15 }, // Fecha Caducidad
      { wch: 12 }  // Estado
    ];
    worksheet['!cols'] = columnWidths;

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = "inventario.xlsx";
    downloadLink.click();
  };

  const filteredData = Array.isArray(data)
    ? data.filter(producto => (
      producto.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.ProductoID.toString().includes(searchTerm)) &&
      (filtros.filterCategoria ? producto.CategoriaID === filtros.filterCategoria : true) &&
      (filtros.filterEstado ? producto.Estado === filtros.filterEstado : true) &&
      (filtros.filterProveedor ? producto.ProveedorID === filtros.filterProveedor : true)
    )
    : [];


  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target) && filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
          setIsMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  useEffect(() => {
    console.log("Datos recibidos desde la API:", data);
  }, [data]);


  if (error) return <div>Error al cargar los datos</div>;
  if (!data) return <div>Cargando...</div>;

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
            Inventario
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-0 items-center">
            {/* Buscador */}
            <div className="col-span-1 md:col-span-1">
              <Buscador onSearch={handleSearch} />
            </div>

            <div className="col-span-2  ml-8">
              <button
                ref={filterButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className=" p-2 rounded-md bg-gray-200 dark:bg-gray-700">
                <Filter className="text-gray-900 dark:text-gray-100" />
              </button>
            </div>

            {/* Botones adicionales */}
            <div className="col-span-1 md:col-span-1 flex space-x-2">
              <HtmlButton
                color="blue"
                icon={Plus}
                legend="Agregar"
                onClick={() => setAgregar(true)}
              />
              <HtmlButton
                color="green"
                icon={Download}
                legend="Exportar"
                onClick={handleExport}
              />
            </div>
          </div>

          <hr className='mt-4' />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[80vh] overflow-y-auto">
            {filteredData.map((producto) => (
              <div
                key={producto.ProductoID}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition duration-300 hover:shadow-2xl"
              >
                <h2 className="bg-gradient-to-r from-gray-100 to-gray-300 text-center text-lg font-semibold text-gray-800 shadow-md px-5 py-2 rounded-md mb-4 hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out">
                  {producto.Nombre}
                </h2>

                <div className="flex flex-col space-y-2">
                  <HtmlNewLabel
                    color="blue"
                    icon={User}
                    legend={`Proveedor: ${producto.NombreProveedor || "N/A"}`}
                  />
                  <HtmlNewLabel
                    color="blue"
                    icon={Tag}
                    legend={`Categoría: ${producto.NombreCategoria || "N/A"}`}
                  />

                  <HtmlNewLabel
                    color="green"
                    icon={Calendar}
                    legend={`Fecha ingreso: ${new Date(producto.FechaIngreso).toLocaleDateString()}`}
                  />
                  <HtmlNewLabel
                    color={getExpirationColor(producto.FechaCaducidad)}
                    icon={Calendar}
                    legend={`Fecha de caducidad: ${producto.FechaCaducidad ? new Date(producto.FechaCaducidad).toLocaleDateString() : 'N/A'}`}
                  />
                  <HtmlNewLabel
                    color="purple"
                    icon={Package}
                    legend={`Cantidad: ${producto.Stock}`}
                  />
                </div>
                <div className="flex gap-3 justify-center mt-4">
                  <HtmlTableButton
                    color="blue"
                    tooltip="Editar Producto"
                    icon={Pencil}
                    onClick={() => { setSelectedProductoId(producto.ProductoID); setEditar(true); }}
                  />
                  <HtmlTableButton
                    color="red"
                    tooltip="Eliminar Producto"
                    icon={Trash}
                    onClick={() => { setSelectedProductoId(producto.ProductoID); setOpen(true); }}
                  />
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>
      <Eliminar open={open} onClose={() => setOpen(false)} productoId={selectedProductoId} mutate={mutate} />
      <Agregar open={agregar} onClose={() => setAgregar(false)} mutate={mutate} />
      <Editar open={editar} onClose={() => setEditar(false)} productoId={selectedProductoId} mutate={mutate} />
      <Ver open={ver} onClose={() => setVer(false)} productoId={selectedProductoId} />
      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: filterButtonRef.current ? filterButtonRef.current.getBoundingClientRect().bottom + window.scrollY - 70 : 0,
            left: filterButtonRef.current ? filterButtonRef.current.getBoundingClientRect().left + window.scrollX + 360 : 20
          }}
        >
          <FiltroMenu onFilterChange={handleFilterChange} />
        </div>
      )}


    </>
  );
}
