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
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "El usuario tiene que tener al menos tres caracteres",
  }),
  email: z.string().email({message: "Introduzca un correo electrónico válido"}),
  password: z.string().min(6, {message: "La contraseña debe tener al menos 6 caracteres"}),
  confirmPassword: z.string().min(6, {message: "Por favor confirma la contraseña"}),
  avatar: z.string().min(3, {message: "el archivo es demasiado pesado"}),
})



function Register(){
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",  
            email: "",
            password: "",
            confirmPassword: "",
            avatar: "",
        },
      })
    
      // 2. Define a submit handler.
      function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
      }
    return(
        // bg-[url(/img/mountains.jpg)]
        <div className="min-h-screen w-screen bg-[url(/fondo-splitzy.png)] bg-cover flex items-center justify-center">
            <div className="flex flex-row rounded-[40px] bg-[#000000e7] w-[75%]">
                <div className="p-6 w-1/2">
                    <div className="text-center flex flex-row items-center">
                        <div className="w-1/3">
                            <img src="/logo-splitzy.png" className="w-20 mr-10"/>
                        </div>
                        <div className="w-1/3">
                            <h1 className="mb-2">Bienvenido</h1>
                            <h3>Crea ahora tu cuenta</h3>
                        </div>
                        <div className="w-1/3"></div>
                    </div>
                    <div className="mt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                control={form.control}
                                name="username"
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
                                        <Input placeholder="******" {...field} />
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
                                        <Input placeholder="******" {...field} />
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
                                        <Input type="file" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button className="w-full" type="submit">Registrarse</Button>
                            </form>
                        </Form>
                        <br/>
                        <a href="#" className="mt-4">¿Ya tienes cuenta? Logeate.</a>
                    </div>
                </div>
                <div className="bg-[url(/cangrejo-form.png)] bg-cover rounded-[40px] w-1/2">
                </div>
            </div>
        </div>
    )
}

export default Register