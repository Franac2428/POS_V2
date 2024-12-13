import Factura from "@/app/components/pos/factura";
import { X } from "lucide-react";
import { useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Pagar({ open, onClose, montoTotal, facturaObj }) {



  const handlePago = () => {
    toast.success('Factura procesada correctamente');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handlePrint = () => {
    toast.success('Imprimiendo factura...');
    setTimeout(() => {
      onClose();
      setFactura(true);
    }, 1000);

  };

  const [factura, setFactura] = useState(false);


  const montoPagoRef = useRef(null);
  const montoVueltoRef = useRef(null);
  const labelFaltanteVuelto = useRef(null);


  const calculatePayment = (event) => {
    event.preventDefault();
    const montoPagoValue = montoPagoRef.current.value;

    // Vuelto
    if (montoPagoValue > montoTotal) {
      labelFaltanteVuelto.current.textContent = "Vuelto del Cliente:";
      const vuelto = Number(montoPagoValue) - montoTotal;
      montoVueltoRef.current.value = vuelto;
    }
    else if (montoPagoValue < montoTotal) {
      labelFaltanteVuelto.current.textContent = "Faltante:";
      const faltante = montoTotal - Number(montoPagoValue);
      montoVueltoRef.current.value = faltante;
    }
    else {
      labelFaltanteVuelto.current.textContent = "Pago Completo:";
      montoVueltoRef.current.value = 0;
    }
  }

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 flex z-100 justify-center items-center transition-opacity ${open ? "visible bg-black bg-opacity-20 dark:bg-opacity-30" : "invisible"}`}>
        <div onClick={(e) => e.stopPropagation()} className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-all ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"} m-auto`}>
          <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <X size={18} strokeWidth={2} />
          </button>
          <div className="w-full">
            <div className="mx-5 my-4 w-full">
              <h2 className="text-xl font-bold flex gap-3 text-center dark:text-white">Confirmar Pago</h2>
              <hr className="my-3 mr-7 py-0.2 border border-black"></hr>
            </div>

            <div className="grid mr-5 mb-5 gap-x-12 grid-cols-3">
              <div className="lg:w-full w-full ml-2 mr-2">
                <label htmlFor="selMedioPago" className="block mb-2 text-md font-medium text-gray-900  dark:text-white">Medio de Pago:</label>
                <select type="text" id="selMedioPago" className="dark:bg-gray-900 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="1">Efectivo</option>
                  <option value="2">Tarjeta</option>
                  <option value="3">Transferencia/ Sinpe</option>
                  <option value="4">Otro</option>
                </select>
              </div>

              <div className="lg:w-full w-full ml-2 mr-2">
                <label htmlFor="montoPago" className="dark:text-white block mb-2 text-md font-medium text-gray-900">Paga con:</label>
                <input ref={montoPagoRef} onChange={calculatePayment} type="text" id="montoPago" className="dark:bg-gray-900 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
              </div>

              <div className="lg:w-full w-full ml-2 mr-2">
                <label ref={labelFaltanteVuelto} htmlFor="montoVuelto" className="dark:text-white block mb-2 text-md font-medium text-gray-900">Vuelto del cliente:</label>
                <input disabled ref={montoVueltoRef} type="text" id="montoVuelto" className=" dark:bg-gray-900 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <h2 className="text-xl font-bold  dark:text-white"><span>Total: ₡</span>{montoTotal}</h2>
              <div className="flex gap-4">
                <button className="bg-green-600 font-semibold rounded-md py-2 px-6 text-white" onClick={handlePago}>Facturar</button>
                <button className="bg-green-600 font-semibold rounded-md py-2 px-6 text-white" onClick={handlePrint} >Facturar e Imprimir</button>
                <button className="bg-gray-400 font-semibold rounded-md py-2 px-6" onClick={onClose}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>


        <Toaster richColors />

      </div>

      <Factura
        openFactura={factura}
        onCloseFactura={() => setFactura(false)}
        json={facturaObj}
      />

    </>
  );
}
