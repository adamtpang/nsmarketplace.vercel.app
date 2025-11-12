"use client"

import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeaderSimple } from "@/components/site-header-simple"
import { supabase, type Listing } from "@/lib/supabase"
import { useEffect, useState } from "react"

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  'electronics': '🖥️',
  'furniture': '🪑',
  'sports': '🚲',
  'clothing': '👕',
  'personal': '💆',
  'professional': '💻',
  'health': '💊',
  'creative': '🎨',
  'default': '📦'
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('available', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching listings:', error)
        } else {
          setListings(data || [])
        }
      } catch (err) {
        console.error('Exception fetching listings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  // Group listings by category
  const forSale = listings.filter(l => l.category === 'for-sale')
  const services = listings.filter(l => l.category === 'service')
  const housing = listings.filter(l => l.category === 'housing')
  const requests = listings.filter(l => l.category === 'request')

  // Filter by search
  const filterBySearch = (items: Listing[]) => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }

  const getEmoji = (listing: Listing) => {
    return categoryEmojis[listing.subcategory || ''] || categoryEmojis['default']
  }

  const formatPrice = (price: number | null) => {
    if (price === null || price === 0) return 'Free'
    return `$${price}`
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeaderSimple />

      <main className="container mx-auto px-4 lg:px-8 max-w-5xl py-6">
        {/* Search Bar */}
        <div className="mb-8 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild size="lg">
            <Link href="/seller/new">
              <Plus className="mr-2 h-4 w-4" />
              Post Listing
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to post in floatlist!
            </p>
            <Button size="lg" asChild>
              <Link href="/seller/new">
                <Plus className="mr-2 h-5 w-5" />
                Create First Listing
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* For Sale Section */}
            {filterBySearch(forSale).length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-foreground">
                  For Sale
                </h2>
                <div className="space-y-2">
                  {filterBySearch(forSale).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="block hover:bg-muted/50 transition-colors rounded-lg p-3 border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl flex-shrink-0">{getEmoji(listing)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base truncate">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{listing.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-lg text-primary">{formatPrice(listing.price)}</div>
                          <div className="text-xs text-muted-foreground">📍 KL</div>
                        </div>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Services Section */}
            {filterBySearch(services).length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-foreground">
                  Services
                </h2>
                <div className="space-y-2">
                  {filterBySearch(services).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="block hover:bg-muted/50 transition-colors rounded-lg p-3 border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl flex-shrink-0">{getEmoji(listing)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base truncate">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{listing.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-lg text-primary">{formatPrice(listing.price)}</div>
                          <div className="text-xs text-muted-foreground">📍 KL</div>
                        </div>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Housing Section */}
            {filterBySearch(housing).length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-foreground">
                  Housing
                </h2>
                <div className="space-y-2">
                  {filterBySearch(housing).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="block hover:bg-muted/50 transition-colors rounded-lg p-3 border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl flex-shrink-0">🏠</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base truncate">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{listing.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-lg text-primary">{formatPrice(listing.price)}</div>
                          <div className="text-xs text-muted-foreground">📍 KL</div>
                        </div>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Requests Section */}
            {filterBySearch(requests).length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-foreground">
                  Requests
                </h2>
                <div className="space-y-2">
                  {filterBySearch(requests).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="block hover:bg-muted/50 transition-colors rounded-lg p-3 border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl flex-shrink-0">💬</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base truncate">"{listing.title}"</h3>
                          <p className="text-sm text-muted-foreground truncate">{listing.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-lg text-primary">{formatPrice(listing.price)}</div>
                          <div className="text-xs text-muted-foreground">📍 KL</div>
                        </div>
                        <Button size="sm" variant="outline">Reply</Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
