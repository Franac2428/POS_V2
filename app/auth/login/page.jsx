"use client"

import CambioClave from "@/app/(auth)/olvidoClave";
import { ValidateEmailStructure, ValidateFormByClass } from "@/app/api/utils/js-helpers";
import HtmlFormInput from "@/app/components/HtmlHelpers/FormInput";
import { signIn, getSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";



export default function Login() {
    const [cambioClave, setCambioClave] = useState(false);
    const [onLoading, onSet_Loading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        input: "",
        clave: ""
    });

    // Manejador de cambio en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    //Loguearse
    const onLogin = async () => {

        var isValid = ValidateFormByClass("fc-login");

        if (!isValid) {
            toast.warning("Debe completar los campos solicitados");
        }
        else {
            onSet_Loading(true)
            var isEmail = ValidateEmailStructure(formData.input);
            try {
                const response = await signIn("credentials", {
                    email: isEmail ? formData.input : "",
                    user: !isEmail ? formData.input : "",
                    password: formData.clave,
                    loginByEmail: isEmail,
                    redirect: false
                });


                if (response.error) {
                    var res = JSON.parse(response.error);
                    toast.error(res.message);
                    onSet_Loading(false);

                }
                else {
                    const session = await getSession();
                    const esEmpleado = session.user.esEmpleado;

                    if (esEmpleado) {
                        router.push('/dashboard/marcar');
                    } else {
                        router.push('/dashboard');
                    }

                }
            }
            catch (error) {
                console.log("Error al iniciar sesión: " + error);
                toast.error(error);
                onSet_Loading(false);

            }
        }

    }


    return (
        <div className="flex w-full h-screen">
            <div className="w-full flex items-center justify-center lg:w-1/2">
                {onLoading ? (
                    <div className="flex items-center justify-center m-1">
                        <ClipLoader size={50} speedMultiplier={1.5} />
                    </div>
                ) : (
                    <>
                        <form className=' w-11/12 max-w-[700px] px-10 py-20 rounded-3xl'>
                            <h1 className='text-5xl font-semibold'>Inicio de sesión</h1>
                            <p className='font-medium text-lg text-gray-500 mt-4'>¡Bienvenido! Por favor ingrese sus credenciales.</p>
                            <div className='mt-8'>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mx-auto">
                                    <HtmlFormInput  name="input" value={formData.input} onChange={handleChange} additionalClass={"fc-login"} type={"text"} legend={"Usuario o Correo"} colSize={1} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mx-auto">
                                    <HtmlFormInput name="clave" value={formData.clave} onChange={handleChange} additionalClass={"fc-login"} legend={"Contraseña"} type={"password"} colSize={1} />
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-1 gap-4 mx-auto mt-4'>
                                    <button type="button" onClick={() => onLogin()} className='active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01]  ease-in-out transform py-4 bg-custom-yellow rounded-xl
                                text-white font-bold text-center text-lg'>Iniciar Sesión
                                    </button>

                                </div>

                                <div className='mt-4'>
                                    <button type="button" onClick={() => setCambioClave(true)} className='font-medium text-base text-custom-yellow'>¿Olvidaste tu contraseña?</button>
                                </div>

                            </div>
                        </form>
                    </>
                )}

            </div>
            <div className="rounded-l-full hidden items-center justify-center w-1/2 lg:flex h-full" style={{ backgroundColor: '#FEA81D' }}>
                <div>
                    <Image src={'/petote.png'} width={400} height={400} alt={'petote'} />

                </div>
            </div>

            <CambioClave open={cambioClave} onClose={() => setCambioClave(false)} />
            <Toaster richColors/>
        </div>
    );

}