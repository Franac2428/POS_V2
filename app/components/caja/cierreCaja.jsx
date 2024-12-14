import { LockIcon, LockKeyholeIcon } from "lucide-react";
import { toast } from 'sonner';
import HtmlButton from "../HtmlHelpers/Button";
import HtmlFormInput from "../HtmlHelpers/FormInput";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { RemoveValidationClasses, ValidateNumbers } from "@/app/api/utils/js-helpers";
import ModalTemplate from "../HtmlHelpers/ModalTemplate";

export default function CierreCaja({ open, onClose, idInfoCaja, onGet_ListaInfoCaja }) {
    // Sesión
    const { data: session } = useSession();

    // Estado del formulario
    const [formData, setFormData] = useState({
        montoCierre: "",
    });

    // Manejador de cambio en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData({ montoCierre: "" });
        RemoveValidationClasses("fc-montoCierre");
        onGet_ListaInfoCaja();
        onClose();
    };

    async function onUpdate_Cierre() {
        if (!formData.montoCierre) {
            toast.warning("Debe ingresar un monto de cierre");
            return;
        }

        if (!ValidateNumbers(formData.montoCierre)) {
            toast.warning("Debe ingresar solo números");
            return;
        }

        const model = {
            idInfoCaja,
            montoCierreCaja: formData.montoCierre,
            idUsuarioModificacion: Number(session?.user.id),
        };

        try {
            const response = await fetch('/api/caja', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(model),
            });

            const result = await response.json();

            if (result.status === "success") {
                toast.success(result.message);
                handleClose();
            } else {
                console.error(result.message);
                toast.error("Error al cerrar la caja");
            }
        } catch (error) {
            toast.error("Sucedió un error al cerrar la caja");
            console.error(error);
        }
    }

    return (
        <ModalTemplate open={open} onClose={onClose} icon={LockKeyholeIcon} title={"Cerrar Caja"}>
            <div className="flex flex-col items-center">
                <form className="my-2 flex flex-col items-center">
                    <div className="pl-4 grid grid-cols-1 gap-4 mx-auto">
                        <HtmlFormInput
                            colSize={1}
                            additionalClass="fc-montoCierre"
                            legend="Ingresa el monto para cerrar la caja"
                            onChange={handleChange}
                            type="number"
                            name="montoCierre"
                            value={formData.montoCierre}
                        />
                    </div>
                    <div className="mt-6 pl-4 grid grid-cols-1 gap-4 mx-auto">
                        <div className="md:col-span-1">
                            <HtmlButton
                                color="green"
                                onClick={onUpdate_Cierre}
                                icon={LockIcon}
                                legend="Cerrar Caja"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </ModalTemplate>
    );
}
