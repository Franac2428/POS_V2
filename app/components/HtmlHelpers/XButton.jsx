import { X } from "lucide-react";

const XButton = ({ onClose }) => {
    return (
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <X size={20} strokeWidth={2} />
        </button>
    );
};

export default XButton;
