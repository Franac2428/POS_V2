'use client'
import { AddRemoveClassById, FormatName } from "@/app/api/utils/js-helpers";
import IniciarCaja from "@/app/components/caja/iniciarCaja";
import MultipleSelectCliente from "@/app/components/clientes/multipleSelectCliente";
import HtmlBreadCrumb from "@/app/components/HtmlHelpers/BreadCrumb";
import HtmlButton from "@/app/components/HtmlHelpers/Button";
import HtmlFormInput from "@/app/components/HtmlHelpers/FormInput";
import HtmlNewLabel from "@/app/components/HtmlHelpers/Label1";
import HtmlTableButton from "@/app/components/HtmlHelpers/TableButton";
import AgregarCLientePos from "@/app/components/pos/agregarClientePos";
import IngresarInfoEmpresa from "@/app/components/pos/agregarInfoEmpresa";
import AgregarProductoVenta from "@/app/components/pos/agregarProdVenta";
import CardProducto from "@/app/components/pos/cartaComida";
import EditarProductoVenta from "@/app/components/pos/editarProdVenta";
import LineaProducto from "@/app/components/pos/lineaDetalle"
import EliminarProdVenta from "@/app/components/pos/eliminarProdVenta";
import ModalRegistrarPago from "@/app/components/pos/modalPago";
import TicketFactura from "@/app/components/pos/ticket";
import { Calendar, Banknote, CoinsIcon, Computer, HandPlatter, Trash, User, Menu, X } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { ClipLoader } from "react-spinners";
import { useReactToPrint } from "react-to-print";
import { toast } from 'sonner';

