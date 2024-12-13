'use client';

import {
    RemoveClassesAndAdd,
    ValidateFormByClass,
    ValidatePassword,
    ValidatePasswordMatch
} from "@/app/api/utils/js-helpers";
import HtmlBreadCrumb from "@/app/components/HtmlHelpers/BreadCrumb";
import HtmlButton from "@/app/components/HtmlHelpers/Button";
import HtmlCheckButton from "@/app/components/HtmlHelpers/CheckButton";
import HtmlFormInput from "@/app/components/HtmlHelpers/FormInput";
import HtmlLabel from "@/app/components/HtmlHelpers/Label";
import HtmlNewLabel from "@/app/components/HtmlHelpers/Label1";
import { AtSign, Phone, RefreshCcw, Type, User } from "lucide-react";
import { getSession } from "next-auth/react"; 
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from 'sonner';

const itemsBreadCrumb = ["Dashboard", "Mi Perfil"];

export default function Usuarios() {
    // #region [Constantes]
    const [onLoading, setOnLoading] = useState(true);
    const [usuario, setUsuario] = useState({});
    const [mostrarClave, setMostrarClave] = useState(false);
    const fetchCalled = useRef(false);

    const [formData, setFormData] = useState({
        clave: "",
        confirmarClave: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const limpiarCampos = () =>{
        setFormData({
            clave:"",
            confirmarClave:""
        })
    }

    // #endregion

    // #region [Funciones]
    const onGet_InfoUsuarioActual = useCallback(async () => {
        const session = await getSession();
        const idUsuario = session.user.id;

        if(!idUsuario){
            toast.error("Error al obtener el usuario. Contacte al administrador");
            return;
        }

        try {
            
            const response = await fetch(`/api/usuarios/${idUsuario}`);
            const result = await response.json();

            if (result.status === "success") {
                setUsuario(result.data);
                toast.success("Se ha obtenido la información.");
            } else if (result.code === 204) {
                toast.warning(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error al obtener el usuario actual:", error);
            toast.error("Error al obtener el usuario actual: " + error.message);
        } finally {
            setOnLoading(false);
        }
    }, []);

    const toggleMostrarClave = () => {
        setMostrarClave((prev) => !prev);
    };

    const cambiarClave = async () => {
        const session = await getSession();
        const idUsuario = session.user.id;

        if (!idUsuario) {
            toast.error("Error al obtener el usuario. Contacte al administrador");
            return;
        }

        try {
            const model = {
                idUsuario:idUsuario,
                clave: formData.clave,
            };

            setOnLoading(true);
            const response = await fetch(`/api/usuarios/${idUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(model),
            });

            const data = await response.json();

            if (data.status === "success") {
                toast.success(data.message);
                limpiarCampos()
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error al actualizar la clave: ', error);
            toast.error("Error al actualizar la clave: " + error.message);
        } finally {
            setOnLoading(false);
        }
    };

    const validarCambioClave = (e) => {
        e.preventDefault();

        const isValid = ValidateFormByClass("fc-clave");

        if (!isValid) {
            toast.warning('Aún existen campos por completar.');
            return;
        }

        if (!ValidatePasswordMatch(formData.clave, formData.confirmarClave)) {
            validaClaveCoincide();
            return;
        }

        const mensajes = ValidatePassword(formData.clave);
        if (mensajes.length) {
            validaClave(mensajes);
            return;
        }

        // Marcar como válidos
        RemoveClassesAndAdd("txtClave", "is-valid");
        RemoveClassesAndAdd("txtConfirmarClave", "is-valid");

        // Si todo es correcto
        cambiarClave();
    };

    const validaClaveCoincide = () => {
        RemoveClassesAndAdd("txtClave", "is-warning");
        RemoveClassesAndAdd("txtConfirmarClave", "is-warning");
        toast.warning('Las contraseñas no coinciden. Intente de nuevo.');
    };

    const validaClave = (mensajes) => {
        RemoveClassesAndAdd("txtClave", "is-warning");
        RemoveClassesAndAdd("txtConfirmarClave", "is-warning");

        const msjFormat = mensajes.map((mensaje) => `- ${mensaje}`).join("<br />");
        toast.info(<span dangerouslySetInnerHTML={{ __html: msjFormat }} />);
    };

    useEffect(() => {
        if (!fetchCalled.current) {
            fetchCalled.current = true;
            onGet_InfoUsuarioActual();
        }
    }, [onGet_InfoUsuarioActual]);

    // #endregion

    return (
        <>
            <div className="w-full p-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="pl-2 inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                        <HtmlBreadCrumb items={itemsBreadCrumb} />
                    </ol>
                </nav>
            </div>

            {onLoading ? (
                <div className="flex items-center justify-center mt-20">
                    <ClipLoader size={30} speedMultiplier={1.5} />
                </div>
            ) : (
                <div className="w-full pl-4 pr-4">
                    <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Mi Perfil
                        </h5>
                        <br />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-auto">
                            <HtmlNewLabel textSize="sm" legend={`Nombre: ${usuario.nombre} ${usuario.apellidos}`} color="blue" icon={Type} />
                            <HtmlNewLabel textSize="sm" legend={`Correo: ${usuario.correo}`} color="green" icon={AtSign} />
                            <HtmlNewLabel textSize="sm" legend={`Usuario: ${usuario.usuario}`} color="amber" icon={User} />
                            <HtmlNewLabel textSize="sm" legend={`Teléfono: ${usuario.telefono}`} color="red" icon={Phone} />
                        </div>
                        <div className="flex gap-6 mt-5">
                            <label className="text-sm text-red-600">En caso de que exista algún dato erróneo en esta información, indique al administrador para realizar el cambio.</label>
                        </div>

                        <form method="POST" className="my-2 w-full" onSubmit={validarCambioClave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
                                <HtmlFormInput legend="Contraseña" type={mostrarClave ? "text" : "password"} value={formData.clave} onChange={handleChange} colSize={1} id="txtClave" additionalClass="fc-clave" name="clave" />
                                <HtmlFormInput legend="Confirmar Contraseña" type={mostrarClave ? "text" : "password"} value={formData.confirmarClave} onChange={handleChange} colSize={1} id="txtConfirmarClave" additionalClass="fc-clave" name="confirmarClave" />
                            </div>
                            <div className="col-span-1 m-2">
                                <HtmlCheckButton legend={`${mostrarClave ? "Ocultar " : "Mostrar "} claves`} onChange={toggleMostrarClave} />
                            </div>
                            <div className="flex gap-6 mt-5">
                                <HtmlButton color="green" legend="Actualizar Contraseña" icon={RefreshCcw} type="submit" />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
