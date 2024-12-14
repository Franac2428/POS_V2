"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import HtmlBreadCrumb from "@/app/components/HtmlHelpers/BreadCrumb";
import Entrada from "@/app/components/registro_horas/horaEntrada";
import Salida from "@/app/components/registro_horas/horaSalida";
import Nota from "@/app/components/registro_horas/observacion";
import { useCallback } from "react";
import HtmlButton from "@/app/components/HtmlHelpers/Button";
import { Clock, LogOut, Notebook } from "lucide-react";
import { getSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import MarcarEntrada from "@/app/components/registro_horas/horaEntrada";
import AgregarNota from "@/app/components/registro_horas/observacion";
import MarcarSalida from "@/app/components/registro_horas/horaSalida";

const itemsBreadCrumb = ["Dashboard", "Marcar Entrada / Salida"];

const MarcarPage = () => {
  const fecha = new Date();
  const horaLocal = fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const mesEsp = meses[fecha.getMonth()];
  const dia = fecha.getDate();
  const ano = fecha.getFullYear();

  const [asistencia, onSet_Asistencia] = useState(null);
  const [onLoading, onSet_onLoading] = useState(true);
  const fetchCalled = useRef(false);
  const [marcarEntrada, onModal_Entrada] = useState(false);
  const [marcarSalida, onModal_Salida] = useState(false);
  const [agregarNota, onModal_Nota] = useState(false);
  const [idAsistencia, onSet_IdAsistencia] = useState(0);
  const [idUsuarioEmpleadoMarca, onSet_IdUsuarioEmpleadoMarca] = useState(0);

  // Función para obtener la asistencia
  const onGet_Asistencia = useCallback(async () => {
    const session = await getSession();
    const idUsuarioEmpleado = session.user.id;
    onSet_IdUsuarioEmpleadoMarca(idUsuarioEmpleado);

    if (!idUsuarioEmpleado) return;
    onSet_onLoading(true);
    try {
      const response = await fetch(`/api/marcar/${Number(session.user.id)}`);
      const result = await response.json();
      if (result.status === "success") {
        onSet_Asistencia(result.data);
        onSet_IdAsistencia(result.data.idAsistencia);
        toast.success(result.message);
      } else if (result.code === 400) {
        toast.info(result.message);
        onSet_Asistencia(null);
      } else {
        console.log(result.message);
        toast.error(result.message);
        onSet_Asistencia(null);
      }
    } catch (error) {
      console.error("Error al obtener la asistencia:", error);
      toast.error("Sucedió un error al obtener la asistencia");
      onSet_Asistencia(null);
    } finally {
      onSet_onLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchCalled.current) {
      onGet_Asistencia();
      fetchCalled.current = true;
    }
  }, [onGet_Asistencia]);

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
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Registro Horas Entrada/Salida {dia} de {mesEsp} del {ano}
          </h2>
          {onLoading ? (
            <ClipLoader size={30} speedMultiplier={1.5} />
          ) : (
            <>
              <div className="pt-4">
                <div className="mt-2 grid grid-cols-1 md:grid-cols-1 mx-auto">
                  <div className="col-span-1 flex">
                    {!asistencia && (
                      <HtmlButton
                        onClick={() => {
                          onModal_Entrada(true);
                        }}
                        legend={"Marcar Hora de Entrada"}
                        icon={Clock}
                        color={"green"}
                      />
                    )}
                    {asistencia && (
                      <>
                        <HtmlButton
                          onClick={() => {
                            onModal_Nota(true);
                          }}
                          legend={"Agregar Nota a esta Asistencia"}
                          icon={Notebook}
                          color={"indigo"}
                        />

                        <HtmlButton
                          onClick={() => {
                            onModal_Salida(true);
                          }}
                          legend={"Marcar Hora de Salida"}
                          icon={LogOut}
                          color={"red"}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <MarcarEntrada
        open={marcarEntrada}
        onClose={() => {
          onModal_Entrada(false);
        }}
        horaActual={horaLocal}
        idUsuarioEmpleado={idUsuarioEmpleadoMarca}
        onGet_Asistencia={onGet_Asistencia}
      />
      <AgregarNota
        open={agregarNota}
        onClose={() => {
          onModal_Nota(false);
        }}
        idAsistencia={idAsistencia}
        onGet_Asistencia={onGet_Asistencia}
      />
      <MarcarSalida
        open={marcarSalida}
        onClose={() => {
          onModal_Salida(false);
        }}
        idAsistencia={idAsistencia}
        horaActual={horaLocal}
        idUsuarioEmpleado={idUsuarioEmpleadoMarca}
        onGet_Asistencia={onGet_Asistencia}
      />
    </>
  );
};

export default MarcarPage;
