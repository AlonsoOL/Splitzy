function MenuUser(){
    return(
        <div className="w-screen bg-[url(/fondo-splitzy.png)] bg-cover">
            <div className="min-h-screen w-full flex flex-row items-center justify-center backdrop-blur-2xl gap-10">
                <div className="w-1/6"></div>
                <div className="w-1/2 flex flex-col gap-10">
                    {/* Sección de los amigos */}
                    <div className="h-75 p-8 bg-[#242424e0] rounded-[21px] overflow-hidden">
                        <div className="flex flex-row mb-4">
                            <p className="w-1/2 text-left">Amigos</p>
                            <div className="w-1/2 text-right">
                                <a href="#">Añadir amigo</a>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            <div className="flex flex-row border-bottom items-center border-b-2 pb-2">
                                <div className="w-1/8 relative">
                                    <img src="prueba.png" className="w-10 h-10 mr-4 rounded-full"/>
                                    <div className="bg-green-500 w-4 h-4 rounded-full absolute bottom-0 right-5 border border-stone-900 z-40"></div>
                                </div>
                                <div className="w-1/2 text-left">
                                    <p>Ivan</p>
                                </div>
                                <p className="w-1/2 text-gray-400 text-right">Debes 200€</p>
                            </div>
                            <div className="flex flex-row border-bottom items-center border-b-2 pb-2">
                                <div className="w-1/8 relative">
                                    <img src="prueba.png" className="w-10 h-10 mr-4 rounded-full"/>
                                    <div className="bg-gray-500 w-4 h-4 rounded-full absolute bottom-0 right-5 border border-stone-900 z-40"></div>
                                </div>
                                <div className="w-1/2 text-left">
                                    <p>Alonso</p>
                                </div>
                                <p className="w-1/2 text-gray-400 text-right">¡Estás al día!</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección de los grupos */}
                    <div className="h-75 p-8 pr-4 bg-[#242424e0] rounded-[21px] overflow-hidden">
                        <div className="flex flex-row mb-4">
                            <p className="w-1/2 text-left">Grupos</p>
                            <div className="w-1/2 text-right">
                                <a href="#">Crear grupo</a>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            <div className="flex flex-row items-center border-b-2 pb-2">
                                <div className="w-1/8">
                                    <p>abr</p>
                                    <p>14</p>
                                </div>
                                <img src="prueba.png" className="w-10 h-10 mr-4 rounded-[4px]"/>
                                <div className="w-1/2 text-left">
                                    <a href="#">Mensualidad piso</a>
                                    <p className="text-gray-400 text-sm">Pagaste 200€</p>
                                </div>
                                <p className="w-1/2 text-gray-400 text-right">¡Estás al día!</p>
                            </div>
                            <div className="flex flex-row items-center border-b-2 pb-2">
                                <div className="w-1/8">
                                    <p>abr</p>
                                    <p>14</p>
                                </div>
                                <img src="prueba.png" className="w-10 h-10 mr-4 rounded-[4px]"/>
                                <div className="w-1/2 text-left">
                                    <p>Vacaciones verano</p>
                                    <p className="text-gray-400 text-sm">Pagaste 100€</p>
                                </div>
                                <p className="w-1/2 text-gray-400 text-right">Debes 30€</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
                {/* Sección actividad reciente */}
                <div className="w-1/2 h-160 p-8 bg-[#242424e0] rounded-[21px]">
                    <div>Actividad reciente</div>
                </div>
                <div className="w-1/6"></div>
            </div>
        </div>
    )
}

export default MenuUser