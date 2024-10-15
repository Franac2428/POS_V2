import { Check, CircleAlert, Pencil, Plus, PlusIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from 'sonner';
import HtmlButton from "../HtmlHelpers/Button";
import HtmlFormInput from "../HtmlHelpers/FormInput";
import { RemoveClassById, SetClassById, SetRemoveClassById } from "@/app/api/utils/js-helpers";
import HtmlCheckButton from "../HtmlHelpers/CheckButton";
import { ClipLoader } from "react-spinners";
import { useSession } from "next-auth/react";

export default function EditarRol({ open, onClose, listaPermisos, onGet_ListaRoles, idRol }) {
   const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
   const [nombreRol, setNombreRol] = useState("");
   const [descripcionRol, setDescripcionRol] = useState("");
   const [onLoading, onSet_onLoading] = useState(false);
   const fetchCalled = useRef(false);

   //Sesion
  const { data: session } = useSession();

   const limpiarForm = () => {
      setNombreRol("");
      setDescripcionRol("");
      setPermisosSeleccionados([]);
      RemoveClassById("txtNombreRol", ["is-invalid", "is-valid"])
   };

   const handleClose = () => {
      limpiarForm();
      if (onClose) {
         onClose();
      }
   };

   const togglePermiso = (idPermiso) => {
      setPermisosSeleccionados((prev) => {
         if (prev.includes(idPermiso)) {
            // Si el permiso está seleccionado, lo desmarcamos
            const nuevoSeleccionados = prev.filter(id => id !== idPermiso);
   
            // Función para desmarcar recursivamente los hijos de un permiso
            const desmarcarHijos = (id) => {
               const hijos = listaPermisos.filter(p => p.idPermisoPadre === id);
               hijos.forEach((hijo) => {
                  if (nuevoSeleccionados.includes(hijo.idPermiso)) {
                     nuevoSeleccionados.splice(nuevoSeleccionados.indexOf(hijo.idPermiso), 1);
                     desmarcarHijos(hijo.idPermiso); // Llamada recursiva para los hijos del hijo
                  }
               });
            };
   
            desmarcarHijos(idPermiso);
   
            return nuevoSeleccionados;
         } else {
            // Si el permiso no está seleccionado, lo marcamos
            const nuevoSeleccionados = [...prev, idPermiso];
            const permisoSeleccionado = listaPermisos.find(p => p.idPermiso === idPermiso);
   
            const agregarPadres = (id) => {
               const permiso = listaPermisos.find(p => p.idPermiso === id);
               if (permiso && permiso.idPermisoPadre) {
                  const idPadre = permiso.idPermisoPadre;
                  if (!nuevoSeleccionados.includes(idPadre)) {
                     nuevoSeleccionados.push(idPadre);
                     agregarPadres(idPadre);
                  }
               }
            };
   
            agregarPadres(idPermiso);
   
            return nuevoSeleccionados;
         }
      });
   };

   const handleEditar = async () => {
      if (onValidate()) {
         let model = {
            idRol:idRol,
            nombre: nombreRol,
            descripcion: descripcionRol == "" ? '--Sin descripción--' : descripcionRol,
            permisos: permisosSeleccionados,
            idUsuarioModificacion: Number(session?.user.id)
         };

         try {
            const response = await fetch('/api/roles', {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(model)
            });

            const data = await response.json();

            if (data.status == "success") {
               toast.success(data.message)
               onGet_ListaRoles();
               handleClose();
            }
            else {
               toast.error("Error al actualizar el rol: " + data.message)
            }
         } catch (error) {
            console.error('Error al actualizar el rol:', error);
            toast.error("Error al actualizar el rol: " + error)
         }
      }
   };

   const onValidate = () => {
      let esValido = true;

      if (nombreRol == "") {
         SetRemoveClassById("txtNombreRol", "is-invalid", "is-valid")
         toast.warning("Debe ingresar el nombre del rol")
         esValido = false
      }
      else {
         SetRemoveClassById("txtNombreRol", "is-valid", "is-invalid")
      }

      if (permisosSeleccionados.length == 0) {
         toast.warning("Debe seleccionar al menos un permiso")
         esValido = false
      }

      return esValido;
   }

   //Obtener el rol por Id
   const onGet_RolById = useCallback(async () => {
      onSet_onLoading(true);
      try {

         if (idRol == 0) {
            toast.error('No fue proporcionado un Id para buscar el rol');
            limpiarForm();
         }
         else {
            const response = await fetch(`/api/roles/${idRol}`);
            const result = await response.json();
            if (result.status === "success") {
               toast.success('Se ha obtenido el rol');
               setNombreRol(result.data.rol.nombre);
               setDescripcionRol(result.data.rol.descripcion);
               setPermisosSeleccionados(result.data.listaPermisos);
               onSet_onLoading(false);

            }
            else if (result.code === 204) {
               console.log(result.message);
               toast.error('Error al obtener el rol: ' + result.message);
               limpiarForm();
               onSet_onLoading(false);
            }
            else {
               console.log(result.message);
               toast.error('Error al obtener el rol: ' + result.message);
               setNombreRol("");
               setDescripcionRol("");
               setPermisosSeleccionados([]);
            }
         }

      }
      catch (error) {
         console.error('Error al obtener el rol:', error);
         toast.error('Sucedió un error al obtener el rol: ' + error);
         limpiarForm()
         onSet_onLoading(false);
      }
      finally {
         onSet_onLoading(false);
      }
   }, [idRol]);

   useEffect(() => {
      if (open) {
         onGet_RolById();
      }
   }, [open, onGet_RolById]);



   const renderPermisos = (permiso, nivel) => {
      const hijos = listaPermisos.filter(p => p.idPermisoPadre === permiso.idPermiso);
      const estaSeleccionado = permisosSeleccionados.includes(permiso.idPermiso);

      return (
         <div key={permiso.idPermiso} className={`mb-2`} style={{ marginLeft: `${nivel * 4}px` }}>
            <div className="flex items-center space-x-3">
               <HtmlCheckButton
                  legend={permiso.nombre}
                  checked={estaSeleccionado}
                  onChange={() => togglePermiso(permiso.idPermiso)}
               />
            </div>
            {hijos.length > 0 && (
               <div className="mt-2 pl-2">
                  {hijos.map(hijo => renderPermisos(hijo, nivel + 1))}
               </div>
            )}
            {nivel === 0 && <hr className="my-3 border-gray-300 dark:border-gray-600" />}
         </div>
      );
   };

   return (
      <div
         onClick={handleClose}
         className={`fixed inset-0 flex justify-center items-center transition-opacity ${open ? "visible bg-black bg-opacity-40 dark:bg-opacity-50" : "invisible"}`}
      >
         <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-all ${open ? "scale-100 opacity-100" : "scale-90 opacity-0"} max-w-3xl w-full md:w-4/5 lg:w-10/12`}
         >
            <button
               onClick={handleClose}
               className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
               <X size={20} strokeWidth={2} />
            </button>
            <div className="text-center w-full mb-4">
               <h2 className="text-xl font-bold flex gap-3 justify-center items-center text-gray-900 dark:text-gray-100">
                  <Pencil /> Editar Rol: #{idRol}
               </h2>
               <hr className="my-3 py-0.5 border-black dark:border-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {onLoading ? (
                  <div className="flex items-center justify-center mt-20">
                     <ClipLoader size={30} speedMultiplier={1.5}/>
                  </div>
               ) : (
                  <>
                     <div className="p-4 border rounded-lg h-96 overflow-y-auto">
                        {listaPermisos.filter(p => !p.idPermisoPadre).map((permisoPadre) => (
                           renderPermisos(permisoPadre, 0)
                        ))}
                     </div>
                  </>
               )}

               <div className="p-4 flex flex-col space-y-4">
                  {onLoading ? (
                     <div className="flex items-center justify-center mt-20">
                        <ClipLoader size={30} speedMultiplier={1.5}/>
                     </div>
                  ) : (
                     <>
                        <HtmlFormInput
                           legend={"Nombre del Rol"}
                           type={"text"}
                           id={"txtNombreRol"}
                           className="w-full"
                           value={nombreRol}
                           onChange={(e) => setNombreRol(e.target.value)}
                        />
                        <HtmlFormInput
                           legend={"Descripción (Opcional)"}
                           id={"txtDescripcion"}
                           className="w-full"
                           value={descripcionRol}
                           onChange={(e) => setDescripcionRol(e.target.value)}
                        />

                        <div className="flex justify-end">
                           <HtmlButton
                              legend="Editar"
                              color={"blue"}
                              icon={Pencil}
                              onClick={handleEditar}
                           />
                        </div>
                     </>
                  )}

               </div>
            </div>
         </div>
      </div>
   );
}
