import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

export const metadata:Metadata={
  title:{absolute:'Postulá Mejor'},
  robots:{index:false,follow:false},
}

export default function PlantillasPage(){
  redirect('/mejorar-cv')
}
