import bcrypt from "bcrypt";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

var scopeIdAuditoria = 0;
var diasLaboralesEmpleado = null;

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
        user: { label: "User", type: "text" },
        loginByEmail: { label: "LoginByEmail", type: "text" },
      },
      async authorize(credentials) {
        // Registro inicial de auditoría
        scopeIdAuditoria = await auditRegister(
          credentials.loginByEmail ? credentials.email : credentials.user,
          credentials.password,
          1,
          "Ingresa las credenciales."
        );

        // Buscar usuario por correo o nombre de usuario
        const userFound = await prisma.usuarios.findFirst({
          where: {
            OR: [{ correo: credentials.email }, { usuario: credentials.user }],
          },
          include: {
            Rol: {
              select: {
                idRol: true,
                nombre: true,
                descripcion: true,
                Permisos: {
                  select: {
                    permiso: {
                      select: {
                        idPermiso: true,
                        idPermisoPadre: true,
                        nombre: true,
                        url: true,
                        icono: true,
                        jerarquia: true,
                        opcEmpleado: true,
                        ocultar: true,
                      },
                    },
                  },
                },
              },
            },
            
          },
        });

        if(userFound.esEmpleado){
          const horarios = await prisma.horario.findMany({
            select: {
              dia: true,
              inicio: true,
              fin: true,
              esDiaLibre: true,
            },
            where: {
              usuarioId:userFound.idUsuario,
            },
          });

          if(horarios){
            diasLaboralesEmpleado = horarios;
          }
          else{
            diasLaboralesEmpleado = [];
          }
          
        }

        if (!userFound) {
          await auditUpdate(scopeIdAuditoria, 4, "Usuario no existe en el sistema",credentials.password);
          throw new Error(
            JSON.stringify({
              message: "No existe ningún usuario registrado con las credenciales indicadas. Intente de nuevo",
              ok: false,
            })
          );
        }

        // Verificar si el usuario está bloqueado
        if (userFound.intentos == 0 || userFound.bloqueado) {
          await auditUpdate(scopeIdAuditoria, 2, "Usuario está bloqueado: " + userFound.mensajeBloqueo,credentials.password);
          throw new Error(
            JSON.stringify({
              message: "Usuario se encuentra bloqueado",
              ok: false,
            })
          );
        }

        // Comparar contraseña
        const matchPassword = await bcrypt.compare(credentials.password, userFound.clave);
        if (!matchPassword) {
          // Restar intentos y bloquear si es necesario
          const intentosRestantes = await actualizarIntentosUsuario(userFound, false);
          const message = intentosRestantes.intentos === 0
            ? "Usuario bloqueado por intentos fallidos de acceso."
            : `Contraseña incorrecta. Intentos restantes: ${intentosRestantes.intentos}`;

          await auditUpdate(
            scopeIdAuditoria,
            2,
            message,
            credentials.password
          );

          throw new Error(
            JSON.stringify({
              message,
              ok: false,
            })
          );
        }

        // Ingreso correcto, restaurar intentos
        await auditUpdate(scopeIdAuditoria, 3, "Ingreso satisfactorio del usuario","");
        await actualizarIntentosUsuario(userFound, true);

        // Retornar usuario con permisos
        var arrayPermisos = userFound.Rol.Permisos
          .filter(p => !p.permiso.ocultar) // Filtra los permisos donde `ocultar` es `false`
          .map((p) => ({
            idPermiso: p.permiso.idPermiso,
            idPermisoPadre: p.permiso.idPermisoPadre,
            nombre: p.permiso.nombre,
            url: p.permiso.url,
            icono: p.permiso.icono,
            jerarquia: p.permiso.jerarquia,
            opcEmpleado: p.permiso.opcEmpleado,
          }));

        if(!userFound.esEmpleado){
          arrayPermisos = arrayPermisos.filter((p) => !p.opcEmpleado);
        }

        return {
          id: userFound.idUsuario,
          name: userFound.nombre,
          email: userFound.correo,
          rol: {
            ...userFound.Rol,
            permisos: arrayPermisos,
          },
          esEmpleado:userFound.esEmpleado,
          diasLaborales:diasLaboralesEmpleado
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.rol = user.rol;
        token.esEmpleado = user.esEmpleado;
        token.diasLaborales = user.diasLaborales;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.rol = token.rol;
      session.user.esEmpleado = token.esEmpleado;
      session.user.diasLaborales = token.diasLaborales;
      return session;
    },
  },
};

// Función para registrar auditoría
async function auditRegister(usuario, clave, idStatus, mensaje) {
  try {
    const newAudit = await prisma.auditoriaLogin.create({
      data: {
        Usuario: usuario,
        Clave: clave,
        IdStatusAuditoriaLogin: idStatus,
        FechaEstadoActualizado: null,
        Mensaje: mensaje,
      },
    });
    return parseInt(newAudit.IdAuditoriaLogin);
  } catch (error) {
    console.error("Error insertando la auditoría: " + error);
  }
}

// Función para actualizar auditoría
async function auditUpdate(idAudit, idStatus, mensaje,clave) {
  try {
    const dataToUpdate = {
      IdStatusAuditoriaLogin: idStatus,
      FechaEstadoActualizado: new Date(),
      Mensaje: mensaje,
    };

    if (idStatus === 3) {
      dataToUpdate.Clave = "";
    }
    else{
        dataToUpdate.Clave = clave
    }

    await prisma.auditoriaLogin.update({
      where: {
        IdAuditoriaLogin: idAudit,
      },
      data: dataToUpdate,
    });
  } catch (error) {
    console.error("Error actualizando la auditoría: " + error);
  }
}

// Función para actualizar intentos de usuario
async function actualizarIntentosUsuario(usuario, ingresoCorrecto) {
  const intentosRestantes = ingresoCorrecto ? 3 : usuario.intentos - 1;
  return prisma.usuarios.update({
    where: { idUsuario: usuario.idUsuario },
    data: {
      intentos: intentosRestantes,
      mensajeBloqueo: intentosRestantes === 0 ? "Bloqueo por intentos fallidos de acceso." : null,
    },
  });
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
