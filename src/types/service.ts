export type ServiceCategory = 'medical' | 'beauty' | 'accommodation' | 'training' | 'grooming'

export interface ServiceProvider {
  id: string
  name: string
  avatar: string
  rating: number
  distance: number
  address: string
  latitude?: number
  longitude?: number
  services: ServiceItem[]
  phone?: string
  businessHours?: string
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  price: number
  duration?: number
  category: ServiceCategory
}

export interface BookingForm {
  providerId: string
  serviceIds: string[]
  date: string
  time: string
  petId: string
  notes?: string
}

export interface BookingRecord {
  id: string
  providerId: string
  provider: ServiceProvider
  serviceIds: string[]
  services: ServiceItem[]
  date: string
  time: string
  petId: string
  petName: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

