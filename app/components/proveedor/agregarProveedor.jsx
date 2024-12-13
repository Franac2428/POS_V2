import { useState } from 'react';
import { Plus, X } from "lucide-react";
import { toast } from 'sonner';
import ModalTemplate from '../HtmlHelpers/ModalTemplate';
import HtmlFormInput from '../HtmlHelpers/FormInput';
import HtmlButton from '../HtmlHelpers/Button';
import { AddRemoveClassById, RemoveValidationClasses, ValidateEmailStructure, ValidateFormByClass, ValidateIsName, ValidateNumbers } from '@/app/api/utils/js-helpers';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';

export default function AgregarProveedor({ open, onClose, onReload }) {
    const classResponsiveDivs = "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2";
    const classResponsiveDivs2 = "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1";

    const [onLoadingBtn, onSet_Loading] = useState(false);
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        correo: '',
        web: '',
        direccion: '',
        nombreContacto: ''
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            telefono: '',
            correo: '',
            web: '',
            direccion: '',
            nombreContacto: ''
        });

        RemoveValidationClasses("fc-prov");
        onClose()
    };

    const onSaveProveedor = (e) => {
        e.preventDefault();
        const isValid = ValidateFormByClass("fc-prov");
        if (!isValid) {
            toast.warning('Aún existen campos por completar');
            return;
        }

        // if(!ValidateIsName(formData.nombre)){
        //     toast.warning('El nombre no tiene el formato correcto');
        //     AddRemoveClassById("txtNombre","is-warning","is-valid")
        //     return;
        // }

        // if (!ValidateIsName(formData.nombreContacto)) {
        //     toast.warning('El nombre de contacto no tiene el formato correcto');
        //     AddRemoveClassById("txtNombreContacto", "is-warning", "is-valid")
        //     return;
        // }

        if(!ValidateNumbers(formData.telefono)){
            toast.warning('El teléfono solo debe incluir númerosa');
            AddRemoveClassById("txtTelefono", "is-warning", "is-valid")
            return;
        }

        if (!ValidateEmailStructure(formData.correo)) {
            toast.warning('El correo no posee la estructura válida');
            AddRemoveClassById("txtCorreo", "is-warning", "is-valid")
            return;
        }

        guardarProveedor();



    };

    const guardarProveedor = async () => {

        onSet_Loading(true);

        let model = {
            nombre: formData.nombre,
            telefono: formData.telefono,
            correo: formData.correo,
            web: formData.web,
            direccion:formData.direccion,
            nombreContacto:formData.nombreContacto,
            idUsuarioCreacion: Number(session?.user.id)
        }

        try {
            const response = await fetch('/api/proveedor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(model)
            });

            const data = await response.json();

            if (data.status == "success") {
                toast.success(data.message)
                if (onReload) {
                    onReload();
                }

                handleClose();
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            console.error('Error al crear el proveedor:', error);
            toast.error("Error al crear el proveedor: " + error);
        }
        finally {
            onSet_Loading(false);
        }


    }

    const modalChild = (
        <form onSubmit={onSaveProveedor} className="w-full flex flex-col h-full">
            <div className="flex-grow w-full max-h-[48vh] overflow-y-auto p-4">
                <div className={`pl-4 grid ${classResponsiveDivs} gap-4 mx-auto w-full`}>
                    <HtmlFormInput id={"txtNombre"} legend={"Nombre"} type={"text"} value={formData.nombre} additionalClass={"fc-prov"} onChange={handleChange} name={"nombre"} />
                    <HtmlFormInput id={"txtNombreContacto"} legend={"Contacto"} value={formData.nombreContacto} onChange={handleChange} additionalClass={"fc-prov"} name={"nombreContacto"} />
                </div>

                <div className={`pl-4 grid ${classResponsiveDivs} gap-4 mx-auto w-full`}>
                    <HtmlFormInput id={"txtTelefono"} legend={"Teléfono"} type={"text"} value={formData.telefono} additionalClass={"fc-prov"} onChange={handleChange} name={"telefono"} />
                    <HtmlFormInput id={"txtCorreo"} legend={"Correo"} value={formData.correo} onChange={handleChange} additionalClass={"fc-prov"} name={"correo"} />
                </div>

                <div className={`pl-4 grid ${classResponsiveDivs2} gap-4 mx-auto w-full`}>
                    <HtmlFormInput legend={"Sitio Web (Opcional)"} type={"text"} value={formData.web} onChange={handleChange} name={"web"} />
                    <HtmlFormInput legend={"Dirección"} value={formData.direccion} onChange={handleChange} name={"direccion"} />
                </div>
            </div>

            <div className="w-full p-2 border-t border-gray-300">
                {onLoadingBtn ? (
                    <div className="flex items-center justify-center">
                        <ClipLoader size={30} speedMultiplier={1.5} />
                    </div>
                ) : (
                    <div className="flex justify-center items-center gap-4">
                        <HtmlButton type="submit" colSize={1} color={"green"} icon={Plus} legend="Agregar" />
                        <HtmlButton onClick={handleClose} colSize={1} color={"red"} icon={X} legend="Cancelar" />
                    </div>
                )}
            </div>
        </form>
    );

    return (
        <ModalTemplate title={"Agregar Proveedor"} icon={Plus} open={open} onClose={onClose} children={modalChild} />
    );
}
