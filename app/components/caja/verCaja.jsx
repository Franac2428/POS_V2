import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';
import { ClipLoader } from "react-spinners";
import HtmlNewLabel from "../HtmlHelpers/Label1";
import ModalTemplate from "../HtmlHelpers/ModalTemplate";

export default function VerCaja({ open, onClose, idInfoCaja }) {
    const [loading, onSet_Loading] = useState(false);
    const [datosCaja, onSet_DatosCaja] = useState(null);
    const classResponsiveDivs = "xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"

    // Obtener la info de esa caja
    const onGet_CajaResumen = useCallback(async () => {
        try {
            onSet_Loading(true);
            const response = await fetch(`/api/caja/facturas/${idInfoCaja}`);
            const result = await response.json();

            if (result.status == "success") {
                toast.success(result.message)
                onSet_DatosCaja(result.data);
            } 
            else if (result.code === 204) {
                toast.warning(result.message);
            } 
            else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error al obtener la información de la caja:', error);
            toast.error('Error al obtener la información de la caja: ' + error );
        } finally {
            onSet_Loading(false);
        }
    }, [idInfoCaja]);

    useEffect(() => {
        if (open) {
            onGet_CajaResumen();
        }
    }, [open, onGet_CajaResumen]);

    //Children del modal
    const children = 
        loading ?
            (
                <div className = "flex items-center justify-center mt-20" >
                <ClipLoader size={30} speedMultiplier={1.5} />
                </div >
            ) : 
            (datosCaja && (
                <div style={{ maxHeight: "50vh", overflowY: "auto", overflowX: "hidden" }}>

                    <div>
                        <div className={`grid ${classResponsiveDivs} gap-3 m-2`}>
                            <HtmlNewLabel color="blue" legend={`Inicio de Caja: ₡${datosCaja.montoInicioCaja}`} />
                            <HtmlNewLabel color="lime" legend={`Total Entradas: ₡${datosCaja.totalEntradas}`} />
                            <HtmlNewLabel color="green" legend={`Total Facturado: ₡${datosCaja.totalFacturado}`} />
                        </div>
                        <div className={`grid ${classResponsiveDivs} gap-3 m-2`}>
                            <HtmlNewLabel color="red" legend={`Cierre de Caja: ₡${datosCaja.montoCierreCaja}`} />
                            <HtmlNewLabel color="orange" legend={`Total Salidas: ₡${datosCaja.totalSalidas}`} />
                            <HtmlNewLabel color="slate" legend={`Total Diferencia: ₡${datosCaja.diferencia}`} />
                        </div>
                    </div>
                </div>
        )
    )
    return (
        <>
            <ModalTemplate open={open} onClose={onClose} loading={loading} title={"Info. Caja # " + idInfoCaja} icon={InfoCircledIcon} children={children} />
        </>
    );
}
