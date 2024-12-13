import { useState, useEffect } from 'react';
import { Pencil, Plus, X } from "lucide-react";
import { toast } from 'sonner';
import ModalTemplate from '../HtmlHelpers/ModalTemplate';
import HtmlFormInput from '../HtmlHelpers/FormInput';
import HtmlButton from '../HtmlHelpers/Button';
import { RemoveValidationClasses, ValidateFormByClass } from '@/app/api/utils/js-helpers';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';

export default function EditarCategoria({ open, onClose, onReload, item }) {
    const classResponsiveDivs = "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1";
    const [onLoadingBtn, onSet_Loading] = useState(false);
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: ""
    });


    useEffect(() => {
        if (open && item) {
            setFormData({
                nombre: item?.NombreCategoria || "",
                descripcion: item?.Descripcion || ""
            });
        }
    }, [open, item]);

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

        RemoveValidationClasses("fc-cat-edit");
        onClose();
    };

    const onEditCategoria = (e) => {
        e.preventDefault();
        const isValid = ValidateFormByClass("fc-cat-edit");
        if (!isValid) {
            toast.warning('Aún existen campos por completar');
            return;
        }
        editarCategoria();
    };

    const editarCategoria = async () => {
        onSet_Loading(true);

        let model = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            idUsuarioModificacion: Number(session?.user.id)
        };

        try {
            const response = await fetch(`/api/categorias/${item.CategoriaProductoID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(model)
            });

            const data = await response.json();

            if (data.status === "success") {
                toast.success(data.message);
                if (onReload) {
                    onReload();
                }
                handleClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error al editar la categoría:', error);
            toast.error("Error al registrar la categoría: " + error);
        } finally {
            onSet_Loading(false);
        }
    };

    const modalChild = (
        <form onSubmit={onEditCategoria} className="w-full">
            <div className={`pl-4 grid ${classResponsiveDivs} gap-4 mx-auto w-full`}>
                <HtmlFormInput legend={"Nombre"} type={"text"} value={formData.nombre} additionalClass={"fc-cat-edit"} onChange={handleChange} name={"nombre"} />
                <HtmlFormInput legend={"Descipción"} value={formData.descripcion} onChange={handleChange} name={"descripcion"} />
            </div>
            {onLoadingBtn ? (
                <div className="flex items-center justify-center mt-20">
                    <ClipLoader size={30} speedMultiplier={1.5} />
                </div>
            ) : (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <HtmlButton type="submit" colSize={1} color={"blue"} icon={Pencil} legend="Editar" />
                    <HtmlButton onClick={handleClose} colSize={1} color={"red"} icon={X} legend="Cancelar" />
                </div>
            )}
        </form>
    );

    return (
        <ModalTemplate title={"Editar Categoría"} icon={Pencil} open={open} onClose={onClose} children={modalChild} />
    );
}
