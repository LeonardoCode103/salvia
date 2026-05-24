import { z } from 'zod'

const condicionesSalud = ['ninguna', 'diabetes', 'hipertension', 'colesterol', 'enfermedad_celiaca', 'otro'] as const

export const RegistroSchema = z.object({
  nombre: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'Solo letras'),
  email: z.string()
    .email('Email inválido')
    .max(100),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Necesita al menos una mayúscula')
    .regex(/[0-9]/, 'Necesita al menos un número'),
  condicion_salud: z.enum(condicionesSalud, {
    message: 'Selecciona una condición'
  }),
  acepta_privacidad: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar el aviso de privacidad'
  })
})

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Escribe tu contraseña')
})

export const IngredientesSchema = z.object({
  ingredientes: z.string()
    .min(3, 'Escribe al menos un ingrediente')
    .max(500, 'Demasiado texto')
    .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ0-9,.\s]+$/, 'Solo ingredientes, sin símbolos')
})

export const RecetaSchema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(100),
  descripcion: z.string().min(20, 'Descripción muy corta').max(2000),
  ingredientes: z.array(z.string().max(100)).min(1).max(30),
  pasos: z.array(z.string().max(500)).min(1).max(20),
  tiempo_minutos: z.number().int().min(1).max(480),
  porciones: z.number().int().min(1).max(20)
})

export type RegistroForm = z.infer<typeof RegistroSchema>
export type LoginForm = z.infer<typeof LoginSchema>
export type IngredientesForm = z.infer<typeof IngredientesSchema>
export type RecetaForm = z.infer<typeof RecetaSchema>