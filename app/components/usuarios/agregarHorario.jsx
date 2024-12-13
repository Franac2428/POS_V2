'use client';

import { useState } from 'react';
import { Clock, X, XCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import HtmlFormInput from '../HtmlHelpers/FormInput';
import { RemoveClassById } from '@/app/api/utils/js-helpers';
import HtmlButton from '../HtmlHelpers/Button';
import { ClipLoader } from 'react-spinners';
import HtmlCheckButton from '../HtmlHelpers/CheckButton';

export default function AgregarHorario({ open, onClose, idUsuario, onGet_ListaUsuarios }) {
  const initialHorario = {
    lunes: { inicio: '', fin: '', es_dia_libre: false },
    martes: { inicio: '', fin: '', es_dia_libre: false },
    miércoles: { inicio: '', fin: '', es_dia_libre: false },
    jueves: { inicio: '', fin: '', es_dia_libre: false },
    viernes: { inicio: '', fin: '', es_dia_libre: false },
    sábado: { inicio: '', fin: '', es_dia_libre: false },
    domingo: { inicio: '', fin: '', es_dia_libre: false }
  };

  const [horario, onSet_Horario] = useState(initialHorario);
  const [errors, setErrors] = useState({});
  const [loading, onSet_Loading] = useState(false);

  const handleChange = (dia, tipo, valor) => {
    onSet_Horario(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [tipo]: valor
      }
    }));
  };

  const handleDiaLibreChange = (dia) => {
    RemoveClassById("iptDiaInicio_" + dia, ["is-valid", "is-invalid"]);
    RemoveClassById("iptDiaFin_" + dia, ["is-valid", "is-invalid"]);

    onSet_Horario(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        es_dia_libre: !prev[dia].es_dia_libre,
        inicio: '',
        fin: ''
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(horario).forEach(dia => {
      const { inicio, fin, es_dia_libre } = horario[dia];
      if (!es_dia_libre) {
        if (!inicio) newErrors[`${dia}_inicio`] = 'Hora Inicio es requerida';
        if (!fin) newErrors[`${dia}_fin`] = 'Hora Fin es requerida';
        if (inicio && fin && inicio >= fin) newErrors[`${dia}_horario`] = 'Hora Inicio debe ser menor';
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.warning("Aún existen campos requeridos por completar...");
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    if (!idUsuario) {
      toast.error('No se ha proporcionado el Id del Usuario');
      return;
    }

    try {
      onSet_Loading(true);

      let model = {
        usuarioId: idUsuario,
        horarios: Object.keys(horario).map(dia => ({
          Dia: dia,
          HoraInicio: horario[dia].inicio,
          HoraFin: horario[dia].fin,
          esDiaLibre: horario[dia].es_dia_libre
        }))
      };

      const response = await fetch('/api/usuarios/horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model)
      });

      const data = await response.json();
      if (data.status === "success") {
        toast.success(data.message);
        onGet_ListaUsuarios();
        onClose();
      } else {
        toast.error("Error al crear el horario del usuario: " + data.message);
      }
    } catch (error) {
      toast.error("Error al crear el horario: " + error);
    } finally {
      onSet_Loading(false);
    }
  };

  const resetForm = () => {
    onSet_Horario(initialHorario);
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex justify-center items-center transition-opacity ${open ? "visible bg-black bg-opacity-20 dark:bg-opacity-30" : "invisible"
        }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow p-6 w-full max-w-xl overflow-auto transition-all ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"
          } m-4`}
        style={{ maxHeight: "95vh" }}
      >
        <button
          onClick={handleCancel}
          className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100 my-4">
            <Clock /> Asignar Horario
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative overflow-x-auto">
              <div className="overflow-auto" style={{ maxHeight: '15rem' }}>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-2">Día</th>
                        <th className="px-4 py-2">Hora Inicio</th>
                        <th className="px-4 py-2">Hora Fin</th>
                        <th className="px-4 py-2">Día Libre</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.keys(horario).map((dia) => (
                        <tr key={dia} className="text-center">
                          <td className="px-4 py-2 capitalize">{dia}</td>
                          <td className="px-4 py-2">
                            <HtmlFormInput
                              type={"time"}
                              id={"iptDiaInicio_" + dia}
                              value={horario[dia].inicio}
                              disabled={horario[dia].es_dia_libre}
                              onChange={(e) => handleChange(dia, "inicio", e.target.value)}
                              additionalClass={errors[`${dia}_inicio`] || errors[`${dia}_horario`] ? 'is-invalid' : ''}
                            />
                            {errors[`${dia}_inicio`] && <span className="text-red-500 text-sm">{errors[`${dia}_inicio`]}</span>}
                            {errors[`${dia}_horario`] && <span className="text-red-500 text-sm">{errors[`${dia}_horario`]}</span>}
                          </td>
                          <td className="px-4 py-2">
                            <HtmlFormInput
                              type={"time"}
                              id={"iptDiaFin_" + dia}
                              value={horario[dia].fin}
                              disabled={horario[dia].es_dia_libre}
                              onChange={(e) => handleChange(dia, "fin", e.target.value)}
                              additionalClass={errors[`${dia}_fin`] || errors[`${dia}_horario`] ? 'is-invalid' : ''}
                            />
                            {errors[`${dia}_fin`] && <span className="text-red-500 text-sm">{errors[`${dia}_fin`]}</span>}
                          </td>
                          <td className="px-4 py-2">
                            <HtmlCheckButton
                              checked={horario[dia].es_dia_libre}
                              onChange={() => handleDiaLibreChange(dia)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-4">
              {loading ? (
                <ClipLoader size={30} speedMultiplier={1.5} />
              ) : (
                <>
                  <HtmlButton type='submit' color={"green"} legend={"Registrar"} icon={Clock} />
                  <HtmlButton type='button' color={"gray"} legend={"Cancelar"} icon={XCircle} onClick={handleCancel} />
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
