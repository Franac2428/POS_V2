//Archivo de queries de pruebas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function main() {
    try {
        
        const horarios = await prisma.horario.findMany({
          select: {
            dia: true,
            inicio: true,
            fin: true,
            esDiaLibre: true,
          },
          where: {
            usuarioId: 2,
          },
        });

        console.log("Lista:: " + JSON.stringify(horarios))

    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}

main();
