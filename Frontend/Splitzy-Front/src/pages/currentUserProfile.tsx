import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { API_BASE_URL, DELETEUSERACCOUNT, GETCURRENTUSER, UPDATECURRENTUSER } from "@/config"
import { DialogClose } from "@radix-ui/react-dialog"
import { Separator } from "@/components/ui/separator";
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FriendList } from "@/components/FriendList";
import { useWebsocket } from "@/context/WebSocketContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface JwtPayload{
    id: number
}

interface userProfile{
    id: number,
    name: string,
    email: string,
    role: string,
    imageUrl: string,
    address: string,
    phone: string,
}

const formSchema = z.object({
  name: z.string().min(3, {message: "El usuario tiene que tener al menos tres caracteres",}),
  email: z.string().email({message: "Introduzca un correo electrónico válido"}),
  password: z.string().min(6, {message: "La contraseña debe tener al menos 6 caracteres"}),
  confirmPassword: z.string().min(6, {message: "La contraseña debe tener al menos 6 caracteres"}),
  phone: z.string().max(6, {message:"El número de teléfono no puede tener más de 6 caracteres"}).min(6, {message: "El número de teléfono no puede tener menos de 6 caracteres"}),
  address: z.string().max(15),
  avatar: z.any().refine((file) =>{
    if (!file || !(file instanceof FileList) || file.length === 0)return true;
    const acceptedTypes = ["image/png", "image/jpg", "image/jpeg"];
    return acceptedTypes.includes(file[0].type)
  },
  {
    message: "Solo se permiten archivos .png o .jpg",
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
})

function CurrentUserProfile(){
    const socket = useWebsocket()
    const [currentUserId, setCurrentUserId] = useState<number>(0)
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    const [user, setUser] = useState<userProfile | null>(null)
    const [ notification, setNotification ] = useState<string[]>([])
    const navigate = useNavigate();
    const [refreshFriendList, setRefreshFriendList] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false) 
    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name: "",  
                email: "",
                password: "",
                confirmPassword: "",
                avatar: "",
                phone: "",
                address: "",
            },
          })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append('name', values.name)
        formData.append('email', values.email)
        formData.append('password', values.password)
        formData.append('address', values.address)
        formData.append('phone', values.phone)
            
        if(values.avatar && values.avatar.length > 0){
            const file = values.avatar[0]
            console.log(file)
            console.log(file.type)
            const extension = file.name.substring(file.name.lastIndexOf('.'))
            console.log("esta es la extensión", extension)
            const customFileName = `${values.name}_profilepicture${extension}`
            console.log("este es el nombre del archivo", customFileName)
    
            const renamedFile = new File([file], customFileName, { type: file.type })
            console.log(renamedFile)
            formData.append('imageUrl', renamedFile)

        }else{
            console.log("estoy en el else")
            formData.append('imageUrl', values.avatar)
        }

        try{
            const response = await fetch(UPDATECURRENTUSER, {
                method: "POST",
                body: formData
            })
            console.log("estoy en el try;", response)

            setTimeout(() =>{
                navigate("/user-profile")
            }, 3000)
        }catch (e){
            console.log("algo ha salido mal:", e)
        }
    }
    useEffect(() => {
        if(token){
        const decoded = jwtDecode<JwtPayload>(token)
        setCurrentUserId(decoded.id)
        setIsAuthenticated(true)
    }
    }, [])

    useEffect(() =>{
            if (!socket) return
            
            const handler = (event: MessageEvent) => {
                try {
                    const msg = JSON.parse(event.data)
    
                    if( msg.Type === "friend_request_reject"){
                        const { RecivedName } = msg.Data
                        const message = `${RecivedName} ha rechazado la solicitud de amistad`
    
                        setNotification(prev => [...prev, message])
                    }
    
                    if(msg.Type === "friend_request_accept"){
                        const { RecivedName } = msg.Data
                        const message = `${RecivedName} ha aceptado la solicitud de amistad`
    
                        setNotification(prev => [...prev, message])
                        setRefreshFriendList(prev => !prev)
                    }
    
                    if(msg.Type === "delete_friend"){
                        const {removeByName} = msg.Data
                        const message = `${removeByName} y tú ya no sois amigos.`
    
                        setNotification(prev => [...prev, message])
                        setRefreshFriendList(prev => !prev)
                    }
    
                }catch (e){
                    console.error("ws mensaje inválido", e)
                }
            }
    
            socket.addEventListener("message", handler)
            return () => { socket.removeEventListener("message", handler)}
        }, [socket, currentUserId])

        useEffect(() =>{
            if (notification.length === 0) return

            const timer = setTimeout(() => {
                setNotification(prev => prev.slice(1))
            }, 3600)

            return () =>clearTimeout(timer)
        }, [notification])

    useEffect(() =>{
        const fetchProfile = async () => {
            const response = await fetch(`${GETCURRENTUSER}${currentUserId}`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok){
                const errorData = await response.json()
                console.log(errorData)
            }

            const data = await response.json()
            setUser(data)
        }

        fetchProfile()
    }, [currentUserId])

    const handleDeleteAccount = async () => {
        try{
            const response = await fetch(`${DELETEUSERACCOUNT}${currentUserId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            localStorage.removeItem("user")
            sessionStorage.removeItem("user")
            navigate("/login")
        }
        catch(error: any){
            console.error("no se ha podido eliminar el usuario correctamente", error)
        }
    }
    
    return (
        <div className="min-h-screen w-full bg-[url(/fondo-splitzy.png)] bg-cover">
            <div className="min-h-screen w-full p-10 items-center justify-center backdrop-blur-2xl xl:gap-10 md:gap-5">
                {notification.length > 0 && (
                    <div className="absolute top-5 right-1 bg-black p-4">
                    {notification.map((note) => (
                        <div>{note}</div>
                    ))}
                    </div>
                )}
                <div className="w-full h-160 p-20 bg-[#1b1b1b48] rounded-[21px] space-x-6 flex flex-raw">
                    {user && (
                        <div className="w-[50%] items-center flex flex-col h-full space-y-6">
                            <div className="flex items-center justify-center w-41 h-41 rounded-full border">
                                <img src={`${API_BASE_URL}${user.imageUrl}`} className="w-40 h-40 rounded-full"/>
                            </div>
                            {/* <Button>Cambiar foto de perfil</Button> */}
                            <Separator/>
                            <div className="flex w-full space-x-6 text-left">
                                <div className="w-1/2 flex flex-col" >
                                    <span>Nombre:</span> 
                                    <span className="text-2xl">{user.name}</span>
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <span>Email:</span>
                                    <span className="text-2xl">{user.email}</span>
                                </div>
                            </div>
                            <div className="flex w-full space-x-6 text-left">
                                <div className="w-1/2 flex flex-col">
                                    <span>Dirección:</span> 
                                    <span className="text-2xl">{user.address}</span>
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <span>Teléfono:</span>
                                    <span className="text-2xl">{user.phone}</span>
                                </div>
                            </div>
                            <div className="flex flex-row space-x-4 w-full">
                                <Dialog>
                                    <form>
                                        <DialogTrigger asChild>
                                            <Button>Editar perfil</Button>
                                            
                                        </DialogTrigger>
                                        <DialogContent  className="bg-[#262626] border-transparent">
                                            <DialogHeader>
                                                <DialogTitle>Editar perfil</DialogTitle>
                                                <DialogDescription>
                                                    Edita tus datos de perfil y pulsa en "guardar" para actualizar tu información de perfil
                                                </DialogDescription>
                                            </DialogHeader>
                                            {/* Aquí van los campos para cambiar los datos del usuario */}
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                                    <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Nombre</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={user.name} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                    />
                                                    <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Correo electrónico</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={user.email} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                    />
                                                    <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Contraseña</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="******" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                    />
                                                    <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Teléfono</FormLabel>
                                                        <FormControl>
                                                            <Input type="phone" placeholder={user.phone} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                    />
                                                    <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Dirección</FormLabel>
                                                        <FormControl>
                                                            <Input type="text" placeholder={user.address} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                    />
                                                    <Button type="submit">Guardar Cambios</Button>
                                                </form>
                                            </Form>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button className="bg-red-500! transition duration-500 text-white! hover:border-transparent! hover:bg-white! hover:text-red-500!">Cancelar</Button>
                                                </DialogClose>
                                                
                                            </DialogFooter>
                                        </DialogContent>
                                    </form>
                                </Dialog>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-red-500! transition duration-500 text-white! hover:border-transparent! hover:bg-white! hover:text-red-500!">Eliminar perfil</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>¿Estás seguro?</DialogTitle>
                                            <DialogDescription>
                                                Tu cuenta será eliminada definitivamente
                                            </DialogDescription>
                                        </DialogHeader>
                                        {/* Aquí van los campos para cambiar los datos del usuario */}
                                        <DialogFooter>
                                            <Button onClick={handleDeleteAccount} className="bg-red-500! transition duration-500 text-white! hover:border-transparent! hover:bg-white! hover:text-red-500!">
                                                Eliminar
                                            </Button>
                                            <DialogClose asChild>
                                                <Button>Cancelar</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}
                    <Separator orientation="vertical"/>
                    <div className="w-[50%] space-y-6">
                        <div className="text-4xl">Amigos:</div>
                        <FriendList userId={currentUserId} refreshSignal={refreshFriendList} isAuthenticated={isAuthenticated}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CurrentUserProfile