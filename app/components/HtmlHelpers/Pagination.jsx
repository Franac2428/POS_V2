import { useState } from "react";

const TablePagination = ({
    registrosPorPagina = 5,
    listado,
    paginaActual,
    onSet_PaginaActual
}) => {
    // Calcular el número total de páginas
    const totalPaginas = Math.max(1, Math.ceil(listado.length / registrosPorPagina));

    // Limitar el rango de botones de paginación que se muestran
    const pageRange = 5; // Número de botones a mostrar
    const startPage = Math.max(1, paginaActual - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPaginas, startPage + pageRange - 1);

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPaginas) {
            onSet_PaginaActual(pageNumber);
        }
    };

    return (
        <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
            <ul className="inline-flex -space-x-px text-sm h-8">
                {/* Botón "Anterior" */}
                <li>
                    <button
                        onClick={() => handlePageChange(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className={`flex items-center justify-center px-3 h-8 ${paginaActual === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        aria-label="Página anterior"
                    >
                        Anterior
                    </button>
                </li>

                {/* Botones de las páginas */}
                {pages.map((number) => (
                    <li key={number}>
                        <button
                            onClick={() => handlePageChange(number)}
                            className={`flex items-center justify-center px-3 h-8 ${paginaActual === number ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            aria-label={`Página ${number}`}
                        >
                            {number}
                        </button>
                    </li>
                ))}

                {/* Botón "Siguiente" */}
                <li>
                    <button
                        onClick={() => handlePageChange(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className={`flex items-center justify-center px-3 h-8 ${paginaActual === totalPaginas ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        aria-label="Página siguiente"
                    >
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default TablePagination;
