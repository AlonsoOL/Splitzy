import { Button } from "@/components/ui/button"
import { FriendList } from "@/components/FriendList"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react";
import { AddFriendModal } from "@/components/AddFriendModal";
import { useSendFriendRequest } from "@/hook/useSendFriendRequest";

interface JwtPayload{
    id: number;
}

function MenuUser(){
    const [modalOpen, setModalOpen] = useState(false)
    const sendRequest = useSendFriendRequest()
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    const [userId, setUserId] = useState<number>(0)

    useEffect(() => {
        if(token){
        const decoded = jwtDecode<JwtPayload>(token)
        setUserId(decoded.id)
    }
    }, [])

    const handleSendRequest = async (recivedId: number) => {
        try{
            await sendRequest(userId, recivedId)
            alert("solicitud enviada correctamente")
        }
        catch{
            alert("error al enviar la solicitud")
        }
    }
    
    
    return(
        <div className="w-full bg-[url(/fondo-splitzy.png)] bg-cover">
            <div className="min-h-screen w-full flex flex-row items-center justify-center backdrop-blur-2xl xl:gap-10 md:gap-5">
                <div className="w-1/6"></div>
                <div className="w-1/2 flex flex-col xl:gap-10 md:gap-5">
                    {/* Sección de los amigos */}
                    <div className="bg-[#242424e0] rounded-[21px] overflow-hidden h-75 p-8">
                        <div className="flex flex-row mb-4">
                            <p className="w-1/2 text-left">Amigos</p>
                            <div className="w-1/2 text-right ">
                                <a className="cursor-pointer" onClick={() => setModalOpen(true)}>Añadir amigo</a>
                                <div className="absolute top-0 right-0 bg-black w-full z-50 opacity-50">
                                    <AddFriendModal 
                                        isOpen={modalOpen}
                                        onClose={() => setModalOpen(false)}
                                        currentUserId={userId}
                                        onSendRequest={handleSendRequest}>
                                    </AddFriendModal>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            <div className="flex flex-row border-bottom items-center border-b-2 pb-2">
                                <div className="w-1/8 relative">
                                    {/* Foto de perfil con estado de usuario*/}
                                    <img src="prueba.png" className="w-10 h-10 mr-4 rounded-full"/>
                                    <div className="bg-green-500 w-4 h-4 rounded-full border border-stone-900 z-40 absolute bottom-0 xl:right-5 lg:right-2"></div>
                                </div>
                                <div className="w-1/2 text-left">
                                    <p>Ivan</p>
                                </div>
                                <p className="w-1/2 text-gray-400 text-right">Debes 200€</p>
                            </div>
                            <div className="flex flex-row border-bottom items-center border-b-2 pb-2">
                                <div className="w-1/8 relative">
                                    <img src="prueba.png" className="w-10 h-10 mr-4 rounded-full"/>
                                    <div className="bg-gray-500 w-4 h-4 rounded-full absolute bottom-0 xl:right-5 border border-stone-900 z-40 lg:right-2"></div>
                                </div>
                                <div className="w-1/2 text-left">
                                    <p>Alonso</p>
                                </div>
                                <p className="w-1/2 text-gray-400 text-right">¡Estás al día!</p>
                            </div>
                            <FriendList userId={userId}/>
                        </div>
                    </div>

                    {/* Sección de los grupos */}
                    <div className="h-75 p-8 bg-[#242424e0] rounded-[21px] overflow-hidden">
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
                <div className="w-1/2 h-160 p-8 bg-[#242424e0] rounded-[21px] space-y-3">
                    <div className="text-xl">Actividad reciente</div>
                    <div className="flex flex-col border-b-1 border-stone-500 space-y-3 pb-3">
                        <div className="flex flex-raw justify-center">
                            <span className="font-bold">Iván&nbsp;</span> te ha invitado al grupo <p className="font-bold">&nbsp;fiesta fin de curso</p>.
                        </div>
                        <div className="flex flex-raw w-full gap-x-4 justify-center">
                            <Button className="w-1/3">Aceptar</Button>
                            <Button className="w-1/3">Rechazar</Button>
                        </div>
                    </div>
                    <div className="flex flex-raw border-b-1 border-stone-500 justify-center items-center pb-3">
                        <div className="w-3/4 space-y-2  text-left">
                            <p><span className="font-bold">Raúl&nbsp;</span>te ha mandado una solicitud de amistad</p>
                            <p className="text-sm text-stone-400">Soy Raúl el vecino</p>
                        </div>
                        <div className="flex flex-raw w-1/4 justify-center gap-x-2">
                            <Button className="bg-transparent! bg-[url(/check.svg)]! bg-cover! w-[40px]! h-[40px]! rounded-full! text-white! hover:bg-green-400!"></Button>
                            <Button className="bg-transparent! bg-[url(/decline.svg)]! bg-cover! w-[40px]! h-[40px]! rounded-full! text-white! hover:bg-red-400! hover:border-red-600!"></Button>
                        </div>
                    </div>
                </div>
                <div className="w-1/6"></div>
            </div>
        </div>
    )
}

export default MenuUser