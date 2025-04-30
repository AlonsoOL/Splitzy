import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { custom, z } from "zod"

const formSchema = z.object({
  name: z.string().min(3, {message: "El usuario tiene que tener al menos tres caracteres",}),
  email: z.string().email({message: "Introduzca un correo electrónico válido"}),
  password: z.string().min(6, {message: "La contraseña debe tener al menos 6 caracteres"}),
  confirmPassword: z.string().min(6, {message: "La contraseña debe tener al menos 6 caracteres"}),
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

function Register(){
    const [succesMessage, setSuccesMessage] = useState("");
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",  
            email: "",
            password: "",
            confirmPassword: "",
            avatar: "",
        },
      })
    
      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append('name', values.name)
        formData.append('email', values.email)
        formData.append('password', values.password)
        
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
            const response = await fetch("https://localhost:7044/register", {
                method: 'POST',
                body: formData,
            });

            if(!response.ok){
                const errorText = await response.text();
                throw new Error(errorText)
            }

            setSuccesMessage("El resgistro se ha completado con éxito.")
            setTimeout(() =>{
                navigate("/login")
            }, 3000)
        }
        catch (error){
            throw new Error("Hay un problema en el servidor:" + error)
        }
        
      }
    return(
        <div className="min-h-screen w-screen bg-[url(/fondo-splitzy.png)] bg-cover flex justify-center">
            <div className="flex flex-row rounded-[40px] bg-[#242424e0] w-[60%] mt-10 mb-10">
                <div className="p-6 w-1/2">
                    <div className="flex flex-row items-center">
                        <div className="w-1/3">
                            <img src="/logo-splitzy.png" className="w-20 mr-10"/>
                        </div>
                        <div className="text-center w-1/2">
                            <h1 className="mb-2">Bienvenido</h1>
                            <h3>Crea ahora tu cuenta</h3>
                        </div>
                        <div className="w-1/3"></div>
                    </div>
                    <div className="w-full">
                        {succesMessage && <p className="text-green-600 bg-green-300 border-4 border-green-600 rounded-[8px]">{succesMessage}</p>}
                    </div>
                    <div className="mt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Alonso Onsurbe" {...field} />
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
                                        <Input placeholder="correo@prueba.ex" {...field} />
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
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Confirmar contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Avatar</FormLabel>
                                    <FormControl>
                                        <Input type="file"
                                        accept="image/png, image/jpeg" 
                                        className="file:hidden"
                                        onChange={(e) => field.onChange(e.target.files)}/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button className="w-full" type="submit">Registrarse</Button>
                            </form>
                        </Form>
                        <br/>
                        <div className="text-center text-sm text-gray-300">
                            Ya tienes una cuenta?{" "}
                            <a href="/login" className="underline underline-offset-4 hover:text-white">
                            Logeate.
                            </a>
                        </div>
                    </div>
                </div>
                <div className="bg-[url(/cangrejo-form.png)] bg-cover bg-no-repeat rounded-r-[40px] w-1/2"></div>
            </div>
        </div>
    )
}

export default Register