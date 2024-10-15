//CLASE DE HELPERS PARA JS

import { NextResponse } from "next/server";

export function AddRemoveClassById(id, addClass = "", removeClass = "") {
    const element = document.getElementById(id);

    if (element) {
        if (removeClass != "") {
            element.classList.remove(removeClass);
        }
        if (addClass != "") {
            element.classList.add(addClass);
        }
    }
}




export function AddRemoveClassByClass(className, addClass = "", removeClass = "") {
    const elements = document.getElementsByClassName(className);

    for (const element of elements) {
        if (removeClass) {
            element.classList.remove(removeClass);
        }
        if (addClass) {
            element.classList.add(addClass);
        }
    }
}


export function GetValueById(id) {
    return document.getElementById(id).value
}

export function GetValueByClass(className) {
    return document.getElementsByClassName(className).value
}

export function FormatName(nombre, apellidos) {
    return nombre + " " + apellidos;
}

export function GetHtmlValueById(id) {
    const selectElement = document.getElementById(id);
    if (selectElement) {
        const selectedText = selectElement.options[selectElement.selectedIndex].text;
        return selectedText;
    }
}

export function FormatDate(fechaISO) {
    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

export function FormatDate12Hours(fechaISO) {
    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    // Convertir horas a formato 12 horas
    let horas = fecha.getHours();
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    
    horas = horas % 12;
    horas = horas ? horas : 12; // Si la hora es 0, ajustarla a 12

    const horasFormateadas = String(horas).padStart(2, '0');

    return `${horasFormateadas}:${minutos} ${ampm} ${dia}/${mes}/${anio}`;
}


export function FormatOnlyDate(fechaISO) {
    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

export function SetValueById(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
    else {
        console.warn(`No se encontró el elemento con id: ${id}`);
    }
}

export function SetClassById(id, className) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add(className);
    } else {
        console.warn(`Elemento con ID "${id}" no encontrado.`);
    }
}

export function RemoveClassById(id, classNames) {
    const element = document.getElementById(id);
    if (element) {
        classNames.forEach(className => {
            element.classList.remove(className);
        });
    } else {
        console.warn(`Elemento con ID "${id}" no encontrado.`);
    }
}

export function SetRemoveClassById(id, add, remove) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add(add);
        element.classList.remove(remove)
    } else {
        console.warn(`Elemento con ID "${id}" no encontrado.`);
    }
}


export function ValidateFormByClass(className = "") {

    let isValid = true;
    const elements = document.getElementsByClassName(className);

    Array.from(elements).forEach((item) => {
        item.classList.remove('is-warning');
        item.classList.remove('is-invalid');
        item.classList.remove('is-valid');

        if (item.value.trim() == '') {
            item.classList.add('is-invalid');
            item.classList.remove('is-valid');
            isValid = false;
        }
        else {
            item.classList.add('is-valid');
            item.classList.remove('is-invalid');
        }
    });
    return isValid;
}

export function ValidateEmailStructure(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

export function ValidatePassword(clave) {
    const mensajes = [];

    // Verificar si la clave tiene al menos 6 y máximo 15 caracteres
    if (clave.length < 6 || clave.length > 15) {
        mensajes.push("La clave debe tener entre 6 y 15 caracteres.");
    }

    // Verificar si contiene al menos una letra minúscula
    if (!/[a-z]/.test(clave)) {
        mensajes.push("La clave debe contener al menos una letra minúscula.");
    }

    // Verificar si contiene al menos una letra mayúscula
    if (!/[A-Z]/.test(clave)) {
        mensajes.push("La clave debe contener al menos una letra mayúscula.");
    }

    // Verificar si contiene al menos un número
    if (!/\d/.test(clave)) {
        mensajes.push("La clave debe contener al menos un número.");
    }

    // // Verificar si contiene al menos un símbolo
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(clave)) {
    //     mensajes.push("La clave debe contener al menos un símbolo.");
    // }

    return mensajes.length > 0 ? mensajes : [];
}


export function ValidatePasswordMatch(clave, confirmacion) {
    if (clave === confirmacion) {
        return true;
    } else {
        return false;
    }
}

export function RemoveClassesAndAdd(id, add) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove("is-invalid");
        element.classList.remove("is-warning");

        element.classList.add(add);
    } else {
        console.warn(`Elemento con ID "${id}" no encontrado.`);
    }
}

export function RemoveValidationClasses(className){

    const elements = document.getElementsByClassName(className);

    Array.from(elements).forEach((item) => {
        item.classList.remove('is-warning');
        item.classList.remove('is-invalid');
        item.classList.remove('is-valid');

    });
}

export function getDateCR() {
    const now = new Date();
    
    const options = {
      timeZone: 'America/Costa_Rica',
      hour12: false, 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
  
    const costaRicaTime = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
  
    // Formatear la fecha en ISO 8601
    const year = costaRicaTime.find(part => part.type === 'year').value;
    const month = costaRicaTime.find(part => part.type === 'month').value;
    const day = costaRicaTime.find(part => part.type === 'day').value;
    const hour = costaRicaTime.find(part => part.type === 'hour').value;
    const minute = costaRicaTime.find(part => part.type === 'minute').value;
    const second = costaRicaTime.find(part => part.type === 'second').value;
  
    return new Date();
  }
  
  