import PlantForm from '@/components/PlantForm'

export default function EditPlantPage({ params }: { params: { id: string } }) {
  return <PlantForm plantId={params.id} />
}
