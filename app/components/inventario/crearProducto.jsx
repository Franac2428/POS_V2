import { useState, useEffect } from 'react';
import { Plus, X } from "lucide-react";
import { Toaster, toast } from 'sonner';
import ModalTemplate from '../HtmlHelpers/ModalTemplate';
import HtmlFormInput from '../HtmlHelpers/FormInput';
import HtmlFormSelect from '../HtmlHelpers/FormSelect';

export default function Agregar({ open, onClose, mutate }) {
  const [formData, setFormData] = useState({
    Nombre: '',
    Descripcion: '',
    PrecioCompra: '',
    PrecioVenta: '',
    Stock: '',
    CategoriaID: '',
    ProveedorID: '',
    FechaIngreso: '',
    FechaCaducidad: '',
    Estado: 'Vigente'
  });
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const classResponsiveDivs = "xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"


  useEffect(() => {
    fetch(`/api/categorias`)
      .then(response => response.json())
      .then(data => setCategorias(data))
      .catch(error => console.error('Error fetching categorias:', error));

    fetch(`/api/proveedor`)
      .then(response => response.json())
      .then(data => setProveedores(data))
      .catch(error => console.error('Error fetching proveedores:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/inventario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          PrecioCompra: parseFloat(formData.PrecioCompra),
          PrecioVenta: parseFloat(formData.PrecioVenta),
          Stock: parseInt(formData.Stock),
          CategoriaID: parseInt(formData.CategoriaID),
          ProveedorID: parseInt(formData.ProveedorID),
        }),
      });

      if (response.ok) {
        toast.success('Producto agregado con éxito');
        mutate();  // Refresca los datos
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error('Error al agregar el producto');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor');
    }
  };

  const arrayProveedores = proveedores.map(p => ({
    value: p.ProveedorID,
    label: p.Nombre
  }));

  const arrayCategoria = categorias.map(c => ({
    value: c.CategoriaProductoID,
    label: c.NombreCategoria
  }));

  const modalChildren = (
    <>
      <div style={{ maxHeight: "55vh", overflowY: "auto", overflowX: "hidden" }}>
      <form method="POST" className="w-full" >
        <div className={`grid grid-cols-1 gap-4 mx-auto`}>
          <HtmlFormInput legend={"Nombre"} value={formData.Nombre} type={"text"} onChange={handleChange} name={"Nombre"} />
        </div>
        <div className={`grid grid-cols-1 gap-4 mx-auto`}>
          <HtmlFormInput legend={"Descripción"} value={formData.Descripcion} type={"text"} onChange={handleChange} name={"Descripcion"} />
        </div>

        <div className={`grid grid-cols-1 gap-4 mx-auto`}>
          <HtmlFormSelect options={arrayProveedores} legend={"Proveedor"} value={formData.ProveedorID} onChange={handleChange} name={"Proveedor"} />
        </div>

        <div className={`grid ${classResponsiveDivs} gap-4 mx-auto`}>
          <HtmlFormInput legend={"Precio Compra"} value={formData.PrecioCompra} type={"text"} onChange={handleChange} name={"PrecioCompra"} />
          <HtmlFormInput legend={"Precio Venta"} value={formData.PrecioVenta} type={"text"} onChange={handleChange} name={"PrecioVenta"} />

        </div>

        <div className={`grid ${classResponsiveDivs} gap-4 mx-auto`}>
          <HtmlFormInput legend={"Cant. Ingresada"} value={formData.Stock} type={"text"} onChange={handleChange} name={"PrecioCompra"} />
          <HtmlFormSelect options={arrayCategoria} legend={"Categoría"} value={formData.CategoriaID} onChange={handleChange} name={"Proveedor"} />

        </div>

        <div className={`grid ${classResponsiveDivs} gap-4 mx-auto`}>
          <HtmlFormInput legend={"Fecha Ingreso"} value={formData.FechaIngreso} type={"date"} onChange={handleChange} name={"FechaIngreso"} />
          <HtmlFormInput legend={"Fecha Caducidad"} value={formData.FechaCaducidad} type={"date"} onChange={handleChange} name={"FechaCaducidad"} />

        </div>
        
        
      </form>
      </div>

     
    
    </>
  )

  return (
    <ModalTemplate open={open} onClose={onClose} icon={Plus} title={"Agregar Producto"} children={modalChildren} />

  );
}
