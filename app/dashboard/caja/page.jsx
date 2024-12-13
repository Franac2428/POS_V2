"use client";

import {
  AddRemoveClassById,
  FormatDate,
  RemoveValidationClasses,
  ValidateFormByClass,
  ValidateNumbers,
} from "@/app/api/utils/js-helpers";
import HtmlBreadCrumb from "@/app/components/HtmlHelpers/BreadCrumb";
import HtmlButton from "@/app/components/HtmlHelpers/Button";
import HtmlFormInput from "@/app/components/HtmlHelpers/FormInput";
import HtmlLabel from "@/app/components/HtmlHelpers/Label";
import HtmlNewLabel from "@/app/components/HtmlHelpers/Label1";
import HtmlTableButton from "@/app/components/HtmlHelpers/TableButton";
import CierreCaja from "@/app/components/caja/cierreCaja";
import ListaMovimientos from "@/app/components/caja/listaMovimientos";
import VerCaja from "@/app/components/caja/verCaja";
import SpinnerOnLoading from "@/app/components/spinner";
import { LockClosedIcon } from "@radix-ui/react-icons";
import {
  ArrowLeftRight,
  BookCheck,
  Calendar,
  Coins,
  Eye,
  HandCoins,
  Lock,
  Printer,
} from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { Toaster, toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import TicketCaja from "@/app/components/caja/printCaja";
import TablePagination from "@/app/components/HtmlHelpers/Pagination";

const itemsBreadCrumb = ["Home", "Caja"];

export default function Caja() {
  const [infoCaja, setInfoCaja] = useState([]);
  const [openModalCaja, onSet_ModalCaja] = useState(false);
  const [cajaActual, onSet_CajaActual] = useState(null);
  const [openModalCierre, onSet_ModalCierre] = useState(false);
  const [openModalLista, onSet_ModalLista] = useState(false);
  const [setIdCaja, onSet_IdCaja] = useState(null);
  const [onLoading, onSet_onLoading] = useState(false);
  const fetchCalled = useRef(false);

  //Paginación
  const [registrosPorPagina] = useState(5);
  const [paginaActual, onSet_PaginaActual] = useState(1);
  const indexOfLastCaja = paginaActual * registrosPorPagina;
  const indexOfFirstCaja = indexOfLastCaja - registrosPorPagina;
  const currentCajas = infoCaja.slice(indexOfFirstCaja, indexOfLastCaja);
  const paginate = (pageNumber) => onSet_PaginaActual(pageNumber);

  //Imprimir cierre
  const [selectedItem, setSelectedItem] = useState(null);
  const ticketRef = useRef();
  const [shouldPrint, setShouldPrint] = useState(false);
  const [printReady, setPrintReady] = useState(false);

  //Sesion
  const { data: session } = useSession();

  // Estado del formulario
  const [formData, setFormData] = useState({
    montoInicio: "",
  });

  // Manejador de cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onClearForm = () => {
    setFormData({
      montoInicio: "",
    });

    RemoveValidationClasses("fc-montoInicio");
  };

  const onGet_CajaActual = useCallback(async () => {
    try {
      const session1 = await getSession();
      let idUsuario = Number(session1?.user.id);
      const response = await fetch(`/api/current/${idUsuario}`);
      const result = await response.json();

      if (result.status == "success") {
        onSet_CajaActual(result.data);
      }
      else if (result.code == 204) {
        toast.warning(result.message);
        onSet_CajaActual(null);
      }
      else {
        onSet_CajaActual(null);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al obtener la caja actual:", error);
      toast.error("Sucedió un error al obtener la caja actual");
    }
  }, []);

  const onGet_ListaInfoCaja = useCallback(async () => {
    onSet_onLoading(true);
    const session2 = await getSession();
    try {
      let model = {
        idUsuarioCreacion: Number(session2?.user?.id),
        esEmpleado: Boolean(session2?.user?.esEmpleado), // Asegurarse que es booleano
      };

      console.log(model);

      const response = await fetch(
        `/api/caja?idUsuarioCreacion=${model.idUsuarioCreacion}&esEmpleado=${model.esEmpleado}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setInfoCaja(result.data);
        toast.success(result.message);
        onGet_CajaActual();
      } else if (result.code === 204) {
        onGet_CajaActual();
      } else {
        console.log(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al obtener la lista de cajas:", error);
      toast.error("Sucedió un error al obtener la lista de cajas");
    } finally {
      onSet_onLoading(false);
    }
  }, []);

  const onGet_Caja = useCallback(async (item) => {
    try {
      const response = await fetch(`/api/caja/facturas/${item.idInfoCaja}`);
      const result = await response.json();

      if (result.status === "success") {
        setSelectedItem(result.data);
      } else if (result.code === 204) {
        toast.warning(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al obtener la información de la caja:", error);
      toast.error("Error al obtener la información de la caja: " + error);
    }
  }, []);

  const handlePrintClick = async (item) => {
    await onGet_Caja(item);

    setTimeout(() => {
      if (ticketRef.current) {
        handlePrint();
      }
    }, 100);
  };

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: "Ticket Cierre de Caja",
  });

  async function onPost_AbrirCaja() {
    let isValid = ValidateFormByClass("fc-montoInicio");
    if (!isValid) {
      toast.warning("Debe indicar un monto para aperturar la caja");
      return;
    } 
    
    if (!ValidateNumbers(formData.montoInicio)) {
      toast.warning("Debe ingresar solo números");
      AddRemoveClassById("txtMontoInicio","is-warning","is-invalid")
      return;
    }
    
    else {
      onSet_onLoading(true);
      let model = {
        montoInicioCaja: Number(formData.montoInicio),
        idUsuarioCreacion: Number(session?.user.id),
      };

      try {
        const response = await fetch("/api/caja", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(model),
        });

        const data = await response.json();

        if (data.status == "success") {
          toast.success(data.message);
          onGet_ListaInfoCaja();
          onClearForm();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error al aperturar la caja:", error);
        toast.error("Error al aperturar la caja: " + error);
      } finally {
        onSet_onLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      onGet_ListaInfoCaja();
    }
  }, [onGet_ListaInfoCaja]);

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
            Administración de Cajas
          </h5>

          {onLoading ? (
            <ClipLoader size={30} speedMultiplier={1.5} />
          ) : (
            <>
              {!cajaActual ? (
                <div className="grid grid-cols-2 md:grid-cols-12 gap-4 mx-auto">
                  <HtmlFormInput id={"txtMontoInicio"} additionalClass={"fc-montoInicio"} legend={"Monto Inicio Caja"} value={formData.montoInicio} name={"montoInicio"} colSize={3} onChange={handleChange} />
                  <div className="col-span-3 mt-8">
                    <HtmlButton colSize={1} color={"blue"} icon={HandCoins} legend="Abrir Caja" onClick={() => { onPost_AbrirCaja(); }}
                    />
                  </div>
                </div>
              ) : null}
            </>
          )}

          {onLoading ? (
            <div className="flex items-center justify-center mt-20">
              <ClipLoader size={30} speedMultiplier={1.5} />
            </div>
          ) : (
            <div className="pt-4">
              <div className="shadow-xl border-2 bg-white dark:bg-gray-700 px-1 py-1 rounded-xl">
                <div className="relative overflow-x-auto shadow-md rounded-lg">
                  <div
                    className=""
                    style={{ overflow: "auto", maxHeight: "30rem" }}
                  >
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-white uppercase bg-gray-900 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3"
                            style={{ width: "5%" }}
                          >
                            No. Caja
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3"
                            style={{ width: "5%" }}
                          >
                            Fecha Inicio
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3"
                            style={{ width: "5%" }}
                          >
                            Fecha Cierre
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3"
                            style={{ width: "5%" }}
                          >
                            Monto Inicio
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3"
                            style={{ width: "5%" }}
                          >
                            Monto Cierre
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3"
                            style={{ width: "5%" }}
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {currentCajas.map(
                          (item, index) =>
                            item !== null && (
                              <tr
                                key={index}
                                className="bg-white dark:bg-gray-800"
                              >
                                <td className="px-6 py-4 text-black">
                                  # {item.idInfoCaja}
                                </td>
                                <td className="px-6 py-4">
                                  <HtmlNewLabel
                                    icon={Calendar}
                                    color={"green"}
                                    legend={FormatDate(item.fechaApertura)}
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  {item.fechaCierre == null ? (
                                    <HtmlNewLabel
                                      icon={BookCheck}
                                      color={"blue"}
                                      legend={"Caja Actual"}
                                    />
                                  ) : (
                                    <HtmlNewLabel
                                      icon={Lock}
                                      color={"red"}
                                      legend={FormatDate(item.fechaCierre)}
                                    />
                                  )}
                                </td>
                                <td className="px-6 py-4 text-black">
                                  ₡{item.montoInicioCaja}
                                </td>
                                <td className="px-6 py-4 text-black">
                                  ₡
                                  {item.montoCierreCaja == null
                                    ? 0
                                    : item.montoCierreCaja}
                                </td>
                                <td className="px-6 py-4">
                                  <HtmlTableButton
                                    tooltip={"Ver Caja"}
                                    color={"blue"}
                                    onClick={() => {
                                      onSet_ModalCaja(true),
                                        onSet_IdCaja(item.idInfoCaja);
                                    }}
                                    icon={Eye}
                                  />
                                  {item.fechaCierre && (
                                    <HtmlTableButton
                                      tooltip={"Imprimir Cierre"}
                                      color={"teal"}
                                      onClick={() => {
                                        handlePrintClick(item)
                                      }}
                                      icon={Printer}
                                    />
                                  )}
                                  {!item.fechaCierre && (
                                    <HtmlTableButton
                                      tooltip={"Movimientos de Dinero"}
                                      color={"yellow"}
                                      onClick={() => {
                                        onSet_IdCaja(item.idInfoCaja),
                                          onSet_ModalLista(true)

                                      }}
                                      icon={ArrowLeftRight}
                                    />
                                  )}
                                  {!item.fechaCierre && (
                                    <HtmlTableButton
                                      tooltip={"Cerrar Caja"}
                                      color={"red"}
                                      onClick={() => {
                                        onSet_ModalCierre(true),
                                          onSet_IdCaja(item.idInfoCaja);
                                      }}
                                      icon={LockClosedIcon}
                                    />
                                  )}
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
              </div>
                <TablePagination listado={infoCaja} onSet_PaginaActual={onSet_PaginaActual} paginaActual={paginaActual} />

            </div>
          )}
        </div>
      </div>
      <VerCaja
        open={openModalCaja}
        idInfoCaja={setIdCaja}
        onClose={() => onSet_ModalCaja(false)}
      />
      <ListaMovimientos
        open={openModalLista}
        onClose={() => onSet_ModalLista(false)}
        cajaActual={cajaActual}
        idInfoCaja={setIdCaja}
      />
      <CierreCaja open={openModalCierre} idInfoCaja={setIdCaja} onClose={() => { onSet_ModalCierre(false) }} onGet_ListaInfoCaja={onGet_ListaInfoCaja} />
      {selectedItem && (
        <div style={{ display: "none" }}>
          <TicketCaja ref={ticketRef} item={selectedItem} />
        </div>
      )}

    </>
  );
}
