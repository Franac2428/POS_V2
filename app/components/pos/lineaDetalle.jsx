import HtmlTableButton from "@/app/components/HtmlHelpers/TableButton";
import { Trash, Minus, Plus } from "lucide-react";
import { toast } from 'sonner';
import Image from 'next/image';

const LineaProducto = ({
  id,
  quantity,
  details,
  price,
  idProductoVenta,
  cantMinima,
  cantProducto,
  onDelete,
  onChange,
  image
}) => {

  const handleChangeQuantity = (e, id, name) => {
    let newQuantity = e.target.value === "" ? null : parseInt(e.target.value, 10);

    if (isNaN(newQuantity)) {
      newQuantity = 0; // Manejo para entradas vacías o no numéricas
    }    
    if (name === "cantidad" && newQuantity < 0) {
      toast.warning("No puede colocar valores negativos");
    } else if (newQuantity === 0) {
      toast.info("La línea se elimina debido a la cantidad 0");
      onDelete({ id, idProductoVenta, cantMinima, cantProducto }); 
    } else if (newQuantity > cantProducto + 1 ) {
        toast.error("No puede ordenar una cantidad mayor a la disponible");
        newQuantity = cantProducto;     
    } else {
      onChange(e, id, name); 
    }
  };

  return (
    <div className="grid grid-cols-3 items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      {/* Columna 1: Imagen */}
      <div className="flex justify-center items-center p-2">
        <Image
          src={image}
          width={80}
          height={80}
          alt="Imagen del producto"
          className="object-contain rounded-md"
        />
      </div>

      <div className="flex flex-col items-start justify-between p-2 space-y-2">
        {/* Detalles del producto: ahora es solo texto, no editable */}
        <span className=" text-gray-900 text-md font-semibold rounded-md block w-35 p-1">{details}</span>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleChangeQuantity({ target: { value: quantity - 1 } }, id, 'cantidad')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={quantity}
            max={cantProducto}
            name={"cantidad"}
            onChange={(e) => handleChangeQuantity(e, id, 'cantidad')}
            className="dark:bg-gray-900 dark:text-white border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-14 p-1 text-center"
          />
          <button
            type="button"
            onClick={() => handleChangeQuantity({ target: { value: quantity + 1 } }, id, 'cantidad')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between p-2 space-y-2">
        {/* Precio: ahora es solo texto, no editable */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-900 text-md rounded-md font-medium block w-16 p-1">₡ {price}</span>
        </div>
        <HtmlTableButton
          tooltip={"Eliminar Línea"}
          color={"red"}
          size={12}
          padding={2}
          icon={Trash}
          onClick={() => onDelete({ id, idProductoVenta, cantMinima, cantProducto })}
        />
      </div>
    </div>
  );
};

export default LineaProducto;
