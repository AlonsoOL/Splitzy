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
  address: z.string().min(5, {message: "Introduzca su dirección postal, mínimo 5 caracteres"}),
  birthday: z.string().refine((val) => !isNaN(Date.parse(val)), {message: "Introduzca una fecha válida"}),
})



function Register(){
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",  
            email: "",
            password: "",
            confirmPassword: "",
            address: "",
            birthday: "",
        },
      })
    
      // 2. Define a submit handler.
      function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
      }
    return(
        <div className="flex flex-row rounded-lg bg-black">
            <div className="p-6 border border-indigo-600">
                <div className="text-center">
                    <div>
                        <img/>
                        <h1 className="mb-2">Bienvenido</h1>
                    </div>
                    <h3>Crea ahora tu cuenta</h3>
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
                            <Button type="submit">Registrarse</Button>
                        </form>
                    </Form>
                    <a href="#" className="mt-4">¿Ya tienes cuenta? Logeate.</a>
                </div>
            </div>
            <div className="border border-indigo-600">
                <p>Aquí es donde irá la imagen del cangrejo</p>
            </div>
        </div>
    )
}

export default Register