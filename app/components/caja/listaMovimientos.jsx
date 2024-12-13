import { FormatOnlyDate, RemoveValidationClasses, ValidateFormByClass } from "@/app/api/utils/js-helpers";
import { Ban, Calendar, Coins, Plus, PlusIcon, Printer, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { Toaster, toast } from "sonner";
import HtmlButton from "../HtmlHelpers/Button";
import HtmlFormInput from "../HtmlHelpers/FormInput";
import HtmlFormSelect from "../HtmlHelpers/FormSelect";
import HtmlLabel from "../HtmlHelpers/Label";
import HtmlTableButton from "../HtmlHelpers/TableButton";
import TicketMovimiento from "./printTicket";
import HtmlNewLabel from "../HtmlHelpers/Label1";
import { ClipLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import XButton from "../HtmlHelpers/XButton";
import ModalTemplate from "../HtmlHelpers/ModalTemplate";

export default function ListaMovimientos({ open, onClose, cajaActual, idInfoCaja, }) {
  const options = [
    { value: 1, label: "Entrada" },
    { value: 2, label: "Salida" }, 
  ];
  const [listaMovimientos, onSet_ListaMovimientos] = useState([]);
  const [onLoading, onSet_onLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const ticketRef = useRef();
  const classResponsiveDivs = "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3";
  const classesButtons = "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
  const [onLoadingBtn, onSet_onLoadingBtn] = useState(false);

  //#region [Paginación]
  const [registrosPorPagina] = useState(3);
  const [paginaActual, onSet_PaginaActual] = useState(1);
  const indexOfLastMovimiento = paginaActual * registrosPorPagina;
  const indexOfFirstMovimiento = indexOfLastMovimiento - registrosPorPagina;
  const currentMovimientos = listaMovimientos.slice(
    indexOfFirstMovimiento,
    indexOfLastMovimiento
  );
  const paginate = (pageNumber) => onSet_PaginaActual(pageNumber);

  //#endregion

  //Sesion
  const { data: session } = useSession();

  // Estado del formulario
  const [formData, setFormData] = useState({
    monto: "",
    motivo: "",
    idTipoMovimiento:""
  });

  // Manejador de cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handlePrintClick = (item) => {
    setSelectedItem(item);
    setTimeout(() => {
      handlePrint();
    }, 0);
  };

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: "Comprobante de Movimiento de Dinero",
  });

  const handleClose = () => {
    setFormData({
      monto:"",
      idTipoMovimiento:"",
      motivo:""
    });
    RemoveValidationClasses("fc-movimientos")
    onClose()
  };

  const onGet_ListaMovimientos = useCallback(async () => {
    try {
      onSet_onLoading(true);
      const response = await fetch(`/api/caja/movimientos/${idInfoCaja}`);
      const result = await response.json();

      if (result.status == "success") {
        onSet_ListaMovimientos(result.data);
      } 
      else if (result.code == 204) {
        toast.warning(result.message);
        onSet_ListaMovimientos([]);
      } 
      else {
        toast.error(result.message);
        onSet_ListaMovimientos([]);
      }
    } catch (error) {
      console.error("Error al obtener la lista de movimientos:", error);
      toast.error("Sucedió un error al obtener los movimientos: " + error);
    } finally {
      onSet_onLoading(false);
    }
  }, [idInfoCaja]);

  useEffect(() => {
    if (open) {
      onInit()
    }
  }, [open]);

  async function onPost_Movimiento() {
    let isValid = ValidateFormByClass("fc-movimientos")
    if(!isValid){
      toast.warning("Aún existen campos requeridos")
    }
    else {
      let model = {
        idTipoMovimiento:Number(formData.idTipoMovimiento),
        motivo:formData.motivo,
        monto:formData.monto,
        idInfoCaja:Number(idInfoCaja),
        idUsuarioCreacion: Number(session?.user.id)
      };
      
      onSet_onLoadingBtn(true);

      try {
        const response = await fetch("/api/caja/movimientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(model),
        });

        const result = await response.json();

        if (result.status == "success") {
          onInit();
          toast.success("Movimiento agregado correctamente");
          
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Sucedió un error registrar el movimiento: " + error);
        console.error("Sucedió un error registrar el movimiento",error);
      }
      finally{
        onSet_onLoadingBtn(false);
      }
    }
  }

  async function onUpdate_Movimiento(id) {
    let model = {
      idMovimiento: id,
    };

    try {
      const response = await fetch("/api/caja/movimientos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(model),
      });

      const result = await response.json();

      if (result.status == "success") {
        toast.success(result.message);
        onInit();
      } 
      else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Sucedió un error al anular el movimiento: ` + error);
      console.error("Sucedió un error al anular el movimiento",error);
    }
  }

  const onInit = () =>{
    RemoveValidationClasses("fc-movimientos")
    setFormData({
      monto: "",
      motivo: "",
      idTipoMovimiento: ""
    });
    onGet_ListaMovimientos();
  }

  //Contenido del Modal
  const modalChildren = (
  <div style={{ maxHeight: "55vh", overflowY: "auto", overflowX: "hidden" }}>
    {cajaActual && (
      <div className="flex flex-col items-center">
        <form className="my-2 flex flex-col items-center">
          <div className={`pl-4 grid ${classResponsiveDivs} gap-4 mx-auto w-full`}>
            <HtmlFormSelect legend={"Movimiento"} value={formData.idTipoMovimiento} additionalClass={"fc-movimientos"} onChange={handleChange} options={options} name={"idTipoMovimiento"} />
            <HtmlFormInput legend={"Monto"} type={"number"} value={formData.monto} additionalClass={"fc-movimientos"} onChange={handleChange} name={"monto"} />
            <HtmlFormInput legend={"Comentario"} value={formData.motivo} additionalClass={"fc-movimientos"} onChange={handleChange} name={"motivo"} />


          </div>
          {
              onLoadingBtn ? (
                <div className="flex items-center justify-center mt-20">
                  <ClipLoader size={30} speedMultiplier={1.5} />
                </div>
              ) : (
                <div className = {`mt-6 pl-4 grid ${classesButtons} gap-1 justify-start items-start`}>
            <HtmlButton color="green" onClick={onPost_Movimiento} icon={Plus} legend="Registrar" />
            <HtmlButton onClick={handleClose} color="red" icon={X} legend="Cerrar" />
        </div>

              )
          }
            

        </form>
      </div>
    )}
    {listaMovimientos.length > 0 && (
      <div className={`grid grid-cols-1 mt-4 mx-auto`}>
        {onLoading ? (
          <div className="flex items-center justify-center mt-20">
            <ClipLoader size={30} speedMultiplier={1.5} />
          </div>
        ) : (
          <div className="pt-1">
            <div className="relative overflow-x-auto shadow-xl rounded-lg">
              <div className="overflow-auto max-h-72">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400" style={{ tableLayout: "auto" }}>
                      <thead className="text-sm text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-2" style={{ minWidth: "50px", maxWidth: "70px" }}>No.</th>
                          <th className="px-2 py-2" style={{ minWidth: "70px", maxWidth: "70px" }}>Fecha</th>
                          <th className="px-6 py-2" style={{ minWidth: "80px", maxWidth: "100px" }}>Tipo Mov.</th>
                          <th className="px-6 py-2" style={{ minWidth: "100px", maxWidth: "150px" }}>Monto</th>
                          <th className="px-6 py-2" style={{ minWidth: "110px", maxWidth: "160px" }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMovimientos.map((item, index) =>
                          item && (
                            <tr key={index} className="bg-white dark:bg-gray-800">
                              <td className="px-6 py-2" style={{ width: "5%", color: item.idEstadoMovimiento === 3 ? "red" : "black" }}>
                                {item.idMovimiento}
                              </td>
                              <td className="px-1 py-2" style={{ width: "5%" }}>
                                <HtmlNewLabel textSize="xs" icon={Calendar} color={item.idEstadoMovimiento === 3 ? "red" : "blue"} legend={FormatOnlyDate(item.fechaCreacion)} />
                              </td>
                              <td className="px-6 py-2" style={{ width: "10%", color: item.idEstadoMovimiento === 3 ? "red" : "black" }}>
                                {item.TipoMovimiento.nombre}
                              </td>
                              <td className="px-6 py-2" style={{ width: "10%", color: item.idEstadoMovimiento === 3 ? "red" : "black" }}>
                                ₡ {item.monto}
                              </td>
                              <td className="px-6 py-2" style={{ width: "10%", display: "flex", justifyContent: "space-around" }}>
                                {cajaActual && (
                                  item.idEstadoMovimiento === 3 ? (
                                    <HtmlNewLabel textSize="xs" icon={Ban} color="red" legend="NULO" />
                                  ) : (
                                    <>
                                      <HtmlTableButton tooltip="Imprimir recibo movimiento" size={12} padding={2} color="teal" icon={Printer} onClick={() => { setSelectedItem(item); handlePrintClick(item); }} />
                                      <HtmlTableButton tooltip="Anular Movimiento" size={12} padding={2} color="red" icon={Ban} onClick={() => onUpdate_Movimiento(item.idMovimiento)} />
                                    </>
                                  )
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>



              </div>
            </div>
            <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
              <ul className="inline-flex -space-x-px text-sm h-8">
                <li>
                  <button
                    onClick={() => paginate(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className={`flex items-center justify-center px-3 h-8 ${paginaActual === 1
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    Anterior
                  </button>
                </li>
                {[
                  ...Array(
                    Math.ceil(
                      listaMovimientos.length / registrosPorPagina
                    )
                  ).keys(),
                ].map((number) => (
                  <li key={number + 1}>
                    <button
                      onClick={() => paginate(number + 1)}
                      className={`flex items-center justify-center px-3 h-8 ${paginaActual === number + 1
                        ? "bg-gray-300 dark:bg-gray-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      {number + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => paginate(paginaActual + 1)}
                    disabled={
                      paginaActual ===
                      Math.ceil(
                        listaMovimientos.length / registrosPorPagina
                      )
                    }
                    className={`flex items-center justify-center px-3 h-8 ${paginaActual ===
                      Math.ceil(
                        listaMovimientos.length / registrosPorPagina
                      )
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    )}
    {selectedItem && (
      <div style={{ display: "none" }}>
        <TicketMovimiento ref={ticketRef} item={selectedItem} />
      </div>
    )}
  </div>
  )

  return (
    <>
      <ModalTemplate open={open} handleClose={handleClose} onClose={onClose} title={"Movimientos de Dinero"} icon={Coins} children={modalChildren} />
    </>
  );
}
