import XButton from "./XButton";

const ModalTemplate = ({ onClose, handleClose, children, title, icon: Icon, open}) => {
    const classResponsiveModal = "sm:w-8/12 md:w-6/12 lg:w-6/12 xl:w-6/12 w-8/12";

    return (
        <div onClick={handleClose ?? onClose} className={`fixed inset-0 flex justify-center items-center transition-opacity ${open ? "visible bg-black bg-opacity-40 dark:bg-opacity-50" : "invisible"}`}>
            <div onClick={(e) => e.stopPropagation()} className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-all ${open ? "scale-100 opacity-100" : "scale-90 opacity-0"} ${classResponsiveModal}`}>
                <XButton onClose={onClose} />
                <div className="flex flex-col items-center">
                    <div className="text-center w-full">
                        <h2 className="text-xl font-bold flex gap-3 justify-center items-center text-gray-900 dark:text-gray-100">
                            {Icon && <Icon />} {title}
                        </h2>
                        <hr className="my-3 py-0.5 border-black dark:border-white" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalTemplate;
