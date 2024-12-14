import * as React from "react"

export const ResetPasswordEmailTemplate = ({ correo, resetPasswordToken }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const resetLink = `${baseUrl}/auth/reset?token=${resetPasswordToken}`;

    return (
        <div>
            <h1>
                Reiniciar la contraseña para: <b>{correo}</b>
            </h1>
            <p>
                Para reiniciar su contraseña, haga clic en este link y siga las instrucciones:
            </p>
            <a href={resetLink}>
                Clic aquí para reasignar la contraseña
            </a>
        </div>
    );
}