export default function App() {
  const itemsBreadCrumb = ["Home", "Facturar"];
  const fechaActual = new Date().toLocaleDateString();
  const [modalAgregar, openModalAgregar] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [catalogoCategoria, setCatalogoCategorias] = useState([]);
  const [listadoProductos, setListadoProductos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [nombreCliente, setNombreCliente] = useState('');
  const [modalMultipleClientes, onModal_MultiplesClientes] = useState(false);
  const [listaMultiplesClientes, setListaMultiplesClientes] = useState([]);
  const [modalRegistrarPago, onModal_RegistrarPago] = useState(false);
  const [modelFactura, setModelFactura] = useState(null);
  const [modelReceptor, setModelReceptor] = useState(null);
  const [modalAgregarClientePos, onModal_AgregarClientePos] = useState(false);
  const [infoEmpresa, onSet_InfoEmpresa] = useState(null);
  const [modalPrint, onModal_Print] = useState(false);
  const [objectImpresion, onSet_ObjectImpresion] = useState(null);
  const [modalIniciarCaja, onModal_IniciarCaja] = useState(null);
  const [existeCajaAbierta, onSet_ExisteCajaAbierta] = useState(false);
  const [cajaActual, onSet_CajaActual] = useState([]);
  const [modalInfoEmpresa, onModal_InfoEmpresa] = useState(false);
  const [productoEditar, onSet_ProductoEditar] = useState();
  const [productoEliminar, onSet_ProductoEliminar] = useState();
  const [modalEditar, openModalEditar] = useState(false);
  const [modalEliminar, openModalEliminar] = useState(false);
  const [productoRetornar,onReturn_Producto] = useState(0);
  const ticketRef = useRef();
  const [itemToPrint, onSet_ItemToPrint] = useState(null);



  //Loadings
  const [loadingGeneral, onSet_loadingGeneral] = useState(false);
  const [loadingProdVenta, onSet_loadingProdVenta] = useState(false);
  const [loadingCategorias, onSet_loadingCategorias] = useState(false);
  const [loadingClientes, onSet_loadingClientes] = useState(false);
  const fetchCalled = useRef(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('productos');
  //Sesion
  const { data: session } = useSession();

  //Debe ir validando de forma cronológica (Empresa, Caja, Productos...)

  //#region [INFO. EMPRESA]
  const onSearch_InfoEmpresa = useCallback(async () => {
    try {
      const response = await fetch(`/api/empresa`);
      const result = await response.json();

      if (result.status === "success") {
        onSet_InfoEmpresa(result.data);
        onGet_CajaActual();
      } 
      else if (result.code === 204) {
        onModal_InfoEmpresa(true);
        console.log("No hay info de la empresa");
      } 
      else {
        console.log("Error al obtener la info: " + result.message);
        toast.error("Sucedió un error al obtener la información de la empresa");
      }
    } catch (error) {
      console.log("Error al obtener la info: " + error);
    }
  }, []);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      onSearch_InfoEmpresa();
      onSet_loadingGeneral(true);
    }
  }, [onSearch_InfoEmpresa]);

  //#endregion

  //#region [INICIO / CIERRE CAJA]
  const onGet_CajaActual = async () => {
    const session1 = await getSession();
    let idUsuario = Number(session1?.user.id);
    try {
      const response = await fetch(`/api/current/${idUsuario}`);
      const result = await response.json();

      if (result.status == "success") {
        onSet_CajaActual(result.data);
        onSet_ExisteCajaAbierta(true);
        onSearch_CategoriasProdVenta();
      }
      else if (result.code == 204) {
        onSet_ExisteCajaAbierta(false);
        onModal_IniciarCaja(true);
        onSet_CajaActual(null);
      }
      else {
        onSet_CajaActual(null);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al obtener la caja actual:", error);
      toast.error("Sucedió un error al obtener la caja actual");
    }
  };
  //#endregion

  //#region [PRODUCTOS VENTA]
  

  const onSearch_CategoriasProdVenta = async () => {
    onSet_loadingCategorias(true);
    var catalogo = [];
    try {
      const response = await fetch(`/api/categoriasprodventa`);
      const result = await response.json();

      if (result.status == "success") {
        const listadoCategoriasPV = [{ idCategoriaProdVenta: "", nombre: "---Todas---" }, ...result.data];
        setCategorias(listadoCategoriasPV);
        result.data.forEach((item) => {
          catalogo.push({ value: item.idCategoriaProdVenta, label: item.nombre });
        });
        setCatalogoCategorias(catalogo);
        onSearch_ProductosVenta();
      }
      else if (result.code === 204) {
        toast.warning(result.message);
        setCatalogoCategorias([])
      }
      else {
        console.log(result.message);
        toast.error(result.message);
        setCatalogoCategorias([])
      }
    }
    catch (error) {
      console.error('Error al obtener la lista de categorías:', error);
      toast.error('Sucedió un error al obtener la lista de categorías: ' + error);
      setCatalogoCategorias([])
    }
    finally {
      onSet_loadingCategorias(false);
    }
  };

  const onSearch_ProductosVenta = async () => {
    onSet_loadingProdVenta(true);
    try {
      const response = await fetch(`/api/productosventa`);
      const result = await response.json();

      if(result.status == "success"){
        setListadoProductos(result.data);
        setProductos(result.data);
        onSet_loadingGeneral(false)
      }
      else if(result.code == 204){
        toast.warning(result.message)
        setListadoProductos([]);
      }
      else{
        toast.error(result.message);
        setListadoProductos([]);
      }
    } 
    catch (error) {
      console.error('Sucedió un error al obtener los productos:', error);
      toast.error('Sucedió un error al obtener los productos: ' + error);
    } 
    finally {
      onSet_loadingProdVenta(false)
      onSet_loadingGeneral(false)
    }
  };

  const onSet_TabActivo = (id) => {
    const tabs = document.querySelectorAll('.tab-categorias');
    tabs.forEach(tab => tab.classList.remove('tab-active'));
    let item = document.getElementById("tab_" + id);
    item.classList.add("tab-active");

    if (id === "") {
      setProductos(listadoProductos);
    } else {
      const productosFiltrados = listadoProductos.filter(p => p.idCategoriaProdVenta === id);
      setProductos(productosFiltrados);
    }
  };
  //#endregion

  //#region [CLIENTES]
  const onSearch_Cliente = async (value) => {
    onSet_loadingClientes(true);
    let valueToSearch = value != "" ? value: 'Todos';
    try {
      const response = await fetch(`/api/clientes/buscar/${valueToSearch}`);
      const result = await response.json();

      //Se encontró el cliente solo 1
      if (result.status == "success" && result.data.length == 1) {
        toast.success('Se ha encontrado el cliente');
        setNombreCliente(result.data[0].nombreCompleto);
        setModelReceptor(result.data[0]);
        AddRemoveClassById("txtSelCliente", "is-valid", "is-invalid");
      }

      //Multiples registros
      if (result.status == "success" && result.data.length > 1) {
        toast.info('Se encontraron múltiples registros, seleccione el correcto');
        onModal_MultiplesClientes(true);
        setListaMultiplesClientes(result.data);
        AddRemoveClassById("txtSelCliente", "", "is-invalid");
        AddRemoveClassById("txtSelCliente", "", "is-valid");
      }

      //No existe el cliente
      if (result.data.length == 0) {
        AddRemoveClassById("txtSelCliente", "", "is-valid");
        AddRemoveClassById("txtSelCliente", "", "is-invalid");
        onModal_AgregarClientePos(true);
      }

    } catch (error) {
      console.error('Error al obtener el cliente:', error);
      toast.error('Sucedió un error al obtener el cliente: ' + error);
    }
    finally {
      onSet_loadingClientes(false);
    }
  };

  const onSelect_Enter = (event) => {
    if (event.key === 'Enter') {
      toast.info("Buscando...");
      onSearch_Cliente(nombreCliente);
    }
  };

  const onChange_Cliente = (cliente) => {
    setNombreCliente(cliente.nombreCompleto);
    setModelReceptor(cliente);
    onModal_MultiplesClientes(false);
    AddRemoveClassById("txtSelCliente", "is-valid", "is-invalid");
    toast.success("Cliente seleccionado");
  };
  //#endregion

  //#region [DETALLES FACTURA]
  const onAdd_LineaDetalle = (obj) => {
    setRows((prevRows) => {
      const existingIndex = prevRows.findIndex(
        (row) => row.idProductoVenta === obj.productoVentaId
      );
  
      if (existingIndex !== -1) {
        // Product already exists, increase quantity
        const updatedRows = [...prevRows];
        updatedRows[existingIndex] = {
          ...updatedRows[existingIndex],
          cantidad: updatedRows[existingIndex].cantidad + 1
        };
  
        // Recalculate total
        const newTotal = updatedRows.reduce(
          (acc, curr) => acc + (Number(curr.cantidad) * Number(curr.precio)), 
          0
        );
        setTotal(Number(newTotal.toFixed(2)));
  
        return updatedRows;
      } else {
        // Product doesn't exist, add new row
        const newRow = {
          id: rows.length + 1,
          cantidad: 1,
          detalles: obj.nombre,
          precio: Number(obj.precio),
          idProductoVenta: Number(obj.productoVentaId),
          cantMinima: Number(obj.cantMinima),
          cantProducto: Number(obj.cantDisponible),
          noRebajaInventario: obj.noRebajaInventario,
          imagen: obj.imagen,
        };
        
        // Add new row and update total
        setTotal(total + Number(newRow.precio * newRow.cantidad));
        return [...prevRows, newRow];
      }
    });
  };
  const onDelete_LineaDetalle = (item) => {
    const updatedRows = rows.filter((row) => row.id !== item.id);
    setRows(updatedRows);
    onReturn_Producto(item);

    const newTotal = updatedRows.reduce((acc, curr) => acc + (Number(curr.cantidad) * Number(curr.precio)), 0);
    setTotal(Number(newTotal.toFixed(2)));
  };

  const onChange_CantPrecio = (e, id, field) => {
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: e.target.value } : row
    );
    setRows(updatedRows);
    if (field === 'cantidad' || field === 'precio') {
      const newTotal = updatedRows.reduce((acc, curr) => acc + (Number(curr.cantidad) * Number(curr.precio)), 0);
      setTotal(newTotal);
    }
  };
  //#endregion

  //#region [CREAR FACTURA]
  const onCreate_ModelFactura = () => {
    var r = modelReceptor;
    var c = infoEmpresa;
    var client;

    if(r == null){
      client = {
        IdCliente:null,
        Nombre: "Cliente General",
        Telefono: "0000-0000",
        Celular: "0000-0000",
        Direccion :"No tiene"
      }
    }
    else{
      client = {
        IdCliente: r.idCliente,
        Nombre: r.nombreCompleto,
        Telefono: r.telefono !== "" ? r.telefono : "0000-0000",
        Celular: r.celular !== "" ? r.celular : "0000-0000",
        Direccion: r.direccion
      }
    }
    

    var objetoFactura = {
      FechaEmision: new Date(),
      Emisor: {
        Nombre: c.nombre,
        NombreComercial: c.nombreComercial,
        Identificacion: c.identificacion,
        Telefono: c.telefono,
        Celular: c.celular,
        Correo: c.correo,
        DireccionExacta: c.direccion
      },
      Receptor: client
    };

    var listaDetalles = rows.map(row => ({
      NumeroLinea: row.id,
      Cantidad: row.cantidad,
      Descripcion: row.detalles,
      Precio: row.precio,
      IdProductoVenta: row.idProductoVenta,
      NoRebajaInventario: row.noRebajaInventario
    }));

    objetoFactura.Detalles = listaDetalles;
    objetoFactura.Observaciones = "";
    objetoFactura.Total = total;
    objetoFactura.NumeroCaja = cajaActual.idInfoCaja;
    objetoFactura.IdUsuarioCreacion = Number(session?.user.id)

    setModelFactura(objetoFactura);
  };

  const onClear_Factura = (json) => {
    onSearch_ProductosVenta();
    setRows([]);
    setTotal(0);
    setNombreCliente("");
    setModelReceptor(null);
    AddRemoveClassById("txtSelCliente", "", "is-valid");
    AddRemoveClassById("txtSelCliente", "", "is-invalid");
    onSet_ItemToPrint(json);
    if (infoEmpresa.logo && infoEmpresa.tipoImagen){
      const bufferImagen = Buffer.from(infoEmpresa.logo);
      const imgBase64 = bufferImagen.toString('base64');
      const imgSrc = `data:${infoEmpresa.tipoImagen};base64,${imgBase64}`;
      json.LogoSource = imgSrc;
    }
    else{
      json.LogoSource = "/petote.png";
    }


    handlePrintClick(json);
  };

  const handlePrintClick = (item) => {
    onSet_ItemToPrint(item);
    setTimeout(() => {
      handlePrint();
    }, 0);
  };

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: "Factura",
  });
  //#endregion

  //#region [ON_INIT]
  useEffect(() => {
    const tabTodas = document.getElementById("tab_");
    if (tabTodas) {
      tabTodas.classList.add("tab-active");
      setProductos(listadoProductos);
      setLoading(false);
    }
  }, [categorias, listadoProductos]);

  //#endregion


  //#region [EDITAR PROD. VENTA]
  const onEditarProducto = (producto) => {
    onSet_ProductoEditar(producto);
    openModalEditar(true);
  };

  const onEliminarProducto = (producto) => {
    onSet_ProductoEliminar(producto);
    openModalEliminar(true);
  };
  //#endregion

  return (
    <div className="flex flex-col md:flex-col h-screen">
  {activeView !== 'factura' && (

  <div className=" max-[1022px]:fixed max-[1022px]:bottom-4 max-[1022px]:left-4 max-[1022px]:right-4 max-[1022px]:bg-white max-[1022px]:text-black-600 max-[1022px]:rounded-full max-[1022px]:flex max-[1022px]:items-center max-[1022px]:justify-between max-[1022px]:p-4 max-[1022px]:shadow-lg border-blue-500 border-4 hidden z-10">
  <div className="flex items-center pl-6 gap-4">
    <span className="text-sm font-semibold">Total: ₡{total.toFixed(2)}</span>
    <span className="text-sm font-semibold">Productos: {rows.length}</span>
  </div>
  <HtmlButton
                  colSize={1}
                  color={"blue"}
                  legend={"Orden"}
                  icon={Banknote}
                  onClick={() => setActiveView(activeView === 'factura' ? 'productos' : 'factura')}
                  />
    </div>
    )}
    <div className="w-full p-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="pl-2 inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <HtmlBreadCrumb items={["Home", "Facturar"]} />
          </ol>
        </nav>
      </div>
    <div className="flex flex-col md:flex-row h-screen">

    {/* Products Section */}
    <div
      className={`
        w-full min-[1022px]:w-5/6 
        ${activeView === 'productos' ? 'block' : 'hidden lg:block'}
      `}
    >
      {loadingCategorias ? (
        <div className="flex items-center justify-center m-4">
          <ClipLoader size={30} speedMultiplier={1.5} />
        </div>
      ) : (
        <div className="w-full min-[1022px]:pl-4 min-[1022px]:pr-4">
          <div className="block w-full p-2 bg-white border border-gray-200 rounded-lg shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto">
              {existeCajaAbierta && (
                <HtmlButton
                  colSize={1}
                  color={"indigo"}
                  legend={"Agregar Producto"}
                  icon={HandPlatter}
                  onClick={() => openModalAgregar(true)}
                />
              )}
            </div>

            <div className="flex flex-col w-full h-full ">
              {existeCajaAbierta ? (
                <div className="px-2 pt-2 pb-10">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                      {categorias.map((item, index) => (
                        <li className="me-3" key={index}>
                          <a
                            href="#"
                            id={`tab_${item.idCategoriaProdVenta}`}
                            onClick={() => onSet_TabActivo(item.idCategoriaProdVenta)}
                            className="tab-categorias inline-block p-4 hover:text-blue-600 rounded-t-lg dark:hover:text-blue-600"
                          >
                            {item.nombre}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {loadingProdVenta ? (
                    <div className="flex items-center justify-center m-4">
                      <ClipLoader size={30} speedMultiplier={1.5} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {productos.map((item, index) => {
                        var bufferImagen;
                        var imgBase64;
                        var imgSrc;
                        var typeImg;

                        if (item.imagen && item.tipoImagen) {
                          bufferImagen = Buffer.from(item.imagen.data);
                          imgBase64 = bufferImagen.toString('base64');
                          imgSrc = `data:${item.tipoImagen};base64,${imgBase64}`;
                          typeImg = item.tipoImagen;
                        } else {
                          imgSrc = "/petote.png";
                          typeImg = "default";
                        }

                        const modelForCard = {
                          productoVentaId: item.idProductoVenta,
                          nombre: item.nombre,
                          precio: item.precio,
                          cantDisponible: item.cantidad,
                          cantMinima: item.cantidadMinima,
                          imagen: imgSrc,
                          tipoImagen: typeImg,
                          idCategoriaProdVenta: item.idCategoriaProdVenta,
                          noRebajaInventario: item.noRebajaInventario
                        };

                        return (
                          <CardProducto
                            key={item.idProductoVenta}
                            producto={modelForCard}
                            reloadTable={onSearch_ProductosVenta}
                            agregarProductoTabla={onAdd_LineaDetalle}
                            categorias={catalogoCategoria}
                            onSelectProductEdit={onEditarProducto}
                            onSelectProductDelete={onEliminarProducto}
                            productoEliminado={productoRetornar}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
    
      {/* Card Factura */}
      <aside
  className={`
    w-full min-[1022px]:w-1/3 
    ${activeView === 'factura' ? 'block' : 'hidden min-[1022px]:block'}
    px-2 z-90

  `}
>
  {existeCajaAbierta ? (
    loadingGeneral ? (
      <div className="flex items-center justify-center m-5">
        <ClipLoader size={30} speedMultiplier={1.5} />
      </div>
    ) : (
                <>
                      <div className="block w-full h-screen p-4 bg-white border border-gray-200 rounded-lg shadow overflow-hidden">

                        {/* Legends info */}
                        <div className="mb-3 grid grid-cols-1 md:grid-cols-1 gap-4 mx-auto">
                          <HtmlNewLabel icon={User} legend={"Vendedor: " + session?.user.name} color={"lime"} />
                        </div>

                        <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
                          <HtmlNewLabel icon={Calendar} legend={fechaActual} color={"blue"} />
                          <HtmlNewLabel icon={Computer} legend={"Caja No: " + cajaActual.idInfoCaja} color={"green"} />

                        </div>
                        {/* Legends info */}

                        {/* Client Filter */}
                        {
                          loadingClientes ? (
                            <div className="flex items-center justify-center m-4">
                              <ClipLoader size={30} speedMultiplier={1.5} />
                            </div>
                          ) :
                            (
                              <HtmlFormInput additionalClass={"text-xs"} tooltip={"Ingresa un valor y presiona enter para buscar"} value={nombreCliente} id={"txtSelCliente"} legend={"Nombre del cliente"} onChange={(e) => setNombreCliente(e.target.value)} onKeyUp={onSelect_Enter} />
                            )
                        }

            {/* Linea detalle */}
            <div className="">
              <div className="flex flex-col">
                {rows.map((row) => (
                  <LineaProducto
                    key={row.id}
                    id={row.id}
                    quantity={row.cantidad}
                    details={row.detalles}
                    price={row.precio}
                    idProductoVenta={row.idProductoVenta}
                    cantMinima={row.cantMinima}
                    cantProducto={row.cantProducto}
                    onDelete={onDelete_LineaDetalle}
                    onChange={onChange_CantPrecio}
                    image={row.imagen}
                  />
                ))}
              </div>

              {total > 0 && (
                <div className="px-2 pt-2">
                  <div className="flex justify-between dark:text-gray-100">
                    <h3 className="font-semibold text-lg">Total Factura:</h3>
                    <p className="font-semibold text-lg"><span>₡</span> {total.toFixed(2)}</p>
                  </div>
                </div>
              )} 
            

</div>
                        <div className="pl-4 pr-4 grid grid-rows-12">
                          {total > 0 && (

                            <div className="row-span-4 flex items-center ">
                              <HtmlButton color={"green"} legend={"Pagar"} icon={CoinsIcon} onClick={() => {
                                onModal_RegistrarPago(true); onCreate_ModelFactura(); onModal_Print(false);
                              }} />
                            </div>
                          )}
                        </div>
                        {activeView !== 'productos' && (

                        <div className=" flex flex-col px-2 pt-2 items-end">
                            <button
                            className="mb-4 p-2 bg-gray-200 rounded-md shadow hover:bg-gray-300"
                            onClick={() => setActiveView('productos')}
                            >
                            Volver a Productos
                            </button>
                            </div>
                             )}
                      </div>
                      
                </>
             )
           ) : null}
         </aside>
      
         </div>
      <AgregarProductoVenta listadoCategorias={catalogoCategoria} open={modalAgregar} onClose={() => openModalAgregar(false)} reloadProducts={onSearch_ProductosVenta} />
      <MultipleSelectCliente open={modalMultipleClientes} onClose={() => onModal_MultiplesClientes(false)} listaClientes={listaMultiplesClientes} handleClienteInput={onChange_Cliente} />
      <ModalRegistrarPago open={modalRegistrarPago} onClose={() => onModal_RegistrarPago(false)} objFactura={modelFactura} onReload={onClear_Factura} />
      <AgregarCLientePos open={modalAgregarClientePos} onClose={() => onModal_AgregarClientePos(false)} />
      <IniciarCaja open={modalIniciarCaja} onClose={() => { onModal_IniciarCaja(false) }} />
      <IngresarInfoEmpresa open={modalInfoEmpresa} onClose={() => { onModal_InfoEmpresa(false) }} />
      <EditarProductoVenta categorias={catalogoCategoria} onClose={() => openModalEditar(false)} open={modalEditar} reloadProducts={onSearch_ProductosVenta} productoVenta={productoEditar}/> 
      <EliminarProdVenta productoVenta={productoEliminar} open={modalEliminar} onClose={() => openModalEliminar(false)} reloadTable={onSearch_ProductosVenta} />
      
      {itemToPrint && (
        <div style={{ display: "none" }}>
          <TicketFactura ref={ticketRef} item={itemToPrint} />
        </div>
      )}
    
    </div>

  );

  //#endregion

}
