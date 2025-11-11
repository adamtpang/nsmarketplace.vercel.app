import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Craigslist-style marketplace
export type ListingType = 'for-sale' | 'service' | 'housing' | 'request'
export type ListingCategory = 'for-sale' | 'service' | 'housing' | 'request'

export interface Listing {
  id: string
  title: string
  description: string
  price: number | null // null for "free" or "negotiable"
  type: ListingType
  category: ListingCategory
  subcategory?: string
  images: string[]
  seller_id: string
  seller_name: string
  whatsapp?: string
  telegram?: string
  available: boolean
  views: number
  business_id?: string // Keep for now, will remove later
  created_at: string
  updated_at: string
}

export interface CreateListingInput {
  title: string
  description: string
  price: number | null
  type: ListingType
  category: ListingCategory
  subcategory?: string
  images: string[]
  seller_name: string
  whatsapp?: string
  telegram?: string
  seller_id?: string
}

export interface Business {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  owner_id: string
  website?: string
  location?: string
  category?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface CreateBusinessInput {
  name: string
  slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  owner_id?: string
  website?: string
  location?: string
  category?: string
}
