import { useState } from 'react';
import { Plus, X } from "lucide-react";
import { toast } from 'sonner';
import ModalTemplate from '../HtmlHelpers/ModalTemplate';
import HtmlFormInput from '../HtmlHelpers/FormInput';
import HtmlButton from '../HtmlHelpers/Button';
import { RemoveValidationClasses, ValidateFormByClass } from '@/app/api/utils/js-helpers';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';

export default function AgregarCategoria({ open, onClose, onReload }) {
    const classResponsiveDivs = "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1";
    const [onLoadingBtn, onSet_Loading] = useState(false);
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
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
            nombre: "",
            descripcion: ""
        });

        RemoveValidationClasses("fc-cat");
        onClose()
    };

    const onSaveCategoria = (e) => {
        e.preventDefault();
        const isValid = ValidateFormByClass("fc-cat");
        if (!isValid) {
            toast.warning('Aún existen campos por completar');
            return;
        }
        guardarCategoría();



    };

    const guardarCategoría = async () => {

        onSet_Loading(true);

        let model = {
            nombre: formData.nombre,
            descripcion:formData.descripcion,
            idUsuarioCreacion: Number(session?.user.id)
        }

        try {
            const response = await fetch('/api/categorias', {
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
            console.error('Error al crear la categoría:', error);
            toast.error("Error al registrar la categoría: " + error);
        }
        finally {
            onSet_Loading(false);
        }


    }

    const modalChild = (
        <form onSubmit={onSaveCategoria} className="w-full">
            <div className={`pl-4 grid ${classResponsiveDivs} gap-4 mx-auto w-full`}>
                <HtmlFormInput legend={"Nombre"} type={"text"} value={formData.nombre} additionalClass={"fc-cat"} onChange={handleChange} name={"nombre"} />
                <HtmlFormInput legend={"Descipción"} value={formData.descripcion} onChange={handleChange} name={"descripcion"} />
            </div>
            {
                onLoadingBtn ? (
                    <div className="flex items-center justify-center mt-20">
                        <ClipLoader size={30} speedMultiplier={1.5} />
                    </div>
                ) : (
                        <div className="flex justify-center items-center gap-4 mt-4">
                            <HtmlButton type='submit' colSize={1} color={"green"} icon={Plus} legend="Agregar" />
                            <HtmlButton onClick={handleClose} colSize={1} color={"red"} icon={X} legend="Cancelar" />
                        </div>


                )
            }
            
        </form>
    );

    return (
        <ModalTemplate title={"Agregar Categoría"} icon={Plus} open={open} onClose={onClose} children={modalChild} />
    );
}
