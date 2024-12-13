import HtmlBreadCrumb from "./BreadCrumb";

const PageContent = ({ itemsBreadCrumb, tituloCard = "", onLoading = false, content, }) => {

    return (
        <>
            {/* Breadcrumb */}
            <div className="w-full p-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="pl-2 inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                        <HtmlBreadCrumb items={itemsBreadCrumb} />
                    </ol>
                </nav>
            </div>

            {/* Card */}
            <div className="w-full pl-4 pr-4">
                <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {tituloCard}
                    </h5>
                    {content}
                </div>
            </div>
        </>

    );
};

export default PageContent;
