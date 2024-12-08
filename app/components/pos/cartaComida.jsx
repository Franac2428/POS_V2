import { AlertOctagon, Check, Pencil, Plus, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import HtmlTableButton from "../HtmlHelpers/TableButton";
import Image from "next/image";
import HtmlNewLabel from "../HtmlHelpers/Label1";

export default function CardProducto({ producto, agregarProductoTabla, onSelectProductEdit, onSelectProductDelete, productoEliminado }) {
  const [productoState, setProductoState] = useState(producto);

  const agregarDetalle = () => {
    if (productoState.cantDisponible > 0) {
      const updatedProducto = { ...productoState, cantDisponible: productoState.cantDisponible - 1 };
      setProductoState(updatedProducto);
      agregarProductoTabla(updatedProducto); // Agregar con cantidad descontada
    }
  };

  useEffect(() => {
    if (productoEliminado && productoEliminado.idProductoVenta === productoState.productoVentaId) {
      setProductoState(prevState => ({
        ...prevState,
        cantDisponible: prevState.cantDisponible + productoEliminado.quantity
      }));
    }
  }, [productoEliminado]);

  return (
    <div className="max-w-xs border bg-white dark:bg-gray-800 p-4 flex flex-col items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="w-20 h-20 flex justify-center items-center overflow-hidden rounded-lg">
        <Image
          src={productoState.imagen}
          width={200}
          height={200}
          alt=""
          className="object-contain w-full h-full"
        />
      </div>
      <h2 className="mt-2 text-lg font-bold dark:text-white text-center">{productoState.nombre}</h2>

      <div className="mt-2">
        <HtmlNewLabel color={"zinc"} legend={"₡ " + productoState.precio} />
      </div>
      <div className="mt-2">
        <HtmlNewLabel
          icon={Number(productoState.cantMinima) >= productoState.cantDisponible ? AlertOctagon : Check}
          color={Number(productoState.cantMinima) >= productoState.cantDisponible ? 'red' : 'green'}
          legend={Number(productoState.cantMinima) >= productoState.cantDisponible
            ? "Cant.Mínima: " + productoState.cantMinima
            : "Cantidad: " + productoState.cantDisponible}
        />
      </div>

      <div className="flex justify-between items-center mt-2 w-full">
        <HtmlTableButton tooltip={"Eliminar Producto"} color={"red"} icon={Trash} onClick={() => { onSelectProductDelete(productoState) }} />
        <HtmlTableButton tooltip={"Editar Producto"} color={"blue"} icon={Pencil} onClick={() => { onSelectProductEdit(productoState) }} />
        {productoState.cantDisponible > 0 && (
          <HtmlTableButton tooltip={"Agregar Producto"} color={"green"} icon={Plus} onClick={agregarDetalle} />
        )}
      </div>
    </div>
  );
}
