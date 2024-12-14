import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()

//Listar asistencias
export async function GET() {
  try {
    const listaAsistencia = await prisma.asistencia.findMany({
      include:{
        Empleado:true
      },
      where:{
        fechaHoraSalida:null
      }
    });

    if (listaAsistencia.length == 0) {
      return NextResponse.json({
        code: 204,
        status: "failed",
        message: "No se encontraron registros."
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: listaAsistencia,
      message: ""
    }, { status: 200 });
    
  } 
  catch (error) {
    console.error('Error al listar las asistencias:', error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al listar las asistencias: " + error.message
    });
  }
}

//Marcar ASISTENCIA
export async function POST(request) {

  try {
    const data = await request.json();
    const { idUsuarioEmpleado, fechaHoraEntrada,fechaCreacion } = data;

    //Validamos que exista o no una asistencia marcada a esa fecha
    const existeAsistencia = await prisma.asistencia.findFirst({
      where: {
        idUsuarioEmpleado: idUsuarioEmpleado,
        fechaCreacion: fechaCreacion
      },
    });

    if (existeAsistencia) {
      return NextResponse.json({
        code: 400,
        status: "failed",
        message: "Ya existe una asistencia registrada para el mismo usuario y en la misma fecha"
      });
    }

    const nuevaAsistencia = await prisma.asistencia.create({
      data: {
        idUsuarioEmpleado: idUsuarioEmpleado,
        fechaCreacion: fechaCreacion,
        fechaHoraEntrada: fechaHoraEntrada
      }
    })


    if (!nuevaAsistencia) {
      return NextResponse.json({
        code: 400,
        status: "failed",
        message: "Ya existe una asistencia registrada con la fecha indicada"
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      data: true,
      message: "Asistencia registrada correctamente"
    });

  }
  catch (error) {
    console.error('Error al ingresar la asistencia:', error);
    return NextResponse.json({
      code: 500,
      status: "error",
      message: "Error al ingresar la asistencia: " + error.message
    });
  }
}

//Marcar ASISTENCIA
export async function PUT(request) {
  try {
    const data = await request.json();
    const { idUsuarioEmpleado, idAsistencia, fechaHoraSalida } = data;

    // Validate input data
    if (!idUsuarioEmpleado || !idAsistencia || !fechaHoraSalida) {
      return NextResponse.json({
        code: 400,
        status: "failed",
        message: "Datos incompletos. Por favor, proporcione todos los campos requeridos."
      }, { status: 400 });
    }

    // Use a transaction for atomic update
    const result = await prisma.$transaction(async (prisma) => {
      // Check if attendance exists and is not already marked for exit
      const existingAttendance = await prisma.asistencia.findFirst({
        where: {
          idAsistencia,
          idUsuarioEmpleado,
          fechaHoraSalida: null
        }
      });

      if (!existingAttendance) {
        throw new Error("No existe una asistencia válida para marcar salida");
      }

      // Update attendance with exit time
      return prisma.asistencia.update({
        where: {
          idAsistencia,
          idUsuarioEmpleado
        },
        data: {
          fechaHoraSalida
        }
      });
    });

    return NextResponse.json({
      code: 200,
      status: "success",
      data: result,
      message: "Salida registrada correctamente"
    }, { status: 200 });

  } catch (error) {
    console.error('Error al marcar la salida:', error);

    return NextResponse.json({
      code: 500,
      status: "error",
      message: `Error al marcar la salida: ${error.message}`
    }, { status: 500 });
  }
}

