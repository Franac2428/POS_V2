import React, { useState } from 'react';
import classNames from 'classnames';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Tabs from '@radix-ui/react-tabs';
import Historial from './historial';
import Progreso from './progreso';
import Realizar from './realizar';
import { mutate } from 'swr';

const TabsDemo = () => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productos, setProductos] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [tipoRadio, setTipoRadio] = useState('correo');
  const [nuevoPedido, setNuevoPedido] = useState({});
  const [pedidos, setPedidos] = useState([]);

  const handleRadioChange = (event) => {
    setTipoRadio(event.target.value);
  };
  const handleNombreChange = (event) => {
    setNombre(event.target.value);
  };
  const handleCantidadChange = (event) => {
    setCantidad(event.target.value);
  };

  const agregarProducto = () => {
    if (nombre.trim() !== '' && cantidad.trim() !== '') {
      setProductos([...productos, { nombre: nombre, cantidad: cantidad }]);
      setNombre('');
      setCantidad('');
    } else {
      alert('Por favor, ingrese un nombre y una cantidad válidos.');
    }
  };

  const agregarPedido = async () => {
    try {
      const nuevoPedidoData = {
        proveedor: nombre,
        cantidad: cantidad,
        descripcion: descripcion,
        tipo: tipoRadio,
        productos: productos,
      };

      const response = await fetch('/api/pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoPedidoData),
      });

      if (!response.ok) {
        throw new Error('Error al agregar el pedido');
      }

      const pedidoAgregado = await response.json();
      // Actualiza los pedidos con el nuevo pedido agregado
      setPedidos([...pedidos, pedidoAgregado]);

      // Usar mutate para actualizar la vista en tiempo real sin hacer una nueva solicitud
      mutate('/api/pedido', [...pedidos, pedidoAgregado], false);

      // Limpiar campos después de agregar el pedido
      setNombre('');
      setCantidad('');
      setDescripcion('');
      setProductos([]);
    } catch (error) {
      console.error('Error al agregar el pedido:', error);
    }
  };

  const limpiarCampos = () => {
    setNombre('');
    setCantidad('');
    setDescripcion('');
    setProductos([]);
  };

  // Funciones para los componentes de Accordion
  const AccordionItem = React.forwardRef(function AccordionItem(props, forwardedRef) {
    return (
      <Accordion.Item
        className={classNames(
          'focus-within:shadow-mauve12 mt-px font-semibold overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]',
          props.className
        )}
        {...props}
        ref={forwardedRef}
      >
        {props.children}
      </Accordion.Item>
    );
  });
  AccordionItem.displayName = 'AccordionItem';

  const AccordionTrigger = React.forwardRef(function AccordionTrigger(props, forwardedRef) {
    return (
      <Accordion.Header className="flex">
        <Accordion.Trigger
          className={classNames(
            'text-gray-900 shadow-mauve6 hover:bg-mauve2 group flex h-[45px] flex-1 cursor-default items-center justify-between bg-white px-5 text-lg leading-none shadow-[0_1px_0] outline-none',
            props.className
          )}
          {...props}
          ref={forwardedRef}
        >
          {props.children}
          <ChevronDownIcon
            className="text-gray-900 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </Accordion.Trigger>
      </Accordion.Header>
    );
  });
  AccordionTrigger.displayName = 'AccordionTrigger';

  const AccordionContent = React.forwardRef(function AccordionContent(props, forwardedRef) {
    return (
      <Accordion.Content
        className={classNames(
          'text-mauve11 dark:bg-gray-800  bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]',
          props.className
        )}
        {...props}
        ref={forwardedRef}
      >
        <div className="py-[15px] px-5">{props.children}</div>
      </Accordion.Content>
    );
  });
  AccordionContent.displayName = 'AccordionContent';

  return (
    <>
      <Tabs.Root className="flex flex-col" defaultValue="tab1">
        <Tabs.List className="shrink-0 flex border-b border-mauve6" aria-label="Manejo de pedidos">
          <Tabs.Trigger
            className="bg-white px-5 h-[45px] flex-1 flex items-center font-semibold justify-center text-xl leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-custom-yellow data-[state=active]:text-custom-yellow"
            value="tab1"
          >
            Realizar Pedido
          </Tabs.Trigger>
          <Tabs.Trigger
            className="bg-white px-5 h-[45px] flex-1 flex items-center font-semibold justify-center text-xl leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-custom-yellow data-[state=active]:text-custom-yellow"
            value="tab2"
          >
            Historial
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">
          <fieldset className="mb-[15px] w-full flex flex-col justify-start">
            <Accordion.Root
              className="bg-mauve6 w-full rounded-md shadow-[0_2px_10px] shadow-black/5"
              type="single"
              defaultValue="item-1"
              collapsible
            >
              <Progreso AccordionItem={AccordionItem} AccordionTrigger={AccordionTrigger} AccordionContent={AccordionContent} />
              <Realizar 
                AccordionItem={AccordionItem} 
                AccordionTrigger={AccordionTrigger} 
                AccordionContent={AccordionContent} 
                agregarPedido={agregarPedido} 
              />
            </Accordion.Root>
          </fieldset>
        </Tabs.Content>
        <Tabs.Content value="tab2">
          <Historial pedidos={pedidos} />
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
};

export default TabsDemo;
