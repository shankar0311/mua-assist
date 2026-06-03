export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    name: string | null
                    phone: string | null
                    city: string | null
                    language_preference: string
                    created_at: string
                }
                Insert: {
                    id: string
                    name?: string | null
                    phone?: string | null
                    city?: string | null
                    language_preference?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    phone?: string | null
                    city?: string | null
                    language_preference?: string
                    created_at?: string
                }
            }
            leads: {
                Row: {
                    id: string
                    user_id: string
                    client_name: string
                    event_date: string
                    event_type: string | null
                    location: string | null
                    notes: string | null
                    status: 'new' | 'contacted' | 'converted' | 'lost'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    client_name: string
                    event_date: string
                    event_type?: string | null
                    location?: string | null
                    notes?: string | null
                    status?: 'new' | 'contacted' | 'converted' | 'lost'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    client_name?: string
                    event_date?: string
                    event_type?: string | null
                    location?: string | null
                    notes?: string | null
                    status?: 'new' | 'contacted' | 'converted' | 'lost'
                    created_at?: string
                }
            }
            bookings: {
                Row: {
                    id: string
                    lead_id: string
                    user_id: string
                    advance_amount: number
                    payment_status: 'pending' | 'partial' | 'paid'
                    booking_status: 'confirmed' | 'completed' | 'cancelled'
                    buffer_time: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    lead_id: string
                    user_id: string
                    advance_amount?: number
                    payment_status?: 'pending' | 'partial' | 'paid'
                    booking_status?: 'confirmed' | 'completed' | 'cancelled'
                    buffer_time?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    lead_id?: string
                    user_id?: string
                    advance_amount?: number
                    payment_status?: 'pending' | 'partial' | 'paid'
                    booking_status?: 'confirmed' | 'completed' | 'cancelled'
                    buffer_time?: number
                    created_at?: string
                }
            }
        }
    }
}
