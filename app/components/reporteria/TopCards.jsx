import React, { useState, useEffect } from 'react';
import { CirclePlus, Users, BadgeCent } from "lucide-react";

const TopCards = () => {
    const [data, setData] = useState({
        productosInventario: 0,
        totalClientes: 0,
        ventasTotales: 0,
        ventasMensuales: 0,
    });

    const [previousData, setPreviousData] = useState({
        productosInventario: 0,
        totalClientes: 0,
        ventasTotales: 0,
        ventasMensuales: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
          const res = await fetch('/api/reportes/cards');
          const result = await res.json();
          setData(result.topCardsData);
        };
      
        fetchData();
    
        const intervalId = setInterval(fetchData, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
      }, []);

    useEffect(() => {
        setPreviousData(data);
    }, [data]);

    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const productosInventarioChange = calculatePercentageChange(data.productosInventario, previousData.productosInventario);
    const totalClientesChange = calculatePercentageChange(data.totalClientes, previousData.totalClientes);
    const ventasTotalesChange = calculatePercentageChange(data.ventasTotales, previousData.ventasTotales);
    const ventasMensualesChange = calculatePercentageChange(data.ventasMensuales, previousData.ventasMensuales);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <CirclePlus size={24} strokeWidth={2} />
                <p className="text-3xl font-semibold text-gray-800">{data.productosInventario}</p>
                <p className="text-sm text-gray-600">Prod. para la venta (Comidas)</p>
                <div className="flex items-center mt-4">
                    <span className={`font-semibold mr-2 ${productosInventarioChange >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        {productosInventarioChange.toFixed(2)}%
                    </span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <Users size={24} strokeWidth={2} />
                <p className="text-3xl font-semibold text-gray-800">{data.totalClientes}</p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <div className="flex items-center mt-4">
                    <span className={`font-semibold mr-2 ${totalClientesChange >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        {totalClientesChange.toFixed(2)}%
                    </span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <BadgeCent size={24} strokeWidth={2} />
                <p className="text-3xl font-semibold text-gray-800">{data.ventasTotales}</p>
                <p className="text-sm text-gray-600">Ventas Totales</p>
                <div className="flex items-center mt-4">
                    <span className={`font-semibold mr-2 ${ventasTotalesChange >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        {ventasTotalesChange.toFixed(2)}%
                    </span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <BadgeCent size={24} strokeWidth={2} />
                <p className="text-3xl font-semibold text-gray-800">{data.ventasMensuales}</p>
                <p className="text-sm text-gray-600">Ventas x Mes</p>
                <div className="flex items-center mt-4">
                    <span className={`font-semibold mr-2 ${ventasMensualesChange >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        {ventasMensualesChange.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TopCards;