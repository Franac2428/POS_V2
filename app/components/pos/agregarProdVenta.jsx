import { Plus, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster, toast } from 'sonner';
import HtmlFormInput from "../HtmlHelpers/FormInput";
import HtmlFormSelect from "../HtmlHelpers/FormSelect";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import HtmlButton from "../HtmlHelpers/Button";
import { RemoveClassesAndAdd, RemoveClassesAndAddByName, RemoveValidationClasses, ValidateFormByClass } from "@/app/api/utils/js-helpers";
import HtmlCheckButton from "../HtmlHelpers/CheckButton";
import { useSession } from "next-auth/react";

export default function AgregarProductoVenta({ open, onClose, reloadProducts, listadoCategorias }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [onLoading, onSet_Loading] = useState(false);
  const [categorias, onSet_Categorias] = useState([]);

  // Sesion
  const { data: session } = useSession();

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    cantDisponible: "",
    cantMinima: "",
    precio: "",
    imagen: null,
    tipoImagen: null,
    noRebajaInventario: false
  });

  useEffect(() => {
    if (open) {
      onSet_Categorias(listadoCategorias);
    }
  }, [open]);

  // Manejador de cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Valida cantidades positivas
    if ((name === "cantMinima" || name === "cantDisponible" || name === "precio") && value <= 0) {
      RemoveClassesAndAddByName(name, "is-invalid");
      toast.warning("No puede colocar valores negativos o en cero");
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    } else {
      RemoveClassesAndAddByName(name, "is-valid");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    RemoveValidationClasses("fc-product");
    setFormData({
      nombre: "",
      categoria: "",
      cantDisponible: "",
      cantMinima: "",
      precio: "",
      imagen: null,
      tipoImagen: null,
      noRebajaInventario: false
    });
    setImagePreview(null);
    setImageType(null);
    onSet_Categorias([]);
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();

      reader.onloadend = () => {
        toast.success("Imagen cargada exitosamente");
        setImagePreview(reader.result);
        setImageType(file.type);
      };

      reader.readAsDataURL(file);
    } else {
      toast.error("El formato debe ser PNG O JPG");
      console.error('El archivo seleccionado no es una imagen JPG o PNG.');
      setImagePreview(null);
    }
  };

  const onFormSubmit = (e) => {
    handleSubmit(e, true);
  };

  const handleSubmit = (e, isFromButton) => {
    e.preventDefault();
    let isValidForm = ValidateFormByClass("fc-product");

    if (!isValidForm && isFromButton) {
      toast.warning("Aún existen campos por completar");
    }
    else if (isValidForm && (Number(formData.cantMinima) >= Number(formData.cantDisponible)) && !formData.noRebajaInventario) {
      RemoveClassesAndAddByName("cantMinima", "is-invalid");
      toast.warning('Cantidad mínima debe ser menor a la cantidad disponible');
    }
    else {
      if (isFromButton) {
        agregarProdVenta();
      }
    }
  };

  async function agregarProdVenta() {
    var bytesImage = null;
    var typeImage = null;

    if (imagePreview && imageType) {
      if (imageType === 'image/png') {
        bytesImage = imagePreview.replace(/^data:image\/png;base64,/, '');
      } else if (imageType === 'image/jpeg') {
        bytesImage = imagePreview.replace(/^data:image\/jpeg;base64,/, '');
      }
      typeImage = imageType;
    }

    let model = {
      nombre: formData.nombre,
      cantidad: Number(formData.cantDisponible),
      cantidadMinima: Number(formData.cantMinima),
      precio: Number(formData.precio),
      idUsuarioCreacion: Number(session?.user.id),
      idCategoriaProdVenta: Number(formData.categoria),
      noRebajaInventario: formData.noRebajaInventario,
      imagen: bytesImage,
      tipoImagen: typeImage
    };

    onSet_Loading(true);

    try {
      const response = await fetch('/api/productosventa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model)
      });

      const data = await response.json();

      if (data.status == "success") {
        toast.success(data.message);
        handleClose();
        if (reloadProducts) {
          reloadProducts();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Sucedió un error al agregar el producto", error);
      console.error("Sucedió un error al agregar el producto", error);
    } finally {
      onSet_Loading(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center transition-opacity ${open ? "visible bg-black bg-opacity-40 dark:bg-opacity-50" : "invisible"} z-50`}
    >
      <div onClick={(e) => e.stopPropagation()} className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-all ${open ? "scale-100 opacity-100" : "scale-90 opacity-0"} m-auto max-w-3xl w-full md:w-2/3 lg:w-7/12`}>
        <button className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
          <X size={20} strokeWidth={2} onClick={handleClose} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
            Agregar Nuevo Producto
          </h2>
          <hr className="w-full border-t border-gray-600 dark:border-gray-500 mt-2"></hr>
          <form method="POST" className="my-2 w-full" onSubmit={onFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
              <HtmlFormInput legend={"Nombre"} type={"text"} colSize={1} value={formData.nombre} name={"nombre"} additionalClass={"fc-product"} onChange={handleChange} />
              <HtmlFormSelect colSize={1} legend={"Categoría"} value={formData.categoria} name={"categoria"} options={categorias} additionalClass={"fc-product"} onChange={handleChange} reset={onClose} />
            </div>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto">
              <HtmlFormInput legend={"Cant. Disponible"} type={"number"} colSize={1} value={formData.cantDisponible} name={"cantDisponible"} additionalClass={"fc-product"} onChange={handleChange} />
              <HtmlFormInput legend={"Cant. Mínima"} type={"number"} colSize={1} value={formData.cantMinima} name={"cantMinima"} additionalClass={"fc-product"} onChange={handleChange} />
              <HtmlFormInput legend={"Precio"} type={"number"} colSize={1} value={formData.precio} name={"precio"} additionalClass={"fc-product"} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mx-auto">
              <div className="col-span-1 m-2">
                <HtmlCheckButton legend="No rebaja inventario" onChange={(e) => setFormData((prev) => ({ ...prev, noRebajaInventario: e.target.checked }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mx-auto">
              <HtmlFormInput legend={"Imagen"} type={"file"} colSize={1} onChange={(e) => { handleImageUpload(e), handleChange(e) }} />
              {imagePreview && (
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Vista Previa:</h3>
                  <Image src={imagePreview} alt="Preview" className="max-w-xs max-h-20 mx-auto" height={100} width={80} />
                </div>
              )}
            </div>

            <div className="flex justify-center mt-4">
              {onLoading ? (
                <div className="flex items-center justify-center m-1">
                  <ClipLoader size={30} speedMultiplier={1.5} />
                </div>
              ) : (
                <>
                  <HtmlButton type="submit" legend={"Registrar"} color={"green"} icon={Plus} />
                  <HtmlButton type="button" legend={"Cancelar"} color={"gray"} icon={XCircle} onClick={handleClose} />
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}