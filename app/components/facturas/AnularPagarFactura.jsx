import { Check, CircleAlert, InfoIcon, X } from "lucide-react";
import HtmlButton from "../HtmlHelpers/Button";
import { ClipLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import ModalTemplate from "../HtmlHelpers/ModalTemplate";

export default function AnularPagarFactura({ open, onClose,action,idFactura,onReload }) {
    const [onLoading, onSet_Loading] = useState(false);
    var legend = action == "cancel" ? "anular" : "pagar"

    //Sesion
    const { data: session } = useSession();



    const actionToExecute = async () => {
        let model = {
            id: Number(idFactura),
            idUsuarioModificacion: Number(session?.user.id),
            action:action
        }

        onSet_Loading(true);

        try {
            const response = await fetch(`/api/factura/${idFactura}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(model)
            });

            const data = await response.json();

            if (data.status == "success") {
                toast.success(data.message)
                onReload();
                onClose();
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            console.error(`Error al ${legend} la factura :`, error);
            toast.error(`Error al ${legend} la factura: ` + error);
        }
        finally {
            onSet_Loading(false);
        }


    }

    const modalChildren = (
        <>
            <div className="text-center">
                <p className="text-md text-gray-800 dark:text-gray-100">
                    ¿Está seguro que desea {legend} la factura?
                </p>
            </div>
            <form className="my-2 w-full flex flex-col items-center">
                {onLoading ? (
                    <div className="flex items-center justify-center m-1">
                        <ClipLoader size={30} speedMultiplier={1.5} />
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center gap-6 mt-5">
                            <HtmlButton onClick={actionToExecute} color={"green"} legend={legend.charAt(0).toUpperCase() + legend.slice(1)} icon={Check} />
                            <HtmlButton onClick={onClose} color={"gray"} legend={"Cancelar"} icon={X} />
                        </div>
                    </>
                )}
            </form>
        </>
    )


    return (
        <ModalTemplate open={open} onClose={onClose} icon={InfoIcon} title={`${legend.charAt(0).toUpperCase() + legend.slice(1)} - Factura #${idFactura.toString().padStart(6, '0')}`} children={modalChildren} />

    );
}