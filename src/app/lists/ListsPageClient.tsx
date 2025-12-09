'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, List as ListIcon, User as UserIcon, Award, Users, ImageOff } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Types derived from the prisma query structure
type ListImage = {
  figure: {
    images: { url: string }[]
  }
}

type ListData = {
  id: string
  name: string
  items: ListImage[]
  _count: { items: number }
  createdBy?: { username: string } | null // Optional for "my lists" where creator is implicit
}

interface ListsPageClientProps {
  user: { id: string } | null
  featuredLists: ListData[]
  officialLists: ListData[]
  userLists: ListData[]
  myLists: ListData[]
}

// --- Components ---

const SectionHeader = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-primary/10 rounded-lg">
      <Icon className="text-primary w-6 h-6" />
    </div>
    <h2 className="text-2xl font-title font-bold text-textWhite">{title}</h2>
  </div>
)

const ListCard = ({ list, isOwner = false }: { list: ListData, isOwner?: boolean }) => {
  const images = list.items?.map(item => item.figure.images[0]?.url).filter(Boolean) || []
  // Fill with placeholders if less than 4 images
  const displayImages = [...images]

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group block h-full"
    >
      <Link href={`/lists/${list.id}`} className="flex flex-col h-full bg-uiBase border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(225,6,44,0.15)]">
        {/* Image Grid Preview */}
        <div className="aspect-[2/1] bg-gray-900 relative overflow-hidden">
          {displayImages.length > 0 ? (
            <div className="grid grid-cols-4 h-full">
              {displayImages.slice(0, 4).map((url, i) => (
                <div key={i} className="relative border-r border-white/10 last:border-0">
                   <img 
                     src={url} 
                     alt="" 
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                   />
                </div>
              ))}
              {/* If less than 4 images, fill space or show empty state visually? 
                  Actually, let's make it simpler: a 2x2 grid or 1 main image depending on count.
                  Let's stick to the horizontal strip for now, it looks sleek.
              */}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
              <ImageOff size={24} />
              <span className="text-xs">Sin imágenes</span>
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-uiBase via-transparent to-transparent opacity-80" />
          
          {/* Item Count Badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
            <ListIcon size={12} className="text-primary" />
            {list._count.items}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow relative">
           {/* Accent Line */}
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-primary/50 transition-all duration-500" />

          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {list.name}
          </h3>
          
          <div className="flex justify-between items-end mt-auto">
            <div className="text-sm text-gray-400 flex items-center gap-1">
               {isOwner ? (
                 <span className="text-accent">Tu lista</span>
               ) : (
                 list.createdBy && (
                   <>
                     <span className="opacity-50">por</span>
                     <span className="text-white/80 hover:text-white">@{list.createdBy.username}</span>
                   </>
                 )
               )}
            </div>
            <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">
              Ver colección →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// --- Main Component ---

export default function ListsPageClient({
  user,
  featuredLists,
  officialLists,
  userLists,
  myLists
}: ListsPageClientProps) {
  const { t } = useLanguage()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="flex-1 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-2xl md:text-4xl font-title font-black text-white mb-1 md:mb-2">
            {t.lists.title.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">{t.lists.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-lg">
            {t.lists.description}
          </p>
        </div>

        {user ? (
          <Link
            href="/lists/new"
            className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_-5px_rgba(225,6,44,0.4)] hover:shadow-[0_0_30px_-5px_rgba(225,6,44,0.6)]"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            {t.lists.createNew}
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-full transition-colors"
          >
            {t.lists.loginToCreate}
          </Link>
        )}
      </div>

      <motion.div 
        className="space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Featured Lists */}
        {featuredLists.length > 0 && (
          <motion.section variants={sectionVariants}>
            <SectionHeader title={t.lists.featured} icon={Award} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLists.map(list => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </motion.section>
        )}

        {/* My Lists */}
        {myLists.length > 0 && (
          <motion.section variants={sectionVariants}>
            <SectionHeader title={t.lists.myLists} icon={UserIcon} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myLists.map(list => (
                <ListCard key={list.id} list={list} isOwner />
              ))}
            </div>
          </motion.section>
        )}

        {/* Official Lists */}
        {officialLists.length > 0 && (
          <motion.section variants={sectionVariants}>
            <SectionHeader title={t.lists.official} icon={ListIcon} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {officialLists.map(list => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Community Lists */}
        {userLists.length > 0 && (
          <motion.section variants={sectionVariants}>
            <SectionHeader title={t.lists.community} icon={Users} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userLists.map(list => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {featuredLists.length === 0 && officialLists.length === 0 && userLists.length === 0 && myLists.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-uiBase/30">
            <ListIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t.lists.noLists}</h3>
            <p className="text-gray-500">{t.lists.beFirst}</p>
          </div>
        )}

      </motion.div>
    </div>
  )
}
