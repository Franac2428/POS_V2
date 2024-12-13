"use client"
import * as icon from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { createContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function Sidebar({ pageTitle = "Punto de Venta" }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
        setIsMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (status === "unauthenticated") return <div>No autorizado</div>;

  const permisos = session?.user?.rol.permisos || [];

  const iconMap = {
    'Dashboard': <icon.Gauge size={20} />,
    'Info. Caja': <icon.Computer size={20} />,
    'Facturar': <icon.CircleDollarSign size={20} />,
    'Facturas': <icon.ScrollText size={20} />,
    'Adm. Inventario': <icon.Warehouse size={20} />,
    'Proveedores': <icon.Truck size={20} />,
    'Categorías': <icon.BadgeCent size={20} />,
    'Reportes': <icon.FileLineChart size={20} />,
    'Empleados': <icon.BriefcaseBusiness size={20} />,
    'Metas': <icon.Goal size={20} />,
    'Adm. Clientes': <icon.BookUser size={20} />,
    'Seguridad': <icon.LockKeyhole size={20} />,
    'Pedidos': <icon.Truck size={20} />,
    'Horarios': <icon.AlarmClock size={20} />,
    'Entrada / Salida': <icon.Flag size={20} />,
  };

  const sidebarItems = permisos
    .filter(permiso => permiso.jerarquia === 1)
    .map(permiso => {
      const subItems = permisos
        .filter(subPermiso =>
          subPermiso.jerarquia === 2 && subPermiso.idPermisoPadre === permiso.idPermiso
        )
        .map(subPermiso => ({
          text: subPermiso.nombre,
          link: subPermiso.url,
        }));

      return {
        icon: iconMap[permiso.nombre] || <icon.MoreVertical size={20} />,
        text: permiso.nombre,
        link: permiso.url,
        subItems: subItems.length > 0 ? subItems : null,
      };
    });

  // Mobile Header with Hamburger Menu
  const MobileSiteHeader = () => (
    <div className="min-[1024px]:hidden fixed top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-white shadow-sm">
      <h1 className="text-xl font-bold flex-grow text-center">{pageTitle}</h1>
      {/* Optional right-side action button */}
      <div className="w-6"></div> {/* Placeholder to center title */}
    </div>
  );
  const HamburgerButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="fixed top-3 left-4 z-50 p-2 bg-custom-yellow  rounded-lg min-[1024px]:hidden shadow-sm"
    >
      {isMobileMenuOpen ? <icon.X size={24} /> : <icon.AlignLeft size={24} />}
    </button>
  );

  // Sidebar Content
  const SidebarContent = ({ mobile }) => (
    <aside
      className={`
        ${mobile ? 'fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out z-40' : 'h-screen static'}
        ${mobile && !isMobileMenuOpen ? '-translate-x-full' : mobile ? 'translate-x-0' : ''}
        bg-white dark:bg-gray-800 border-r shadow-sm
      `}
    >
      <nav className="h-full flex flex-col">
        <div className="py-4 pl-10 pb-2 flex justify-between items-center bg-custom-yellow">
          <Image
            src="/nombre.png"
            width={200}
            height={200}
            alt="Nombre de la empresa"
            className="w-32"
          />
        </div>

        <ul className="flex-1 px-3 overflow-y-auto">
          {status === "loading" ? (
            <div className="flex items-center justify-center mt-20">
              <ClipLoader size={30} speedMultiplier={1.5} />
            </div>
          ) : (
            sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                {...item}
                expanded={true}
                onItemClick={() => mobile && setIsMobileMenuOpen(false)}
              />
            ))
          )}
        </ul>

        <div className="border-t border-gray-400 dark:border-gray-200 flex p-3">
          <div className="flex justify-between items-center w-full ml-3">
            <div className="leading-4 text-gray-700 dark:text-white">
              <div className="flex items-center space-x-4">
                <img
                  src="/user-profile.png"
                  className="w-8 h-8 rounded-full object-cover"
                  alt="User Profile"
                />
                <div className="flex flex-col">
                  <label className="mb-1">{session?.user?.name}</label>
                  <label>{session?.user?.name}</label>
                </div>
              </div>
            </div>
            <div className="flex flex-row space-x-2">
              <a
                href="/api/auth/signout"
                title="Cerrar Sesión"
                className="inline-flex items-center p-2 text-sm font-medium text-gray-500 rounded-lg dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <icon.LogOutIcon size={16} />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );

  return (
    <>
      {/* Mobile Header (only on small screens) */}
      {isSmallScreen && <MobileSiteHeader />}
      {isSmallScreen && <HamburgerButton />}


      {/* Desktop Sidebar */}
      {!isSmallScreen && <SidebarContent mobile={false} />}

      {/* Mobile Offcanvas Sidebar */}
      {isSmallScreen && <SidebarContent mobile={true} />}

      {/* Overlay for mobile menu */}
      {isSmallScreen && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export function SidebarItem({ icon, text, link, expanded, subItems, onItemClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownClick = () => setDropdownOpen(!dropdownOpen);

  const itemClassName = `flex items-center p-2 w-full text-base font-medium rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700`;

  const handleClick = () => {
    onItemClick && onItemClick();
  };

  if (subItems && subItems.length > 0) {
    return (
      <li className="relative my-1">
        <button
          type="button"
          className={itemClassName}
          aria-expanded={dropdownOpen ? "true" : "false"}
          onClick={handleDropdownClick}
        >
          <span className="flex items-center justify-center">{icon}</span>
          <span className="flex-1 ml-3 text-left whitespace-nowrap">{text}</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
        <ul className={`py-2 space-y-2 ${dropdownOpen ? "block" : "hidden"}`}>
          {subItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.link}
                className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                onClick={handleClick}
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li className="relative flex items-center my-1 py-2 px-3 font-medium rounded-md cursor-pointer transition-colors group">
      <Link
        className="flex items-center"
        href={link}
        onClick={handleClick}
      >
        <span className="flex items-center justify-center">{icon}</span>
        <span className="ml-3">{text}</span>
      </Link>
    </li>
  );
}